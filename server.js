const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

loadEnvFile(path.join(__dirname, ".env"));

const { StockScoutScanner, timeframe, SCAN_INTERVAL_MS, providerConfig } = require("./scanner");
const { getNifty50Data, getBankNiftyData, getSectorsData, getSectorConstituentsData, getMarketPulse, enrichSignalsList, getOptionsScoutData, clearOptionsScoutData } = require("./market");

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const publicDir = __dirname;
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "signals.json");
const universeFile = path.join(dataDir, "universe.json");
const maxSignalsPerSide = 25;
const scannerStatus = {
  mode: "custom-scanner",
  timeframe,
  running: false,
  provider: providerConfig.primary,
  universeSize: 0,
  lastScanAt: null,
  lastCandleTime: null,
  lastSignalAt: null,
  errors: []
};
const fyersAuth = {
  connected: Boolean(providerConfig.fyers.accessToken),
  connectedAt: null,
  error: null
};

const riskFile = path.join(dataDir, "risk_profile.json");

const defaultRiskProfile = {
  settings: {
    accountCapital: 200000,
    riskPerTradePct: 1.0,
    fixedRiskAmount: 2000,
    useFixedAmount: false,
    maxDailyLoss: 5000,
    maxDailyTrades: 4,
    maxConsecutiveLosses: 2,
    cooldownMinutes: 15,
    lockoutEnabled: true
  },
  dailyState: {
    date: new Date().toISOString().slice(0, 10),
    realizedPnl: 0,
    tradesCount: 0,
    consecutiveLosses: 0,
    cooldownUntil: null,
    isLockedOut: false,
    lockoutReason: null
  },
  journal: []
};

ensureStore();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify({ updatedAt: new Date().toISOString(), signals: [] }, null, 2)
    );
  }
  if (!fs.existsSync(universeFile)) {
    fs.writeFileSync(universeFile, JSON.stringify({ symbols: [] }, null, 2));
  }
  if (!fs.existsSync(riskFile)) {
    fs.writeFileSync(riskFile, JSON.stringify(defaultRiskProfile, null, 2));
  }
}

function loadRiskProfile() {
  ensureStore();
  try {
    const data = JSON.parse(fs.readFileSync(riskFile, "utf8"));
    const today = new Date().toISOString().slice(0, 10);
    // Auto-rollover daily state if date changed
    if (!data.dailyState || data.dailyState.date !== today) {
      data.dailyState = {
        date: today,
        realizedPnl: 0,
        tradesCount: 0,
        consecutiveLosses: 0,
        cooldownUntil: null,
        isLockedOut: false,
        lockoutReason: null
      };
      saveRiskProfile(data);
    }
    return {
      settings: { ...defaultRiskProfile.settings, ...(data.settings || {}) },
      dailyState: { ...defaultRiskProfile.dailyState, ...(data.dailyState || {}) },
      journal: Array.isArray(data.journal) ? data.journal : []
    };
  } catch (error) {
    return { ...defaultRiskProfile };
  }
}

function saveRiskProfile(payload) {
  ensureStore();
  fs.writeFileSync(riskFile, JSON.stringify(payload, null, 2));
}

function loadUniverse() {
  ensureStore();
  try {
    const payload = JSON.parse(fs.readFileSync(universeFile, "utf8"));
    return Array.isArray(payload.symbols) ? payload.symbols : [];
  } catch (error) {
    return [];
  }
}

function normalizeSymbols(symbols) {
  return [...new Set((Array.isArray(symbols) ? symbols : [])
    .flatMap((symbol) => String(symbol).split(/[\s,]+/))
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9&-]{1,30}$/.test(symbol)))];
}

function saveUniverse(symbols) {
  fs.writeFileSync(universeFile, JSON.stringify({ symbols, updatedAt: new Date().toISOString() }, null, 2));
}

function loadStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (error) {
    return { updatedAt: new Date().toISOString(), signals: [] };
  }
}

function saveStore(payload) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2));
}

