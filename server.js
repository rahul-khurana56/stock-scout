const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

loadEnvFile(path.join(__dirname, ".env"));

const { StockScoutScanner, timeframe, SCAN_INTERVAL_MS, providerConfig } = require("./scanner");
const { getNifty50Data, getBankNiftyData, getSectorsData, getSectorConstituentsData, getMarketPulse, enrichSignalsList, getOptionsScoutData, clearOptionsScoutData, getStockQuote, getOptionChain, searchInstruments } = require("./market");

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
const practiceFile = path.join(dataDir, "practice_trading.json");

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

const defaultPracticeTradingProfile = {
  account: {
    virtualBalance: 1000000,
    initialFunding: 1000000,
    currency: "INR",
    updatedAt: new Date().toISOString()
  },
  positions: [],
  holdings: [],
  orders: [],
  tradeHistory: []
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
  if (!fs.existsSync(practiceFile)) {
    fs.writeFileSync(practiceFile, JSON.stringify(defaultPracticeTradingProfile, null, 2));
  }
}

function loadPracticeTrading() {
  ensureStore();
  try {
    const data = JSON.parse(fs.readFileSync(practiceFile, "utf8"));
    return {
      account: { ...defaultPracticeTradingProfile.account, ...(data.account || {}) },
      positions: Array.isArray(data.positions) ? data.positions : [],
      holdings: Array.isArray(data.holdings) ? data.holdings : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
      tradeHistory: Array.isArray(data.tradeHistory) ? data.tradeHistory : []
    };
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultPracticeTradingProfile));
  }
}

function savePracticeTrading(payload) {
  ensureStore();
  fs.writeFileSync(practiceFile, JSON.stringify(payload, null, 2));
}

function calculateGrowwCharges(side, product, turnover, pnl = 0) {
  const isIntraday = product === "INTRADAY";
  const rawBrokerage = Math.min(20, turnover * 0.0005);
  const brokerage = Math.max(0, Math.round(rawBrokerage * 100) / 100);
  
  let stt = 0;
  if (isIntraday) {
    if (side === "SELL") stt = Math.round(turnover * 0.00025 * 100) / 100;
  } else {
    stt = Math.round(turnover * 0.001 * 100) / 100;
  }

  const exchangeTxn = Math.round(turnover * 0.0000297 * 100) / 100;
  const sebiFee = Math.max(0.01, Math.round(turnover * 0.000001 * 100) / 100);

  let stampDuty = 0;
  if (side === "BUY") {
    stampDuty = Math.round(turnover * (isIntraday ? 0.00003 : 0.00015) * 100) / 100;
  }

  const gst = Math.round((brokerage + exchangeTxn + sebiFee) * 0.18 * 100) / 100;
  const totalCharges = Math.round((brokerage + stt + exchangeTxn + sebiFee + stampDuty + gst) * 100) / 100;

  return {
    brokerage,
    stt,
    exchangeTxn,
    gst,
    sebiFee,
    stampDuty,
    totalCharges
  };
}

