const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(dataDir, "uploads");
const jsonFile = path.join(dataDir, "risk_profile.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

let pgPool = null;
const databaseUrl = process.env.DATABASE_URL || "";

if (databaseUrl) {
  try {
    const { Pool } = require("pg");
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
    });
    console.log("🐘 Connected to Cloud PostgreSQL database!");
    initPostgresSchema();
  } catch (err) {
    console.warn("⚠️ Failed to initialize PostgreSQL pool, falling back to local JSON DB:", err.message);
    pgPool = null;
  }
}

async function initPostgresSchema() {
  if (!pgPool) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS risk_journal (
        id VARCHAR(100) PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        asset_type VARCHAR(30) DEFAULT 'OPTIONS',
        quantity NUMERIC DEFAULT 0,
        trade_date VARCHAR(20),
        entry_time VARCHAR(20),
        exit_time VARCHAR(20),
        entry_price NUMERIC DEFAULT 0,
        exit_price NUMERIC DEFAULT 0,
        pnl NUMERIC DEFAULT 0,
        pnl_pct NUMERIC DEFAULT 0,
        emotion_tag VARCHAR(30) DEFAULT 'CALM',
        mistake_tags JSONB DEFAULT '[]'::jsonb,
        discipline_followed BOOLEAN DEFAULT true,
        notes TEXT DEFAULT '',
        screenshots JSONB DEFAULT '[]'::jsonb,
        source VARCHAR(50) DEFAULT 'Profit GeNIE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS risk_settings (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ PostgreSQL schema initialized successfully (risk_journal & risk_settings tables ready).");
  } catch (err) {
    console.error("❌ Error initializing PostgreSQL schema:", err.message);
  }
}

// Fallback JSON Loader
function loadLocalJsonProfile() {
  try {
    if (fs.existsSync(jsonFile)) {
      const raw = fs.readFileSync(jsonFile, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading risk_profile.json:", e.message);
  }
  return { settings: {}, dailyState: {}, journal: [] };
}

function saveLocalJsonProfile(profile) {
  try {
    fs.writeFileSync(jsonFile, JSON.stringify(profile, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing risk_profile.json:", e.message);
  }
}

// Unified Database API
async function getFullRiskProfile() {
  if (pgPool) {
    try {
      const settingsRes = await pgPool.query("SELECT data FROM risk_settings WHERE id = 'main'");
      const journalRes = await pgPool.query("SELECT * FROM risk_journal ORDER BY trade_date DESC, created_at DESC");

      const settings = settingsRes.rows.length ? settingsRes.rows[0].data : {};
      const journal = journalRes.rows.map(r => ({
        id: r.id,
        symbol: r.symbol,
        side: r.side,
        assetType: r.asset_type,
        quantity: Number(r.quantity) || 0,
        tradeDate: r.trade_date,
        entryTime: r.entry_time,
        exitTime: r.exit_time,
        entryPrice: Number(r.entry_price) || 0,
        exitPrice: Number(r.exit_price) || 0,
        pnl: Number(r.pnl) || 0,
        pnlPct: Number(r.pnl_pct) || 0,
        emotionTag: r.emotion_tag,
        mistakeTags: Array.isArray(r.mistake_tags) ? r.mistake_tags : [],
        disciplineFollowed: r.discipline_followed,
        notes: r.notes || "",
        screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
        source: r.source || "Profit GeNIE",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      return { settings, journal };
    } catch (err) {
      console.warn("PostgreSQL getFullRiskProfile failed, falling back to JSON:", err.message);
    }
  }

  return loadLocalJsonProfile();
}

async function saveTradeToDb(trade) {
  if (pgPool) {
    try {
      const query = `
        INSERT INTO risk_journal (
          id, symbol, side, asset_type, quantity, trade_date, entry_time, exit_time,
          entry_price, exit_price, pnl, pnl_pct, emotion_tag, mistake_tags,
          discipline_followed, notes, screenshots, source, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          symbol = EXCLUDED.symbol,
          side = EXCLUDED.side,
          asset_type = EXCLUDED.asset_type,
          quantity = EXCLUDED.quantity,
          trade_date = EXCLUDED.trade_date,
          entry_time = EXCLUDED.entry_time,
          exit_time = EXCLUDED.exit_time,
          entry_price = EXCLUDED.entry_price,
          exit_price = EXCLUDED.exit_price,
          pnl = EXCLUDED.pnl,
          pnl_pct = EXCLUDED.pnl_pct,
          emotion_tag = EXCLUDED.emotion_tag,
          mistake_tags = EXCLUDED.mistake_tags,
          discipline_followed = EXCLUDED.discipline_followed,
          notes = EXCLUDED.notes,
          screenshots = EXCLUDED.screenshots,
          source = EXCLUDED.source,
          updated_at = NOW();
      `;

      await pgPool.query(query, [
        trade.id,
        trade.symbol,
        trade.side,
        trade.assetType || "OPTIONS",
        trade.quantity || 0,
        trade.tradeDate || new Date().toISOString().slice(0, 10),
        trade.entryTime || "",
        trade.exitTime || "",
        trade.entryPrice || 0,
        trade.exitPrice || 0,
        trade.pnl || 0,
        trade.pnlPct || 0,
        trade.emotionTag || "CALM",
        JSON.stringify(trade.mistakeTags || []),
        trade.disciplineFollowed !== false,
        trade.notes || "",
        JSON.stringify(trade.screenshots || []),
        trade.source || "Profit GeNIE",
        trade.createdAt || new Date().toISOString()
      ]);
      console.log(`💾 Saved trade ${trade.symbol} (${trade.id}) to Cloud PostgreSQL!`);
    } catch (err) {
      console.error("PostgreSQL saveTradeToDb error:", err.message);
    }
  }

  // Always keep JSON mirror in sync
  const local = loadLocalJsonProfile();
  local.journal = [trade, ...(local.journal || []).filter(t => t.id !== trade.id)];
  saveLocalJsonProfile(local);
  return trade;
}

async function deleteTradeFromDb(tradeId) {
  if (pgPool) {
    try {
      if (tradeId) {
        await pgPool.query("DELETE FROM risk_journal WHERE id = $1", [tradeId]);
      } else {
        await pgPool.query("DELETE FROM risk_journal");
      }
    } catch (err) {
      console.error("PostgreSQL deleteTrade error:", err.message);
    }
  }

  const local = loadLocalJsonProfile();
  if (tradeId) {
    local.journal = (local.journal || []).filter(t => t.id !== tradeId);
  } else {
    local.journal = [];
  }
  saveLocalJsonProfile(local);
}

// Dedicated Screenshot Storage Handler (Saves image to disk & returns URL)
function saveScreenshotFile(base64Data, tradeId = "trade") {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data; // already a URL
    }

    const ext = matches[1].split("/")[1] || "jpg";
    const buffer = Buffer.from(matches[2], "base64");
    const filename = `${tradeId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Error saving screenshot file:", err.message);
    return base64Data;
  }
}

module.exports = {
  getFullRiskProfile,
  saveTradeToDb,
  deleteTradeFromDb,
  saveScreenshotFile,
  uploadsDir,
  isPostgresConnected: () => Boolean(pgPool)
};
