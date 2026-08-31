# Stock Scout

Standalone project for tracking live buy and sell signals with:

- a custom scanner whose universe is editable from the dashboard (defaults to `Nifty 50 + Nifty Next 50`)
- optional TradingView webhook support

Primary provider:

- `FYERS` when credentials are configured
- fallback: `Yahoo Finance` if FYERS credentials are missing or fail

Open:

- `stock-scout/index.html`

Run locally:

```bash
cp stock-scout/.env.example stock-scout/.env
node stock-scout/server.js
```

Then open:

- `http://localhost:8787`

TradingView webhook:

- `POST http://localhost:8787/api/webhook`

Free live scanner:

- universe: paste any valid NSE tickers into **Scanner Universe**, then save
- timeframe: `5m`
- start from UI, or call:

```bash
curl -X POST http://localhost:8787/api/scanner/start
```

Stop:

```bash
curl -X POST http://localhost:8787/api/scanner/stop
```

FYERS setup:

1. Create a FYERS app and generate an access token.
2. Fill these values in your environment:

```bash
STOCK_SCOUT_PROVIDER=fyers
FYERS_CLIENT_ID=YOUR_APP_ID
FYERS_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

Note:

- the FYERS history endpoint wiring in this project follows the standard FYERS history-request pattern and assumes your token is already generated
- if your FYERS app uses a different auth/header format, we can adjust it quickly once you share the exact app details
- Yahoo Finance is a fallback only. For dependable intraday scanning across a large universe, configure FYERS (or another licensed real-time market-data provider).

Signal rules:

The scanner mirrors the final `Profit GeNIE 1` script: RSI, ADX/DI, EMA 33, the long/short trend scores, ticker-aware breakout zones, and the previous-bar high/low breakout rule. It records **only confirmed BUY/SELL signals**—not the `BUY?`/`SELL?` scout setup. It also follows the script's daily reset, re-arm rules, 15-bar cooldown, and `barstate.isconfirmed` behaviour by evaluating closed 5-minute candles only. The API and dashboard sort by signal time descending, so the most recently found stock is at the top.

Local webhook JSON:

```json
{
  "symbol": "NIFTY",
  "side": "sell",
  "time": "2026-06-25T10:15:00+05:30",
  "source": "TradingView"
}
```

Signal API:

```js
window.StockScout.feedSignal({
  symbol: "RELIANCE",
  side: "buy",
  time: "2026-06-25T09:45:00+05:30"
});
```

Browser event option:

```js
window.dispatchEvent(new CustomEvent("stock-scout-signal", {
  detail: {
    symbol: "NIFTY",
    side: "sell",
    time: "2026-06-25T10:15:00+05:30"
  }
}));
```