async function evaluatePracticePortfolio(portfolio) {
  if (!portfolio) portfolio = loadPracticeTrading();
  let modified = false;

  const activePositions = [];
  const closedPositions = [];

  for (const pos of portfolio.positions) {
    try {
      const quote = await getStockQuote(pos.symbol);
      const currentPrice = quote && quote.price > 0 ? quote.price : pos.avgPrice;
      pos.currentPrice = currentPrice;
      pos.companyName = quote?.name || pos.companyName || pos.symbol;
      pos.dayChangePct = quote?.pChange || 0;

      const isBuy = pos.side === "BUY";
      const priceDiff = isBuy ? (currentPrice - pos.avgPrice) : (pos.avgPrice - currentPrice);
      pos.unrealizedPnl = Math.round(priceDiff * pos.qty * 100) / 100;
      pos.unrealizedPnlPct = Math.round(((priceDiff / pos.avgPrice) * 100) * 100) / 100;

      // Check Stop Loss Trigger
      let isSlHit = false;
      if (pos.slPrice > 0) {
        if (isBuy && currentPrice <= pos.slPrice) isSlHit = true;
        if (!isBuy && currentPrice >= pos.slPrice) isSlHit = true;
      }

      // Check Target Trigger
      let isTargetHit = false;
      if (pos.targetPrice > 0) {
        if (isBuy && currentPrice >= pos.targetPrice) isTargetHit = true;
        if (!isBuy && currentPrice <= pos.targetPrice) isTargetHit = true;
      }

      if (isSlHit || isTargetHit) {
        // Auto-close position
        const exitReason = isSlHit ? "STOP_LOSS_HIT" : "TARGET_HIT";
        const exitPrice = currentPrice;
        const exitTurnover = exitPrice * pos.qty;
        const exitCharges = calculateGrowwCharges(isBuy ? "SELL" : "BUY", pos.product, exitTurnover);
        const grossPnl = pos.unrealizedPnl;
        const netPnl = Math.round((grossPnl - (pos.entryCharges?.totalCharges || 0) - exitCharges.totalCharges) * 100) / 100;

        // Refund margin + net P&L back to virtual balance
        portfolio.account.virtualBalance = Math.max(0, Math.round((portfolio.account.virtualBalance + pos.investedMargin + grossPnl - exitCharges.totalCharges) * 100) / 100);

        portfolio.tradeHistory.unshift({
          id: `trd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol: pos.symbol,
          companyName: pos.companyName,
          side: pos.side,
          product: pos.product,
          qty: pos.qty,
          entryPrice: pos.avgPrice,
          exitPrice,
          grossPnl,
          grossPnlPct: pos.unrealizedPnlPct,
          charges: {
            entryCharges: pos.entryCharges || {},
            exitCharges,
            totalCharges: Math.round(((pos.entryCharges?.totalCharges || 0) + exitCharges.totalCharges) * 100) / 100
          },
          netPnl,
          exitReason,
          openedAt: pos.openedAt,
          closedAt: new Date().toISOString()
        });

        modified = true;
      } else {
        activePositions.push(pos);
      }
    } catch (err) {
      activePositions.push(pos);
    }
  }

  portfolio.positions = activePositions;

  // Evaluate Pending Orders
  const pendingOrders = [];
  for (const ord of portfolio.orders) {
    if (ord.status !== "PENDING") {
      pendingOrders.push(ord);
      continue;
    }

    try {
      const quote = await getStockQuote(ord.symbol);
      const currentPrice = quote && quote.price > 0 ? quote.price : ord.price;
      let shouldExecute = false;
      let execPrice = ord.price;

      if (ord.orderType === "MARKET") {
        shouldExecute = true;
        execPrice = currentPrice;
      } else if (ord.orderType === "LIMIT") {
        if (ord.side === "BUY" && currentPrice <= ord.price) {
          shouldExecute = true;
          execPrice = ord.price;
        } else if (ord.side === "SELL" && currentPrice >= ord.price) {
          shouldExecute = true;
          execPrice = ord.price;
        }
      } else if (ord.orderType === "SL" || ord.orderType === "SL-M") {
        if (ord.side === "BUY" && currentPrice >= ord.triggerPrice) {
          shouldExecute = true;
          execPrice = ord.orderType === "SL-M" ? currentPrice : ord.price;
        } else if (ord.side === "SELL" && currentPrice <= ord.triggerPrice) {
          shouldExecute = true;
          execPrice = ord.orderType === "SL-M" ? currentPrice : ord.price;
        }
      }

      if (shouldExecute) {
        const isIntraday = ord.product === "INTRADAY";
        const leverage = isIntraday ? 5 : 1;
        const totalExposure = execPrice * ord.qty;
        const requiredMargin = Math.round((totalExposure / leverage) * 100) / 100;
        const entryCharges = calculateGrowwCharges(ord.side, ord.product, totalExposure);

        if (portfolio.account.virtualBalance >= (requiredMargin + entryCharges.totalCharges)) {
          portfolio.account.virtualBalance = Math.round((portfolio.account.virtualBalance - requiredMargin - entryCharges.totalCharges) * 100) / 100;
          ord.status = "EXECUTED";
          ord.executedPrice = execPrice;
          ord.executedAt = new Date().toISOString();

          // Add to positions
          portfolio.positions.push({
            id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            symbol: ord.symbol,
            companyName: quote?.name || ord.symbol,
            side: ord.side,
            product: ord.product,
            qty: ord.qty,
            avgPrice: execPrice,
            currentPrice: execPrice,
            investedMargin: requiredMargin,
            totalExposure,
            slPrice: ord.slPrice || 0,
            targetPrice: ord.targetPrice || 0,
            unrealizedPnl: 0,
            unrealizedPnlPct: 0,
            entryCharges,
            openedAt: new Date().toISOString(),
            source: ord.source || "Groww Order"
          });
          modified = true;
        } else {
          ord.status = "REJECTED";
          ord.rejectReason = "Insufficient virtual margin";
          modified = true;
        }
      }
      pendingOrders.push(ord);
    } catch (err) {
      pendingOrders.push(ord);
    }
  }

  portfolio.orders = pendingOrders;

  // Calculate Aggregates
  let totalInvestedMargin = 0;
  let totalCurrentExposure = 0;
  let totalUnrealizedPnl = 0;

  for (const pos of portfolio.positions) {
    totalInvestedMargin += (pos.investedMargin || 0);
    totalCurrentExposure += (pos.currentPrice * pos.qty);
    totalUnrealizedPnl += (pos.unrealizedPnl || 0);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  let todayRealizedPnl = 0;
  let totalGrossPnl = 0;
  let totalNetPnl = 0;
  let winCount = 0;
  let lossCount = 0;
  let totalChargesPaid = 0;
  let bestTrade = 0;
  let worstTrade = 0;
  let winSum = 0;
  let lossSum = 0;

  for (const tr of portfolio.tradeHistory) {
    const isToday = tr.closedAt && tr.closedAt.startsWith(todayStr);
    if (isToday) {
      todayRealizedPnl += (tr.netPnl || 0);
    }
    totalGrossPnl += (tr.grossPnl || 0);
    totalNetPnl += (tr.netPnl || 0);
    totalChargesPaid += (tr.charges?.totalCharges || 0);

    if (tr.netPnl > 0) {
      winCount++;
      winSum += tr.netPnl;
    } else if (tr.netPnl < 0) {
      lossCount++;
      lossSum += Math.abs(tr.netPnl);
    }

    if (tr.netPnl > bestTrade) bestTrade = tr.netPnl;
    if (tr.netPnl < worstTrade) worstTrade = tr.netPnl;
  }

  const totalClosedTrades = portfolio.tradeHistory.length;
  const winRatePct = totalClosedTrades > 0 ? Math.round((winCount / totalClosedTrades) * 1000) / 10 : 0;
  const profitFactor = lossSum > 0 ? Math.round((winSum / lossSum) * 100) / 100 : winSum > 0 ? 99.9 : 0;

  const totalPortfolioValue = Math.round((portfolio.account.virtualBalance + totalInvestedMargin + totalUnrealizedPnl) * 100) / 100;
  const initialFunding = portfolio.account.initialFunding || 1000000;
  const totalReturns = Math.round((totalPortfolioValue - initialFunding) * 100) / 100;
  const totalReturnsPct = initialFunding > 0 ? Math.round(((totalReturns / initialFunding) * 100) * 100) / 100 : 0;

  portfolio.summary = {
    virtualBalance: Math.round(portfolio.account.virtualBalance * 100) / 100,
    investedMargin: Math.round(totalInvestedMargin * 100) / 100,
    totalPortfolioValue,
    totalUnrealizedPnl: Math.round(totalUnrealizedPnl * 100) / 100,
    todayRealizedPnl: Math.round(todayRealizedPnl * 100) / 100,
    totalReturns,
    totalReturnsPct,
    activePositionsCount: portfolio.positions.length,
    pendingOrdersCount: portfolio.orders.filter((o) => o.status === "PENDING").length,
    analytics: {
      totalTrades: totalClosedTrades,
      winningTrades: winCount,
      losingTrades: lossCount,
      winRatePct,
      profitFactor,
      totalGrossPnl: Math.round(totalGrossPnl * 100) / 100,
      totalChargesPaid: Math.round(totalChargesPaid * 100) / 100,
      totalNetPnl: Math.round(totalNetPnl * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100
    }
  };

  if (modified) {
    savePracticeTrading(portfolio);
  }

  return portfolio;
}

function recomputeDailyState(profile) {
  const today = new Date().toISOString().slice(0, 10);
  if (!profile.dailyState) profile.dailyState = {};
  profile.dailyState.date = today;

  const todayTrades = (profile.journal || []).filter((t) => {
    const d = t.tradeDate || (t.createdAt ? t.createdAt.slice(0, 10) : "");
    return d === today;
  });

  profile.dailyState.tradesCount = todayTrades.length;
  profile.dailyState.realizedPnl = Math.round(todayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) * 100) / 100;

  // Compute consecutive losses from latest trade backward
  let consecutiveLosses = 0;
  const sorted = [...todayTrades].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  for (const t of sorted) {
    if ((Number(t.pnl) || 0) < 0) consecutiveLosses++;
    else break;
  }
  profile.dailyState.consecutiveLosses = consecutiveLosses;

  const maxLoss = Number(profile.settings?.maxDailyLoss || 5000);
  const maxTrades = Number(profile.settings?.maxDailyTrades || 4);
  const maxConsecLosses = Number(profile.settings?.maxConsecutiveLosses || 2);

  if (profile.dailyState.realizedPnl <= -Math.abs(maxLoss)) {
    profile.dailyState.isLockedOut = true;
    profile.dailyState.lockoutReason = `Daily Max Loss limit of -₹${Math.abs(maxLoss).toLocaleString("en-IN")} reached.`;
  } else if (profile.dailyState.tradesCount >= maxTrades) {
    profile.dailyState.isLockedOut = true;
    profile.dailyState.lockoutReason = `Max daily trade quota of ${maxTrades} trades reached.`;
  } else if (consecutiveLosses >= maxConsecLosses) {
    profile.dailyState.isLockedOut = true;
    profile.dailyState.lockoutReason = `Hit ${consecutiveLosses} consecutive losses rule limit. Step away from terminal.`;
  } else if (profile.dailyState.lockoutReason && !profile.dailyState.lockoutReason.includes("Manual")) {
    profile.dailyState.isLockedOut = false;
    profile.dailyState.lockoutReason = null;
  }
  return profile.dailyState;
}

function loadRiskProfile() {
  ensureStore();
  try {
    const data = JSON.parse(fs.readFileSync(riskFile, "utf8"));
    const profile = {
      settings: { ...defaultRiskProfile.settings, ...(data.settings || {}) },
      dailyState: { ...defaultRiskProfile.dailyState, ...(data.dailyState || {}) },
      journal: Array.isArray(data.journal) ? data.journal : []
    };
    recomputeDailyState(profile);
    return profile;
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
        entryTime: parsed.entryTime ? String(parsed.entryTime).trim() : "",
        exitTime: parsed.exitTime ? String(parsed.exitTime).trim() : "",
        tradeDate: parsed.tradeDate ? String(parsed.tradeDate).trim() : "",
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

      // Recompute exact daily metrics from all today trades
      recomputeDailyState(profile);

      // If newly logged trade is a loss, trigger cooldown period
      if (trade.pnl < 0) {
        const cooldownMs = (profile.settings.cooldownMinutes || 15) * 60 * 1000;
        profile.dailyState.cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();
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

      recomputeDailyState(profile);
      saveRiskProfile(profile);
      writeJson(response, 200, { ok: true, remaining: profile.journal.length, dailyState: profile.dailyState });
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

  // --- PRACTICE TRADING (GROWW SIMULATOR) API ROUTES ---

  if (url.pathname === "/api/practice/portfolio" && request.method === "GET") {
    try {
      const portfolio = await evaluatePracticePortfolio();
      writeJson(response, 200, portfolio);
    } catch (error) {
      writeJson(response, 500, { error: error.message || "Failed to load practice portfolio" });
    }
    return;
  }

  if (url.pathname === "/api/practice/funds" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const amount = Number(parsed.amount) || 0;
      const action = String(parsed.action || "ADD").toUpperCase();

      const portfolio = loadPracticeTrading();
      if (action === "ADD") {
        portfolio.account.virtualBalance = Math.round((portfolio.account.virtualBalance + amount) * 100) / 100;
        portfolio.account.initialFunding = Math.round((portfolio.account.initialFunding + amount) * 100) / 100;
      } else if (action === "SET") {
        portfolio.account.virtualBalance = Math.max(0, Math.round(amount * 100) / 100);
        portfolio.account.initialFunding = Math.max(0, Math.round(amount * 100) / 100);
      } else if (action === "RESET") {
        const resetBal = amount > 0 ? amount : 1000000;
        portfolio.account.virtualBalance = resetBal;
        portfolio.account.initialFunding = resetBal;
        portfolio.positions = [];
        portfolio.holdings = [];
        portfolio.orders = [];
        portfolio.tradeHistory = [];
      }
      portfolio.account.updatedAt = new Date().toISOString();

      const evaluated = await evaluatePracticePortfolio(portfolio);
      savePracticeTrading(evaluated);
      writeJson(response, 200, { ok: true, portfolio: evaluated });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to update virtual funds" });
    }
    return;
  }

  if (url.pathname === "/api/practice/order" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};

      const symbol = String(parsed.symbol || "").toUpperCase().trim();
      const side = String(parsed.side || "BUY").toUpperCase().trim() === "SELL" ? "SELL" : "BUY";
      const product = String(parsed.product || "INTRADAY").toUpperCase().trim() === "DELIVERY" ? "DELIVERY" : "INTRADAY";
      const orderType = ["MARKET", "LIMIT", "SL", "SL-M"].includes(String(parsed.orderType || "").toUpperCase())
        ? String(parsed.orderType).toUpperCase()
        : "MARKET";
      const qty = Math.max(1, parseInt(parsed.qty, 10) || 1);
      const limitPrice = Number(parsed.price) || 0;
      const triggerPrice = Number(parsed.triggerPrice) || 0;
      const slPrice = Number(parsed.slPrice) || 0;
      const targetPrice = Number(parsed.targetPrice) || 0;
      const source = parsed.source || "Groww Practice Ticket";

      if (!symbol) {
        writeJson(response, 400, { error: "Valid stock symbol is required" });
        return;
      }

      const quote = await getStockQuote(symbol);
      const livePrice = quote && quote.price > 0 ? quote.price : (limitPrice || 100);

      const portfolio = loadPracticeTrading();
      const leverage = product === "INTRADAY" ? 5 : 1;

      if (orderType === "MARKET") {
        const execPrice = livePrice;
        const totalExposure = Math.round(execPrice * qty * 100) / 100;
        const requiredMargin = Math.round((totalExposure / leverage) * 100) / 100;
        const entryCharges = calculateGrowwCharges(side, product, totalExposure);
        const totalCost = Math.round((requiredMargin + entryCharges.totalCharges) * 100) / 100;

        if (portfolio.account.virtualBalance < totalCost) {
          writeJson(response, 400, {
            error: `Insufficient virtual cash. Need ₹${totalCost.toLocaleString("en-IN")}, available ₹${portfolio.account.virtualBalance.toLocaleString("en-IN")}`
          });
          return;
        }

        portfolio.account.virtualBalance = Math.round((portfolio.account.virtualBalance - totalCost) * 100) / 100;

        const newPosition = {
          id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol,
          companyName: quote?.name || symbol,
          side,
          product,
          qty,
          avgPrice: execPrice,
          currentPrice: execPrice,
          investedMargin: requiredMargin,
          totalExposure,
          slPrice,
          targetPrice,
          unrealizedPnl: 0,
          unrealizedPnlPct: 0,
          entryCharges,
          openedAt: new Date().toISOString(),
          source
        };

        portfolio.positions.unshift(newPosition);

        portfolio.orders.unshift({
          id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol,
          side,
          product,
          orderType,
          qty,
          price: execPrice,
          triggerPrice: 0,
          slPrice,
          targetPrice,
          status: "EXECUTED",
          executedPrice: execPrice,
          executedAt: new Date().toISOString(),
          source
        });

        const evaluated = await evaluatePracticePortfolio(portfolio);
        savePracticeTrading(evaluated);
        writeJson(response, 200, { ok: true, order: portfolio.orders[0], position: newPosition, portfolio: evaluated });
      } else {
        // LIMIT or SL Order
        const checkPrice = limitPrice > 0 ? limitPrice : livePrice;
        const totalExposure = Math.round(checkPrice * qty * 100) / 100;
        const requiredMargin = Math.round((totalExposure / leverage) * 100) / 100;

        if (portfolio.account.virtualBalance < requiredMargin) {
          writeJson(response, 400, {
            error: `Insufficient virtual cash for order. Need ₹${requiredMargin.toLocaleString("en-IN")}, available ₹${portfolio.account.virtualBalance.toLocaleString("en-IN")}`
          });
          return;
        }

        const newOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol,
          companyName: quote?.name || symbol,
          side,
          product,
          orderType,
          qty,
          price: limitPrice,
          triggerPrice,
          slPrice,
          targetPrice,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          source
        };

        portfolio.orders.unshift(newOrder);
        const evaluated = await evaluatePracticePortfolio(portfolio);
        savePracticeTrading(evaluated);
        writeJson(response, 200, { ok: true, order: newOrder, portfolio: evaluated });
      }
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to place practice order" });
    }
    return;
  }

  if (url.pathname === "/api/practice/position/exit" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const positionId = String(parsed.positionId || "");

      const portfolio = loadPracticeTrading();
      if (!positionId) {
        writeJson(response, 400, { error: "positionId is required" });
        return;
      }

      const closedTrades = [];

      if (positionId.toUpperCase() === "ALL") {
        for (const pos of [...portfolio.positions]) {
          const quote = await getStockQuote(pos.symbol);
          const currentPrice = quote && quote.price > 0 ? quote.price : pos.avgPrice;
          const isBuy = pos.side === "BUY";
          const priceDiff = isBuy ? (currentPrice - pos.avgPrice) : (pos.avgPrice - currentPrice);
          const grossPnl = Math.round(priceDiff * pos.qty * 100) / 100;
          const grossPnlPct = Math.round(((priceDiff / pos.avgPrice) * 100) * 100) / 100;

          const exitTurnover = currentPrice * pos.qty;
          const exitCharges = calculateGrowwCharges(isBuy ? "SELL" : "BUY", pos.product, exitTurnover);
          const netPnl = Math.round((grossPnl - (pos.entryCharges?.totalCharges || 0) - exitCharges.totalCharges) * 100) / 100;

          // Refund invested margin + grossPnl - exitCharges
          portfolio.account.virtualBalance = Math.max(0, Math.round((portfolio.account.virtualBalance + pos.investedMargin + grossPnl - exitCharges.totalCharges) * 100) / 100);

          const closedTrade = {
            id: `trd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            symbol: pos.symbol,
            companyName: pos.companyName || pos.symbol,
            side: pos.side,
            product: pos.product,
            qty: pos.qty,
            entryPrice: pos.avgPrice,
            exitPrice: currentPrice,
            grossPnl,
            grossPnlPct,
            charges: {
              entryCharges: pos.entryCharges || {},
              exitCharges,
              totalCharges: Math.round(((pos.entryCharges?.totalCharges || 0) + exitCharges.totalCharges) * 100) / 100
            },
            netPnl,
            exitReason: "MANUAL_SQUARE_OFF_ALL",
            openedAt: pos.openedAt,
            closedAt: new Date().toISOString()
          };

          closedTrades.push(closedTrade);
          portfolio.tradeHistory.unshift(closedTrade);
        }
        portfolio.positions = [];
      } else {
        const index = portfolio.positions.findIndex((p) => p.id === positionId);
        if (index === -1) {
          writeJson(response, 404, { error: "Position not found" });
          return;
        }

        const pos = portfolio.positions[index];
        const quote = await getStockQuote(pos.symbol);
        const currentPrice = quote && quote.price > 0 ? quote.price : pos.avgPrice;
        const isBuy = pos.side === "BUY";
        const priceDiff = isBuy ? (currentPrice - pos.avgPrice) : (pos.avgPrice - currentPrice);
        const grossPnl = Math.round(priceDiff * pos.qty * 100) / 100;
        const grossPnlPct = Math.round(((priceDiff / pos.avgPrice) * 100) * 100) / 100;

        const exitTurnover = currentPrice * pos.qty;
        const exitCharges = calculateGrowwCharges(isBuy ? "SELL" : "BUY", pos.product, exitTurnover);
        const netPnl = Math.round((grossPnl - (pos.entryCharges?.totalCharges || 0) - exitCharges.totalCharges) * 100) / 100;

        // Refund invested margin + grossPnl - exitCharges
        portfolio.account.virtualBalance = Math.max(0, Math.round((portfolio.account.virtualBalance + pos.investedMargin + grossPnl - exitCharges.totalCharges) * 100) / 100);

        const closedTrade = {
          id: `trd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol: pos.symbol,
          companyName: pos.companyName || pos.symbol,
          side: pos.side,
          product: pos.product,
          qty: pos.qty,
          entryPrice: pos.avgPrice,
          exitPrice: currentPrice,
          grossPnl,
          grossPnlPct,
          charges: {
            entryCharges: pos.entryCharges || {},
            exitCharges,
            totalCharges: Math.round(((pos.entryCharges?.totalCharges || 0) + exitCharges.totalCharges) * 100) / 100
          },
          netPnl,
          exitReason: "MANUAL_SQUARE_OFF",
          openedAt: pos.openedAt,
          closedAt: new Date().toISOString()
        };

        closedTrades.push(closedTrade);
        portfolio.tradeHistory.unshift(closedTrade);
        portfolio.positions.splice(index, 1);
      }

      const evaluated = await evaluatePracticePortfolio(portfolio);
      savePracticeTrading(evaluated);
      writeJson(response, 200, { ok: true, closedTrades, portfolio: evaluated });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to exit position" });
    }
    return;
  }

  if (url.pathname === "/api/practice/position/modify" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const { positionId, slPrice, targetPrice } = parsed;

      const portfolio = loadPracticeTrading();
      const pos = portfolio.positions.find((p) => p.id === positionId);
      if (!pos) {
        writeJson(response, 404, { error: "Position not found" });
        return;
      }

      if (slPrice !== undefined) pos.slPrice = Number(slPrice) || 0;
      if (targetPrice !== undefined) pos.targetPrice = Number(targetPrice) || 0;

      const evaluated = await evaluatePracticePortfolio(portfolio);
      savePracticeTrading(evaluated);
      writeJson(response, 200, { ok: true, position: pos, portfolio: evaluated });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to modify position" });
    }
    return;
  }

  if (url.pathname === "/api/practice/order/cancel" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const orderId = parsed.orderId;

      const portfolio = loadPracticeTrading();
      const order = portfolio.orders.find((o) => o.id === orderId);
      if (!order) {
        writeJson(response, 404, { error: "Order not found" });
        return;
      }

      order.status = "CANCELLED";
      order.cancelledAt = new Date().toISOString();

      const evaluated = await evaluatePracticePortfolio(portfolio);
      savePracticeTrading(evaluated);
      writeJson(response, 200, { ok: true, order, portfolio: evaluated });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to cancel order" });
    }
    return;
  }

  if (url.pathname === "/api/practice/reset" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = body ? JSON.parse(body) : {};
      const funding = Number(parsed.funding) || 1000000;

      const newPortfolio = {
        account: {
          virtualBalance: funding,
          initialFunding: funding,
          currency: "INR",
          updatedAt: new Date().toISOString()
        },
        positions: [],
        holdings: [],
        orders: [],
        tradeHistory: []
      };

      const evaluated = await evaluatePracticePortfolio(newPortfolio);
      savePracticeTrading(evaluated);
      writeJson(response, 200, { ok: true, portfolio: evaluated });
    } catch (error) {
      writeJson(response, 400, { error: error.message || "Failed to reset practice account" });
    }
    return;
  }

  if (url.pathname === "/api/practice/quote" && request.method === "GET") {
    try {
      const parsedUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const symbol = parsedUrl.searchParams.get("symbol") || "RELIANCE";
      const quote = await getStockQuote(symbol);
      writeJson(response, 200, quote || { error: "Symbol not found" });
    } catch (error) {
      writeJson(response, 500, { error: error.message || "Failed to fetch quote" });
    }
    return;
  }

  if (url.pathname === "/api/practice/option-chain" && request.method === "GET") {
    try {
      const parsedUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const symbol = parsedUrl.searchParams.get("symbol") || "NIFTY";
      const expiry = parsedUrl.searchParams.get("expiry") || null;
      const chain = await getOptionChain(symbol, expiry);
      writeJson(response, 200, chain);
    } catch (error) {
      writeJson(response, 500, { error: error.message || "Failed to fetch option chain" });
    }
    return;
  }

  if (url.pathname === "/api/practice/search" && request.method === "GET") {
    try {
      const parsedUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const query = parsedUrl.searchParams.get("q") || "";
      const results = await searchInstruments(query);
      writeJson(response, 200, results);
    } catch (error) {
      writeJson(response, 500, { error: error.message || "Failed to search instruments" });
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
