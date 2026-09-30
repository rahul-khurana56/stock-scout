const fs = require("fs");
const path = require("path");
const { saveTradeToDb, getFullRiskProfile, initDb } = require("./db");

const contractNoteTrades = [
  {
    id: "trade_20260930_0923_sensex_72700pe",
    symbol: "SENSEX 01 OCT 72700 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 1000,
    tradeDate: "2026-09-30",
    entryTime: "09:23",
    exitTime: "09:31",
    entryPrice: 307.60,
    exitPrice: 315.20,
    pnl: 7605.00,
    pnlPct: 2.47,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "SENSEX 72700 PE scalp at market open. Bought 1000 @ 307.60, booked profit @ 315.20. Smooth execution.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1030_nifty_22800pe",
    symbol: "NIFTY 06 OCT 22800 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 14235,
    tradeDate: "2026-09-30",
    entryTime: "10:30",
    exitTime: "13:41",
    entryPrice: 159.98,
    exitPrice: 154.28,
    pnl: -81207.75,
    pnlPct: -3.56,
    emotionTag: "ANXIOUS",
    mistakeTags: ["AVERAGING_LOSERS", "OVERTRADING", "REVENGE_TRADING"],
    disciplineFollowed: false,
    notes: "Heavy averaging on 22800 PE across 7 re-entries (10:30, 10:56, 11:17, 11:29, 11:37, 12:33, 13:37) as premium decayed. Slipped from early gains into heavy drawdown.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1235_nifty_22750pe",
    symbol: "NIFTY 06 OCT 22750 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 8320,
    tradeDate: "2026-09-30",
    entryTime: "12:35",
    exitTime: "14:16",
    entryPrice: 124.71,
    exitPrice: 124.15,
    pnl: -4680.00,
    pnlPct: -0.45,
    emotionTag: "IMPULSIVE",
    mistakeTags: ["OVERTRADING"],
    disciplineFollowed: false,
    notes: "Multiple scalp attempts on 22750 PE during mid-day chop. Bought 8320 total qty, exited with minor loss.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1235_nifty_22750ce",
    symbol: "NIFTY 06 OCT 22750 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 9815,
    tradeDate: "2026-09-30",
    entryTime: "12:35",
    exitTime: "15:03",
    entryPrice: 128.00,
    exitPrice: 113.98,
    pnl: -137582.25,
    pnlPct: -10.95,
    emotionTag: "FRUSTRATED",
    mistakeTags: ["HOLDING_LOSERS", "AVERAGING_LOSERS", "OVERSIZED_POSITION"],
    disciplineFollowed: false,
    notes: "Major losing trade of the day. Bought 22750 CE at 12:35 (174 avg) and averaged heavily down to 92-109 levels. Trapped in afternoon breakdown, exited before close.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1237_nifty_22800ce",
    symbol: "NIFTY 06 OCT 22800 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 1755,
    tradeDate: "2026-09-30",
    entryTime: "12:37",
    exitTime: "12:49",
    entryPrice: 145.71,
    exitPrice: 166.21,
    pnl: 35980.75,
    pnlPct: 14.07,
    emotionTag: "CONFIDENT",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Well-timed bounce scalp on 22800 CE. Bought 1755 @ 145.71 and exited at 166.21 target (+20.5 pts).",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1344_nifty_22650pe",
    symbol: "NIFTY 06 OCT 22650 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 7020,
    tradeDate: "2026-09-30",
    entryTime: "13:44",
    exitTime: "15:17",
    entryPrice: 125.69,
    exitPrice: 123.37,
    pnl: -16256.50,
    pnlPct: -1.85,
    emotionTag: "ANXIOUS",
    mistakeTags: ["OVERTRADING", "CHASING"],
    disciplineFollowed: false,
    notes: "Afternoon put positions on 22650 strike. 4 rounds of entry/exit between 13:44 and 15:17.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1346_nifty_22700ce",
    symbol: "NIFTY 06 OCT 22700 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 2665,
    tradeDate: "2026-09-30",
    entryTime: "13:46",
    exitTime: "14:11",
    entryPrice: 172.51,
    exitPrice: 171.35,
    pnl: -3068.00,
    pnlPct: -0.67,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Quick scratch scalp on 22700 CE. Exited with minimal loss when momentum stalled.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1505_nifty_22700pe",
    symbol: "NIFTY 06 OCT 22700 PUT",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 3510,
    tradeDate: "2026-09-30",
    entryTime: "15:05",
    exitTime: "15:19",
    entryPrice: 163.66,
    exitPrice: 162.95,
    pnl: -2518.75,
    pnlPct: -0.43,
    emotionTag: "CALM",
    mistakeTags: [],
    disciplineFollowed: true,
    notes: "Late session scalp on 22700 PE. Fast exit before market close.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  },
  {
    id: "trade_20260930_1507_nifty_22600ce",
    symbol: "NIFTY 06 OCT 22600 CALL",
    side: "BUY",
    assetType: "OPTIONS",
    quantity: 3510,
    tradeDate: "2026-09-30",
    entryTime: "15:07",
    exitTime: "15:18",
    entryPrice: 169.52,
    exitPrice: 165.49,
    pnl: -14150.50,
    pnlPct: -2.38,
    emotionTag: "IMPULSIVE",
    mistakeTags: ["LATE_ENTRY", "OVERTRADING"],
    disciplineFollowed: false,
    notes: "Last hour bounce attempt on deep OTM 22600 CE. Caught on sudden selloff.",
    screenshots: [],
    source: "Groww Contract Note (CN/27/0119219177)"
  }
];

async function run() {
  console.log("🚀 Waiting 1.5s for DB connection...");
  await new Promise(r => setTimeout(r, 1500));

  console.log(`📦 Logging ${contractNoteTrades.length} trades from Groww Contract Note (30-Sep-2026)...`);
  
  let totalGrossPnl = 0;
  for (const trade of contractNoteTrades) {
    trade.createdAt = new Date("2026-09-30T" + trade.exitTime + ":00.000Z").toISOString();
    await saveTradeToDb(trade);
    totalGrossPnl += trade.pnl;
    console.log(`✅ [${trade.tradeDate} ${trade.entryTime}-${trade.exitTime}] ${trade.symbol.padEnd(25)} Qty: ${String(trade.quantity).padStart(5)} | PnL: ₹${trade.pnl.toFixed(2)}`);
  }

  console.log("\n--------------------------------------------------");
  console.log(`📊 Total Gross PnL from logged trades: ₹${totalGrossPnl.toFixed(2)}`);
  console.log(`🧾 Levies & Charges from Note: -₹19,885.07 (STT ₹11,145 + Exch ₹5,337.68 + Brok ₹1,860 + GST ₹1,298.30 + Stamp ₹229 + SEBI ₹15.08)`);
  console.log(`💰 Net Obligation: -₹235,763.07`);
  console.log("--------------------------------------------------\n");

  const full = await getFullRiskProfile();
  console.log(`🎉 Total trades in Journal now: ${full.journal.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