function normalizeSignal(signal) {
  const symbol = String(signal.symbol || signal.stock || "").trim().toUpperCase();
  if (!symbol) {
    return null;
  }

  return {
    id: String(signal.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    symbol,
    side: String(signal.side || "").toLowerCase() === "sell" ? "sell" : "buy",
    time: signal.time ? new Date(signal.time).toISOString() : new Date().toISOString(),
    source: signal.source || "TradingView webhook"
  };
}

function pruneSignals(signals) {
  const grouped = { buy: [], sell: [] };

  for (const signal of signals.sort((a, b) => new Date(b.time) - new Date(a.time))) {
    if (grouped[signal.side].length < maxSignalsPerSide) {
      grouped[signal.side].push(signal);
    }
  }

  return [...grouped.buy, ...grouped.sell].sort((a, b) => new Date(b.time) - new Date(a.time));
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload));
}

function getFyersConfig() {
  return {
    clientId: process.env.FYERS_CLIENT_ID || "EXIRSLVFQT-100",
    secretId: process.env.FYERS_SECRET_ID || "P8J78PENO0",
    redirectUri: process.env.FYERS_REDIRECT_URI || "https://trade.fyers.in/api-login/redirect-uri/index.html"
  };
}

function getFyersLoginUrl() {
  const { clientId, redirectUri } = getFyersConfig();
  if (!clientId) {
    throw new Error("FYERS_CLIENT_ID is missing from stock-scout/.env");
  }
  const url = new URL("https://api-t1.fyers.in/api/v3/generate-authcode");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", crypto.randomUUID());
  return url.toString();
}

