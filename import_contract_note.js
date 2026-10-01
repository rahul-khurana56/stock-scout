const fs = require("fs");
const path = require("path");
const { saveTradeToDb, getFullRiskProfile } = require("./db");

const contractNoteTrades = [
  {
    id: "trade_20261001_0921_nifty_22600pe",
    symbol: "NIFTY 06 OCT 22600 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 1950,
    tradeDate: "2026-10-01",
    entryTime: "09:21",
    exitTime: "09:22",
    entryPrice: 144.42,
    exitPrice: 148.80,
    pnl: 8537.75,
    pnlPct: 3.03,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Morning opening scalp on 22600 PE. Bought 1950 @ 144.42, booked quick profit @ 148.80 (+3.03%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_0935_nifty_22500pe",
    symbol: "NIFTY 06 OCT 22500 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 2990,
    tradeDate: "2026-10-01",
    entryTime: "09:35",
    exitTime: "09:36",
    entryPrice: 98.29,
    exitPrice: 99.57,
    pnl: 3818.75,
    pnlPct: 1.30,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Fast scalp on 22500 PE. Bought 2990 @ 98.29, squared off @ 99.57 (+1.30%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_1115_banknifty_55000pe",
    symbol: "BANKNIFTY 27 OCT 55000 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 390,
    tradeDate: "2026-10-01",
    entryTime: "11:15",
    exitTime: "11:21",
    entryPrice: 784.15,
    exitPrice: 798.79,
    pnl: 5709.00,
    pnlPct: 1.87,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "BankNifty monthly PE scalp. Bought 390 @ 784.15 during pullback, exited @ 798.79 (+1.87%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_1213_nifty_22550ce",
    symbol: "NIFTY 06 OCT 22550 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 3900,
    tradeDate: "2026-10-01",
    entryTime: "12:13",
    exitTime: "12:18",
    entryPrice: 124.81,
    exitPrice: 119.59,
    pnl: -20348.25,
    pnlPct: -4.18,
    emotionTag: "ANXIOUS",
    mistakeTags: ["CHASING", "OVERTRADING"],
    disciplineFollowed: false,
    notes: "Attempted breakout buy on 22550 CE across 2 attempts. Market reversed; stopped out @ 119.59 (-4.18%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_0945_nifty_22550pe",
    symbol: "NIFTY 06 OCT 22550 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 14950,
    tradeDate: "2026-10-01",
    entryTime: "09:45",
    exitTime: "12:43",
    entryPrice: 129.61,
    exitPrice: 132.77,
    pnl: 47222.50,
    pnlPct: 2.44,
    emotionTag: "CONFIDENT",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Star performer of the day. Multiple swing and scalp waves on 22550 PE capturing intraday breakdowns up to 165. Total profit: +₹47,222.50 (+2.44%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_1253_nifty_22300ce",
    symbol: "NIFTY 06 OCT 22300 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 1950,
    tradeDate: "2026-10-01",
    entryTime: "12:53",
    exitTime: "13:02",
    entryPrice: 186.90,
    exitPrice: 195.64,
    pnl: 17043.00,
    pnlPct: 4.68,
    emotionTag: "CONFIDENT",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Sharp bounce scalp on deep ITM 22300 CE. Bought 1950 @ 186.90 during bottom consolidation, exited cleanly @ 195.64 (+4.68%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  },
  {
    id: "trade_20261001_1333_nifty_22250ce",
    symbol: "NIFTY 06 OCT 22250 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 2600,
    tradeDate: "2026-10-01",
    entryTime: "13:33",
    exitTime: "14:51",
    entryPrice: 224.14,
    exitPrice: 228.54,
    pnl: 11427.00,
    pnlPct: 1.96,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Two controlled ITM scalping waves on 22250 CE (13:33 scalp and 14:50 afternoon push). Total profit: +₹11,427.00 (+1.96%).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0120572315)"
  }
];

async function run() {
  console.log("🚀 Waiting 1.5s for DB connection...");
  await new Promise(r => setTimeout(r, 1500));

  console.log(`📦 Logging ${contractNoteTrades.length} trades from Groww Contract Note (01-Oct-2026)...`);
  
  let totalGrossPnl = 0;
  for (const trade of contractNoteTrades) {
    trade.createdAt = new Date("2026-10-01T" + trade.exitTime + ":00.000Z").toISOString();
    await saveTradeToDb(trade);
    totalGrossPnl += trade.pnl;
    console.log(`✅ [${trade.tradeDate} ${trade.entryTime}-${trade.exitTime}] ${trade.symbol.padEnd(28)} Qty: ${String(trade.quantity).padStart(5)} | PnL: ₹${trade.pnl.toFixed(2)}`);
  }

  // Update daily state in local profile if needed
  try {
    const jsonFile = path.join(__dirname, "data", "risk_profile.json");
    if (fs.existsSync(jsonFile)) {
      const profile = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
      profile.dailyState = {
        date: "2026-10-01",
        realizedPnl: Math.round(totalGrossPnl * 100) / 100,
        tradesCount: contractNoteTrades.length,
        consecutiveLosses: 0,
        cooldownUntil: null,
        isLockedOut: false,
        lockoutReason: null
      };
      fs.writeFileSync(jsonFile, JSON.stringify(profile, null, 2), "utf8");
    }
  } catch (e) {
    console.error("Error updating daily state in risk_profile.json:", e.message);
  }

  console.log("\n--------------------------------------------------");
  console.log(`📊 Total Gross PnL from logged trades: ₹${totalGrossPnl.toFixed(2)}`);
  console.log(`🧾 Levies & Charges from Note: -₹11,759.06 (STT ₹6,490 + Exch ₹3,048.24 + Brok ₹1,300 + GST ₹784.23 + Stamp ₹128 + SEBI ₹8.58 + IPFT ₹0.01)`);
  console.log(`💰 Net Obligation Receivable: +₹61,650.69`);
  console.log("--------------------------------------------------\n");

  const full = await getFullRiskProfile();
  console.log(`🎉 Total trades in Journal now: ${full.journal.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