function extractAuthCode(input) {
  let str = String(input || "").trim();
  if (!str) return "";
  
  if (str.includes("auth_code=")) {
    const match = str.match(/[?&]?auth_code=([^&\s#]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  
  if (str.includes("code=") && !str.includes("code=200")) {
    const match = str.match(/[?&]?code=([^&\s#]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.auth_code || parsed.code) return String(parsed.auth_code || parsed.code).trim();
    } catch (e) {}
  }

  return str;
}

async function exchangeFyersAuthCode(rawAuthCode) {
  const authCode = extractAuthCode(rawAuthCode);
  if (!authCode) {
    throw new Error("Invalid or empty auth code received. Please paste the full redirect URL or auth_code.");
  }

  const { clientId, secretId } = getFyersConfig();
  if (!clientId || !secretId) {
    throw new Error("FYERS_CLIENT_ID and FYERS_SECRET_ID must be set in stock-scout/.env");
  }

  const appIdHash = crypto.createHash("sha256").update(`${clientId}:${secretId}`).digest("hex");
  
  console.log(`[FYERS Auth] Exchanging auth code (length: ${authCode.length})...`);
  
  const response = await fetch("https://api-t1.fyers.in/api/v3/validate-authcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      appIdHash,
      code: authCode
    })
  });
  const payload = await response.json().catch(() => ({}));
  console.log(`[FYERS Auth] Response status: ${response.status}`, payload);

  if (!response.ok || payload.s !== "ok" || !payload.access_token) {
    const msg = payload.message || payload.error || (payload.s === "error" ? `FYERS Error: ${payload.message || 'Invalid or expired auth code'}` : `FYERS token exchange failed (${response.status})`);
    throw new Error(msg);
  }

  // Tokens are intentionally kept in memory only and are not written to disk.
  providerConfig.fyers.accessToken = payload.access_token;
  fyersAuth.connected = true;
  fyersAuth.connectedAt = new Date().toISOString();
  fyersAuth.error = null;
  console.log("[FYERS Auth] Successfully connected! Access token established.");
}

const scanner = new StockScoutScanner({
  async onSignal(signal) {
    const store = loadStore();
    const payload = {
      updatedAt: new Date().toISOString(),
      signals: pruneSignals([signal, ...(store.signals || [])])
    };
    saveStore(payload);
  },
  onStatus(status) {
    Object.assign(scannerStatus, status);
  }
});

const savedUniverse = loadUniverse();
if (savedUniverse.length) {
  scanner.setUniverse(savedUniverse);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25_000_000) {
        reject(new Error("Body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveStatic(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    writeJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      writeJson(response, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    }[ext] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === "/api/market/nifty50" && request.method === "GET") {
    try {
      const data = await getNifty50Data();
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Nifty 50 data" });
    }
    return;
  }

  if (url.pathname === "/api/market/banknifty" && request.method === "GET") {
    try {
      const data = await getBankNiftyData();
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Bank Nifty data" });
    }
    return;
  }

  if (url.pathname === "/api/market/sectors" && request.method === "GET") {
    try {
      const data = await getSectorsData();
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Sectors data" });
    }
    return;
  }

  if (url.pathname === "/api/market/sector-constituents" && request.method === "GET") {
    try {
      const sectorId = url.searchParams.get("sector") || url.searchParams.get("id") || url.searchParams.get("name") || "NIFTY AUTO";
      const data = await getSectorConstituentsData(sectorId);
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Sector Constituents data" });
    }
    return;
  }

  if (url.pathname === "/api/market/pulse" && request.method === "GET") {
    try {
      const data = await getMarketPulse();
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Market Pulse" });
    }
    return;
  }

  if (url.pathname === "/api/market/options-scout" && request.method === "GET") {
    try {
      const forceRefresh = url.searchParams.get("refresh") === "true";
      const data = await getOptionsScoutData(forceRefresh);
      writeJson(response, 200, data);
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to fetch Options Scout data" });
    }
    return;
  }

  if (url.pathname === "/api/market/options-scout" && request.method === "DELETE") {
    try {
      const data = clearOptionsScoutData();
      writeJson(response, 200, { ok: true, message: "Option Scout board cleared", data });
    } catch (err) {
      writeJson(response, 500, { error: err.message || "Failed to clear Options Scout data" });
    }
    return;
  }

  if (url.pathname === "/api/signals" && request.method === "GET") {
    try {
      const store = loadStore();
      const enrichedSignals = await enrichSignalsList(store.signals || []);
      writeJson(response, 200, {
        updatedAt: store.updatedAt || new Date().toISOString(),
        signals: enrichedSignals
      });
    } catch (err) {
      writeJson(response, 200, loadStore());
    }
    return;
  }

  if ((url.pathname === "/api/health" || url.pathname === "/api/status" || url.pathname === "/healthz") && request.method === "GET") {
    writeJson(response, 200, {
      status: "ok",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (url.pathname === "/api/scanner/status" && request.method === "GET") {
    writeJson(response, 200, scannerStatus);
    return;
  }

  if (url.pathname === "/api/fyers/status" && request.method === "GET") {
    const { clientId, secretId, redirectUri } = getFyersConfig();
    writeJson(response, 200, {
      configured: Boolean(clientId && secretId),
      connected: fyersAuth.connected,
      connectedAt: fyersAuth.connectedAt,
      error: fyersAuth.error,
      redirectUri
    });
    return;
  }

  if (url.pathname === "/api/fyers/login-url" && request.method === "GET") {
    try {
      writeJson(response, 200, { url: getFyersLoginUrl() });
    } catch (error) {
      writeJson(response, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/fyers/token" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const authCode = String(parsed.authCode || "").trim();
      if (!authCode) {
        writeJson(response, 400, { error: "Paste the auth_code returned by FYERS" });
        return;
      }
      await exchangeFyersAuthCode(authCode);
      writeJson(response, 200, { ok: true, connectedAt: fyersAuth.connectedAt });
    } catch (error) {
      fyersAuth.connected = false;
      fyersAuth.error = error.message;
      writeJson(response, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/universe" && request.method === "GET") {
    writeJson(response, 200, { symbols: scanner.getUniverse(), updatedAt: loadStore().updatedAt });
    return;
  }

  if (url.pathname === "/api/universe" && request.method === "PUT") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const symbols = normalizeSymbols(parsed.symbols);
      if (!symbols.length) {
        writeJson(response, 400, { error: "Provide at least one valid symbol" });
        return;
      }
      scanner.setUniverse(symbols);
      saveUniverse(symbols);
      writeJson(response, 200, { symbols, count: symbols.length });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Invalid universe payload" });
    }
    return;
  }

  if (url.pathname === "/api/scanner/start" && request.method === "POST") {
    scanner.start().catch((error) => {
      scannerStatus.errors = [error.message];
    });
    writeJson(response, 200, { ok: true, status: scannerStatus });
    return;
  }

  if (url.pathname === "/api/scanner/stop" && request.method === "POST") {
    scanner.stop();
    writeJson(response, 200, { ok: true, status: scannerStatus });
    return;
  }

  if (url.pathname === "/api/signals" && request.method === "DELETE") {
    const payload = { updatedAt: new Date().toISOString(), signals: [] };
    saveStore(payload);
    writeJson(response, 200, payload);
    return;
  }

  if (url.pathname === "/api/signals" && request.method === "PUT") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const signals = Array.isArray(parsed.signals) ? parsed.signals.map(normalizeSignal).filter(Boolean) : [];
      const payload = {
        updatedAt: new Date().toISOString(),
        signals: pruneSignals(signals)
      };
      saveStore(payload);
      writeJson(response, 200, payload);
    } catch (error) {
      writeJson(response, 400, { error: "Invalid signals payload" });
    }
    return;
  }

  if (url.pathname === "/api/webhook" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const signal = normalizeSignal(parsed);

      if (!signal) {
        writeJson(response, 400, { error: "Signal must include a symbol" });
        return;
      }

      const store = loadStore();
      const payload = {
        updatedAt: new Date().toISOString(),
        signals: pruneSignals([signal, ...(store.signals || [])])
      };
      saveStore(payload);
      writeJson(response, 200, { ok: true, signal, updatedAt: payload.updatedAt });
    } catch (error) {
      writeJson(response, 400, { error: "Invalid webhook payload" });
    }
    return;
  }

  if (url.pathname === "/api/risk/profile" && request.method === "GET") {
    const profile = loadRiskProfile();
    writeJson(response, 200, profile);
    return;
  }

  if (url.pathname === "/api/risk/profile" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const current = loadRiskProfile();

      if (parsed.settings) {
        current.settings = {
          ...current.settings,
          ...parsed.settings
        };
      }
      if (parsed.dailyState) {
        current.dailyState = {
          ...current.dailyState,
          ...parsed.dailyState
        };
      }

      saveRiskProfile(current);
      writeJson(response, 200, current);
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to update risk profile" });
    }
    return;
  }

  if (url.pathname === "/api/risk/journal" && request.method === "GET") {
    const profile = loadRiskProfile();
    writeJson(response, 200, {
      journal: profile.journal,
      dailyState: profile.dailyState,
      settings: profile.settings
    });
    return;
  }

  if (url.pathname === "/api/risk/journal" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const profile = loadRiskProfile();

      const trade = {
        id: parsed.id || `trade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        symbol: String(parsed.symbol || "").toUpperCase().trim(),
        side: String(parsed.side || "BUY").toUpperCase(),
        assetType: parsed.assetType || "EQUITY",
        entryPrice: Number(parsed.entryPrice) || 0,
        exitPrice: Number(parsed.exitPrice) || 0,
        quantity: Number(parsed.quantity) || 0,
        slPrice: Number(parsed.slPrice) || 0,
        targetPrice: Number(parsed.targetPrice) || 0,
        pnl: Number(parsed.pnl) || 0,
        pnlPct: Number(parsed.pnlPct) || 0,
        emotionTag: parsed.emotionTag || "CALM",
        mistakeTags: Array.isArray(parsed.mistakeTags) ? parsed.mistakeTags : [],
        disciplineFollowed: parsed.disciplineFollowed !== undefined ? Boolean(parsed.disciplineFollowed) : true,
        notes: String(parsed.notes || "").trim(),
        screenshots: Array.isArray(parsed.screenshots) ? parsed.screenshots : [],
        source: parsed.source || "Profit GeNIE",
        createdAt: parsed.createdAt || new Date().toISOString()
      };

      profile.journal = [trade, ...profile.journal.filter((t) => t.id !== trade.id)];

      // Update Daily State
      const isToday = trade.createdAt.slice(0, 10) === profile.dailyState.date;
      if (isToday) {
        profile.dailyState.tradesCount += 1;
        profile.dailyState.realizedPnl = Math.round((profile.dailyState.realizedPnl + trade.pnl) * 100) / 100;

        if (trade.pnl < 0) {
          profile.dailyState.consecutiveLosses += 1;
          // Set cooldown period
          const cooldownMs = (profile.settings.cooldownMinutes || 15) * 60 * 1000;
          profile.dailyState.cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();

          // Check if consecutive losses threshold reached
          if (profile.dailyState.consecutiveLosses >= (profile.settings.maxConsecutiveLosses || 2)) {
            profile.dailyState.isLockedOut = true;
            profile.dailyState.lockoutReason = `Hit ${profile.dailyState.consecutiveLosses} consecutive losses rule limit. Step away from terminal.`;
          }
        } else {
          profile.dailyState.consecutiveLosses = 0;
          profile.dailyState.cooldownUntil = null;
        }

        // Check if daily max loss threshold reached
        const maxDailyLoss = Number(profile.settings.maxDailyLoss || 5000);
        if (profile.dailyState.realizedPnl <= -Math.abs(maxDailyLoss)) {
          profile.dailyState.isLockedOut = true;
          profile.dailyState.lockoutReason = `Daily Max Loss limit of -₹${Math.abs(maxDailyLoss).toLocaleString("en-IN")} breached. Hard lockout active.`;
        }

        // Check if max daily trades quota reached
        const maxTrades = Number(profile.settings.maxDailyTrades || 4);
        if (profile.dailyState.tradesCount >= maxTrades) {
          profile.dailyState.isLockedOut = true;
          profile.dailyState.lockoutReason = `Max daily trade quota of ${maxTrades} trades reached. Session complete.`;
        }
      }

      saveRiskProfile(profile);
      writeJson(response, 200, { ok: true, trade, dailyState: profile.dailyState, settings: profile.settings });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to log trade" });
    }
    return;
  }

  if (url.pathname === "/api/risk/journal" && request.method === "DELETE") {
    try {
      const parsedUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const tradeId = parsedUrl.searchParams.get("id");
      const profile = loadRiskProfile();

      if (tradeId) {
        profile.journal = profile.journal.filter((t) => t.id !== tradeId);
      } else {
        profile.journal = [];
      }

      saveRiskProfile(profile);
      writeJson(response, 200, { ok: true, remaining: profile.journal.length });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to delete trade" });
    }
    return;
  }

  if (url.pathname === "/api/risk/reset-daily" && request.method === "POST") {
    try {
      const profile = loadRiskProfile();
      profile.dailyState = {
        date: new Date().toISOString().slice(0, 10),
        realizedPnl: 0,
        tradesCount: 0,
        consecutiveLosses: 0,
        cooldownUntil: null,
        isLockedOut: false,
        lockoutReason: null
      };
      saveRiskProfile(profile);
      writeJson(response, 200, { ok: true, dailyState: profile.dailyState });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to reset daily risk state" });
    }
    return;
  }

  serveStatic(url.pathname, response);
});

server.listen(port, host, () => {
  console.log(`Profit GeNIE server running at http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  console.log(`Scanner interval ${SCAN_INTERVAL_MS / 1000}s watching Nifty 50 + Nifty Next 50 on ${timeframe}`);
  console.log(`Primary market-data provider: ${providerConfig.primary}`);
});
