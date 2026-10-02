const nifty50Constituents = [
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", weight: 11.28, sector: "Financial Services" },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", weight: 8.92, sector: "Oil Gas & Fuels" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", weight: 7.95, sector: "Financial Services" },
  { symbol: "INFY", name: "Infosys Ltd.", weight: 5.64, sector: "Information Technology" },
  { symbol: "ITC", name: "ITC Ltd.", weight: 4.12, sector: "Fast Moving Consumer Goods" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd.", weight: 3.82, sector: "Information Technology" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", weight: 3.96, sector: "Telecommunication" },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", weight: 3.75, sector: "Construction" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd.", weight: 3.25, sector: "Financial Services" },
  { symbol: "SBIN", name: "State Bank of India", weight: 3.12, sector: "Financial Services" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", weight: 2.78, sector: "Financial Services" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", weight: 2.34, sector: "Fast Moving Consumer Goods" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", weight: 2.28, sector: "Automobile" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", weight: 2.15, sector: "Financial Services" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", weight: 1.88, sector: "Healthcare" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", weight: 1.76, sector: "Automobile" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", weight: 1.68, sector: "Automobile" },
  { symbol: "NTPC", name: "NTPC Ltd.", weight: 1.62, sector: "Power" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd.", weight: 1.54, sector: "Metals & Mining" },
  { symbol: "POWERGRID", name: "Power Grid Corp. of India Ltd.", weight: 1.48, sector: "Power" },
  { symbol: "TITAN", name: "Titan Company Ltd.", weight: 1.45, sector: "Consumer Durables" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd.", weight: 1.42, sector: "Information Technology" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd.", weight: 1.35, sector: "Financial Services" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp. Ltd.", weight: 1.28, sector: "Oil Gas & Fuels" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", weight: 1.24, sector: "Metals & Mining" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd.", weight: 1.22, sector: "Services" },
  { symbol: "COALINDIA", name: "Coal India Ltd.", weight: 1.18, sector: "Oil Gas & Fuels" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", weight: 1.15, sector: "Metals & Mining" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd.", weight: 1.12, sector: "Metals & Mining" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", weight: 1.08, sector: "Consumer Durables" },
  { symbol: "TRENT", name: "Trent Ltd.", weight: 1.05, sector: "Consumer Services" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd.", weight: 1.02, sector: "Automobile" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd.", weight: 0.98, sector: "Construction Materials" },
  { symbol: "GRASIM", name: "Grasim Industries Ltd.", weight: 0.95, sector: "Construction Materials" },
  { symbol: "BEL", name: "Bharat Electronics Ltd.", weight: 0.92, sector: "Capital Goods" },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd.", weight: 0.90, sector: "Financial Services" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd.", weight: 0.88, sector: "Information Technology" },
  { symbol: "WIPRO", name: "Wipro Ltd.", weight: 0.82, sector: "Information Technology" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd.", weight: 0.80, sector: "Fast Moving Consumer Goods" },
  { symbol: "CIPLA", name: "Cipla Ltd.", weight: 0.78, sector: "Healthcare" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd.", weight: 0.75, sector: "Healthcare" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", weight: 0.74, sector: "Fast Moving Consumer Goods" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd.", weight: 0.72, sector: "Healthcare" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd.", weight: 0.70, sector: "Automobile" },
  { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd.", weight: 0.68, sector: "Financial Services" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd.", weight: 0.66, sector: "Financial Services" },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd.", weight: 0.64, sector: "Financial Services" },
  { symbol: "MAXHEALTH", name: "Max Healthcare Institute Ltd.", weight: 0.62, sector: "Healthcare" },
  { symbol: "INDIGO", name: "InterGlobe Aviation Ltd.", weight: 0.58, sector: "Services" },
  { symbol: "ETERNAL", name: "Eternal Global Ltd.", weight: 0.40, sector: "Consumer Services" }
];

const bankNiftyConstituents = [
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", weight: 28.5, type: "Private" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", weight: 23.2, type: "Private" },
  { symbol: "SBIN", name: "State Bank of India", weight: 10.4, type: "PSU" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd.", weight: 9.8, type: "Private" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", weight: 8.9, type: "Private" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd.", weight: 5.8, type: "Private" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", weight: 3.4, type: "PSU" },
  { symbol: "PNB", name: "Punjab National Bank", weight: 2.8, type: "PSU" },
  { symbol: "AUBANK", name: "AU Small Finance Bank Ltd.", weight: 2.2, type: "Private" },
  { symbol: "FEDERALBNK", name: "The Federal Bank Ltd.", weight: 2.1, type: "Private" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd.", weight: 1.6, type: "Private" },
  { symbol: "BANDHANBNK", name: "Bandhan Bank Ltd.", weight: 1.3, type: "Private" }
];

const sectorDefinitions = [
  { id: "NIFTY BANK", name: "Nifty Bank", code: "BANK", icon: "🏦", category: "Sectoral", nseSymbol: "NIFTY BANK", constituents: ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "INDUSINDBK", "BANKBARODA", "PNB", "AUBANK", "FEDERALBNK", "IDFCFIRSTB", "BANDHANBNK"] },
  { id: "NIFTY IT", name: "Nifty IT", code: "IT", icon: "💻", category: "Sectoral", nseSymbol: "NIFTY IT", constituents: ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM", "LTIM", "PERSISTENT", "COFORGE", "MPHASIS", "KPITTECH"] },
  { id: "NIFTY AUTO", name: "Nifty Auto", code: "AUTO", icon: "🚗", category: "Sectoral", nseSymbol: "NIFTY AUTO", constituents: ["M&M", "MARUTI", "TATAMOTORS", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO", "TVSMOTOR", "BHARATFORG", "BOSCHLTD", "MOTHERSON", "ASHOKLEY", "MRF", "BALKRISIND", "APOLLOTYRE", "TIINDIA"] },
  { id: "NIFTY PHARMA", name: "Nifty Pharma", code: "PHARMA", icon: "💊", category: "Sectoral", nseSymbol: "NIFTY PHARMA", constituents: ["SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB", "LUPIN", "AUROPHARMA", "TORNTPHARM", "ZYDUSLIFE", "ALKEM", "BIOCON", "GLENMARK", "LAURUSLABS", "MANKIND", "IPCALAB", "NATCOPHARM", "GRANULES", "GLAND", "AJANTPHARM", "ABBOTINDIA", "SANOFI"] },
  { id: "NIFTY FMCG", name: "Nifty FMCG", code: "FMCG", icon: "🛒", category: "Sectoral", nseSymbol: "NIFTY FMCG", constituents: ["ITC", "HINDUNILVR", "NESTLEIND", "TATACONSUM", "BRITANNIA", "DABUR", "GODREJCP", "MARICO", "VBL", "COLPAL", "UNITDSPR", "RADICO", "PGHH", "EMAMILTD", "PATANJALI"] },
  { id: "NIFTY METAL", name: "Nifty Metal", code: "METAL", icon: "⛏️", category: "Sectoral", nseSymbol: "NIFTY METAL", constituents: ["TATASTEEL", "JSWSTEEL", "HINDALCO", "JINDALSTEL", "VEDL", "SAIL", "NMDC", "NATIONALUM", "HINDZINC", "APLAPOLLO", "HINDCOPPER", "RATNAMANI", "WELCORP", "JSL", "ADANIENT"] },
  { id: "NIFTY REALTY", name: "Nifty Realty", code: "REALTY", icon: "🏢", category: "Sectoral", nseSymbol: "NIFTY REALTY", constituents: ["GODREJPROP", "DLF", "LODHA", "PRESTIGE", "PHOENIXLTD", "OBEROIRLTY", "BRIGADE", "SOBHA", "ANANTRAJ", "ABREL"] },
  { id: "NIFTY ENERGY", name: "Nifty Energy", code: "ENERGY", icon: "⚡", category: "Sectoral", nseSymbol: "NIFTY ENERGY", constituents: ["RELIANCE", "NTPC", "ONGC", "POWERGRID", "BPCL", "IOC", "GAIL", "TATAPOWER", "ADANIGREEN", "ADANIPOWER", "ADANIENSOL", "JSWENERGY", "NHPC", "OIL", "HINDPETRO", "SUZLON", "IREDA"] },
  { id: "NIFTY PSU BANK", name: "Nifty PSU Bank", code: "PSUBANK", icon: "🏛️", category: "Thematic", nseSymbol: "NIFTY PSU BANK", constituents: ["SBIN", "BANKBARODA", "PNB", "CANBK", "UNIONBANK", "INDIANB", "IOB", "UCOBANK", "CENTRALBK", "BANKINDIA", "MAHABANK", "PSB"] },
  { id: "NIFTY PVT BANK", name: "Nifty Private Bank", code: "PVTBANK", icon: "💳", category: "Thematic", nseSymbol: "NIFTY PVT BANK", constituents: ["HDFCBANK", "ICICIBANK", "AXISBANK", "KOTAKBANK", "INDUSINDBK", "FEDERALBNK", "IDFCFIRSTB", "BANDHANBNK", "AUBANK", "RBLBANK"] },
  { id: "NIFTY FINANCIAL SERVICES", name: "Nifty Financial Services", code: "FINSERV", icon: "💰", category: "Sectoral", nseSymbol: "NIFTY FIN SERVICE", constituents: ["HDFCBANK", "ICICIBANK", "SBIN", "BAJFINANCE", "BAJAJFINSV", "KOTAKBANK", "AXISBANK", "SHRIRAMFIN", "CHOLAFIN", "MUTHOOTFIN", "PFC", "RECLTD", "HDFCLIFE", "SBILIFE", "ICICIPRULI", "HDFCAMC", "JIOFIN", "ICICIGI", "SBICARD", "LICHSGFIN"] },
  { id: "NIFTY HEALTHCARE", name: "Nifty Healthcare", code: "HEALTH", icon: "🩺", category: "Thematic", nseSymbol: "NIFTY HEALTHCARE", constituents: ["SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB", "APOLLOHOSP", "MAXHEALTH", "LUPIN", "AUROPHARMA", "TORNTPHARM", "ZYDUSLIFE", "ALKEM", "BIOCON", "GLENMARK", "FORTIS", "MANKIND", "SYNGENE", "LALPATHLAB", "METROPOLIS", "MEDANTA", "KIMS"] },
  { id: "NIFTY OIL & GAS", name: "Nifty Oil & Gas", code: "OILGAS", icon: "🛢️", category: "Sectoral", nseSymbol: "NIFTY OIL AND GAS", constituents: ["RELIANCE", "ONGC", "IOC", "BPCL", "GAIL", "OIL", "HINDPETRO", "PETRONET", "IGL", "MGL", "GUJGASLTD", "ATGL", "GSPL", "AEGISLOG", "CASTROLIND"] },
  { id: "NIFTY CONSUMER DURABLES", name: "Nifty Consumer Durables", code: "DURABLES", icon: "📺", category: "Sectoral", nseSymbol: "NIFTY CONSR DURBL", constituents: ["TITAN", "HAVELLS", "DIXON", "VOLTAS", "BLUESTARCO", "CROMPTON", "WHIRLPOOL", "RAJESHEXPO", "KALYANKJIL", "AMBER", "BATAINDIA", "CENTURYPLY", "VGUARD"] },
  { id: "NIFTY MEDIA", name: "Nifty Media", code: "MEDIA", icon: "🎬", category: "Sectoral", nseSymbol: "NIFTY MEDIA", constituents: ["ZEEL", "SUNTV", "PVRINOX", "SAREGAMA", "NAZARA", "TIPSMUSIC", "NETWORK18", "TV18BRDCST", "DBCORP", "HATHWAY"] },
  { id: "NIFTY INFRA", name: "Nifty Infrastructure", code: "INFRA", icon: "🏗️", category: "Thematic", nseSymbol: "NIFTY INFRA", constituents: ["LT", "BHARTIARTL", "NTPC", "POWERGRID", "ONGC", "ADANIPORTS", "COALINDIA", "GRASIM", "ULTRACEMCO", "TATAPOWER", "BPCL", "IOC", "GAIL", "INDIGO", "IRFC", "RVNL", "CONCOR", "SIEMENS", "ABB", "CGPOWER"] },
  { id: "NIFTY COMMODITIES", name: "Nifty Commodities", code: "COMMOD", icon: "📦", category: "Thematic", nseSymbol: "NIFTY COMMODITIES", constituents: ["RELIANCE", "TATASTEEL", "JSWSTEEL", "HINDALCO", "ULTRACEMCO", "GRASIM", "COALINDIA", "NTPC", "ONGC", "BPCL", "IOC", "VEDL", "JINDALSTEL", "AMBUJACEM", "SHREECEM", "PIDILITIND", "SRF", "TATACHEM", "UPL", "COROMANDEL"] },
  { id: "NIFTY MIDCAP 50", name: "Nifty Midcap 50", code: "MIDCAP50", icon: "🚀", category: "Broad", nseSymbol: "NIFTY MIDCAP 50", constituents: ["360ONE", "APLAPOLLO", "AUBANK", "ABCAPITAL", "ALKEM", "ASHOKLEY", "ASTRAL", "AUROPHARMA", "BSE", "BDL", "BHARATFORG", "BHEL", "BIOCON", "BLUESTARCO", "COCHINSHIP", "COFORGE", "COLPAL", "CONCOR", "CUMMINSIND", "DIXON", "FEDERALBNK", "FORTIS", "GLENMARK", "GODREJPROP", "HAVELLS", "HUDCO", "INDIANB", "INDUSINDBK", "IRCTC", "IREDA", "JSWENERGY", "JUBLFOOD", "KPITTECH", "KALYANKJIL", "LUPIN", "MRF", "M&MFIN", "MANKIND", "MARICO", "MAXHEALTH", "MPHASIS", "MCX", "NMDC", "OFSS", "PERSISTENT", "POLYCAB", "PRESTIGE", "RVNL", "SUZLON", "VOLTAS"] },
  { id: "NIFTY NEXT 50", name: "Nifty Next 50", code: "NEXT50", icon: "🎯", category: "Broad", nseSymbol: "NIFTY NEXT 50", constituents: ["ABB", "ADANIENSOL", "ADANIGREEN", "ADANIPOWER", "AMBUJACEM", "BAJAJHLDNG", "BANKBARODA", "BPCL", "BRITANNIA", "BOSCHLTD", "CANBK", "CGPOWER", "CHOLAFIN", "CUMMINSIND", "DIVISLAB", "DLF", "DMART", "GAIL", "GODREJCP", "HDFCAMC", "HAL", "HINDZINC", "HYUNDAI", "INDHOTEL", "IOC", "IRFC", "JINDALSTEL", "LODHA", "LTIM", "MAZDOCK", "MUTHOOTFIN", "PIDILITIND", "PFC", "PNB", "RECLTD", "MOTHERSON", "SHREECEM", "SIEMENS", "SOLARINDS", "TATAPOWER", "TORNTPHARM", "TVSMOTOR", "UNIONBANK", "UNITDSPR", "VBL", "VEDL", "ZYDUSLIFE", "HEROMOTOCO", "DABUR", "ICICIGI"] },
  { id: "NIFTY 100", name: "Nifty 100", code: "NIFTY100", icon: "🌐", category: "Broad", nseSymbol: "NIFTY 100", constituents: ["HDFCBANK", "RELIANCE", "ICICIBANK", "INFY", "ITC", "TCS", "BHARTIARTL", "LT", "AXISBANK", "SBIN", "KOTAKBANK", "HINDUNILVR", "M&M", "BAJFINANCE", "SUNPHARMA", "MARUTI", "TATAMOTORS", "NTPC", "TATASTEEL", "POWERGRID", "TITAN", "HCLTECH", "BAJAJFINSV", "ONGC", "ADANIENT", "ADANIPORTS", "COALINDIA", "JSWSTEEL", "HINDALCO", "ASIANPAINT", "TRENT", "BAJAJ-AUTO", "ULTRACEMCO", "GRASIM", "BEL", "SHRIRAMFIN", "TECHM", "WIPRO", "NESTLEIND", "CIPLA", "DRREDDY", "TATACONSUM", "APOLLOHOSP", "EICHERMOT", "SBILIFE", "HDFCLIFE", "JIOFIN", "MAXHEALTH", "INDIGO", "ETERNAL"] }
];

// 1. Nifty 50
const nifty50 = [
  "ADANIENT", "ADANIPORTS", "APOLLOHOSP", "ASIANPAINT", "AXISBANK",
  "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BEL", "BHARTIARTL",
  "CIPLA", "COALINDIA", "DRREDDY", "EICHERMOT", "ETERNAL",
  "GRASIM", "HCLTECH", "HDFCBANK", "HDFCLIFE", "HINDALCO",
  "HINDUNILVR", "ICICIBANK", "INDIGO", "INFY", "ITC",
  "JIOFIN", "JSWSTEEL", "KOTAKBANK", "LT", "M&M",
  "MARUTI", "MAXHEALTH", "NESTLEIND", "NTPC", "ONGC",
  "POWERGRID", "RELIANCE", "SBILIFE", "SHRIRAMFIN", "SBIN",
  "SUNPHARMA", "TCS", "TATACONSUM", "TATASTEEL", "TECHM",
  "TITAN", "TRENT", "ULTRACEMCO", "WIPRO", "TATAMOTORS"
];

// 2. Nifty Next 50
const niftyNext50 = [
  "ABB", "ADANIENSOL", "ADANIGREEN", "ADANIPOWER", "AMBUJACEM",
  "BAJAJHLDNG", "BANKBARODA", "BPCL", "BRITANNIA", "BOSCHLTD",
  "CANBK", "CGPOWER", "CHOLAFIN", "CUMMINSIND", "DIVISLAB",
  "DLF", "DMART", "GAIL", "GODREJCP", "HDFCAMC",
  "HAL", "HINDZINC", "HYUNDAI", "INDHOTEL", "IOC",
  "IRFC", "JINDALSTEL", "LODHA", "LTIM", "MAZDOCK",
  "MUTHOOTFIN", "PIDILITIND", "PFC", "PNB", "RECLTD",
  "MOTHERSON", "SHREECEM", "SIEMENS", "SOLARINDS", "TATAPOWER",
  "TORNTPHARM", "TVSMOTOR", "UNIONBANK", "UNITDSPR", "VBL",
  "VEDL", "ZYDUSLIFE", "HEROMOTOCO", "DABUR", "ICICIGI"
];

// 3. Nifty 100 = Nifty 50 + Nifty Next 50
const nifty100 = Array.from(new Set([...nifty50, ...niftyNext50]));

// 4. Nifty Midcap 50
const niftyMidcap50 = [
  "360ONE", "APLAPOLLO", "AUBANK", "ABCAPITAL", "ALKEM",
  "ASHOKLEY", "ASTRAL", "AUROPHARMA", "BSE", "BDL",
  "BHARATFORG", "BHEL", "BIOCON", "BLUESTARCO", "COCHINSHIP",
  "COFORGE", "COLPAL", "CONCOR", "CUMMINSIND", "DIXON",
  "FEDERALBNK", "FORTIS", "GLENMARK", "GODREJPROP", "HAVELLS",
  "HUDCO", "INDIANB", "INDUSINDBK", "IRCTC", "IREDA",
  "JSWENERGY", "JUBLFOOD", "KPITTECH", "KALYANKJIL", "LUPIN",
  "MRF", "M&MFIN", "MANKIND", "MARICO", "MAXHEALTH",
  "MPHASIS", "MCX", "NMDC", "OFSS", "PERSISTENT",
  "POLYCAB", "PRESTIGE", "RVNL", "SUZLON", "VOLTAS"
];

// 5. Nifty Midcap 100
const niftyMidcap100 = [
  "360ONE", "APLAPOLLO", "AUBANK", "ATGL", "ABCAPITAL",
  "ALKEM", "ASHOKLEY", "ASTRAL", "AUROPHARMA", "BSE",
  "BANKINDIA", "BDL", "BHARATFORG", "BHEL", "GROWW",
  "BIOCON", "BLUESTARCO", "COCHINSHIP", "COFORGE", "COLPAL",
  "CONCOR", "COROMANDEL", "DABUR", "DIXON", "EXIDEIND",
  "NYKAA", "FORTIS", "GVT&D", "GMRAIRPORT", "GLENMARK",
  "GODFRYPHLP", "GODREJPROP", "HAVELLS", "HEROMOTOCO", "HINDPETRO",
  "POWERINDIA", "HUDCO", "ICICIGI", "ICICIAMC", "IDFCFIRSTB",
  "INDIANB", "IRCTC", "IREDA", "INDUSTOWER", "INDUSINDBK",
  "NAUKRI", "JSWENERGY", "JUBLFOOD", "KEI", "KPITTECH",
  "KALYANKJIL", "LTF", "LGEINDIA", "LICHSGFIN", "LAURUSLABS",
  "LENSKART", "LUPIN", "MRF", "M&MFIN", "MANKIND",
  "MARICO", "MFSL", "MOTILALOFS", "MPHASIS", "MCX",
  "NHPC", "NMDC", "NATIONALUM", "OBEROIRLTY", "OIL",
  "PAYTM", "OFSS", "POLICYBZR", "PIIND", "PAGEIND",
  "PATANJALI", "PERSISTENT", "POLYCAB", "PREMIERENE", "PRESTIGE",
  "RADICO", "RVNL", "SBICARD", "SRF", "SAIL",
  "SUPREMEIND", "SUZLON", "SWIGGY", "TATACOMM", "TATAELXSI",
  "TATAINVEST", "FEDERALBNK", "PHOENIXLTD", "TIINDIA", "UPL",
  "VMM", "IDEA", "VOLTAS", "WAAREEENER", "YESBANK"
];

// 6. Nifty Midcap 150
const niftyMidcap150 = Array.from(new Set([
  ...niftyMidcap100,
  "ACC", "AIAENG", "AJANTPHARM", "APOLLOTYRE", "BALKRISIND", "BATAINDIA",
  "BHARATDYN", "CANFINHOME", "CASTROLIND", "CENTURYPLY", "CESC", "CHAMBLFERT",
  "COROMANDEL", "CROMPTON", "DEEPAKNTR", "DELHIVERY", "DEVYANI", "EMAMILTD",
  "ENDURANCE", "ESCORTS", "GLAND", "GLAXO", "GNFC", "GODREJIND",
  "GRANULES", "GSPL", "GUJGASLTD", "HATSUN", "HONAUT", "IBREALEST",
  "IDBI", "IIFL", "IPCALAB", "J&KBANK", "JBCHEPHARM", "JINDALSAW",
  "JKCEMENT", "JSWINFRA", "KAJARIACER", "KAYNES", "KEC", "LALPATHLAB",
  "LINDEINDIA", "LLOYDSME", "MEDANTA", "METROPOLIS", "MSUMI", "NATCOPHARM",
  "NBCC", "NIPPONLIFE", "OIL", "PAGEIND", "PETRONET", "PFIZER"
])).slice(0, 150);

// 7. Nifty Midcap Select (Top 25 liquid midcaps with active F&O)
const niftyMidcapSelect = [
  "AUBANK", "BHARATFORG", "BHEL", "COFORGE", "CONCOR",
  "CUMMINSIND", "DIXON", "FEDERALBNK", "GODREJPROP", "HAVELLS",
  "INDIANB", "INDUSINDBK", "JSWENERGY", "JUBLFOOD", "KPITTECH",
  "LUPIN", "M&MFIN", "MANKIND", "MPHASIS", "MCX",
  "OFSS", "PERSISTENT", "POLYCAB", "SUZLON", "VOLTAS"
];

// 8. Nifty Smallcap 50
const niftySmallcap50 = [
  "AMBER", "ANGELONE", "ANANTRAJ", "BLS", "BSOFT",
  "BRIGADE", "CDSL", "CENTURYTEX", "CAMS", "CESC",
  "CLEAN", "CYIENT", "DATAPATTNS", "ECLERX", "ENGINERSIN",
  "EIDPARRY", "EXIDEIND", "FINCABLES", "FIVESTAR", "GLENMARK",
  "GRAVITA", "HBLPOWER", "HFCL", "HINDCOPPER", "HOMEFIRST",
  "HONASA", "IIFL", "JBMA", "JWL", "KAYNES",
  "KEC", "LEMONTREE", "MANAPPURAM", "MAPMYINDIA", "METROBRAND",
  "NBCC", "NCC", "PNCINFRA", "POONAWALLA", "RBLBANK",
  "RITES", "ROUTE", "SONACOMS", "SWANENERGY", "TEJASNET",
  "TRITURBINE", "UTIAMC", "VGUARD", "WELCORP", "ZENSARTECH"
];

// 9. Nifty Smallcap 100
const niftySmallcap100 = Array.from(new Set([
  ...niftySmallcap50,
  "AARTIIND", "ABFRL", "AETHER", "AFFLE", "ALLCARGO",
  "ALOKINDS", "AMARAJABAT", "APTUS", "ASTERDM", "AVANTIFEED",
  "BALRAMCHIN", "BBL", "BIKAJI", "BIRLACORPN", "BLUEJET",
  "CAMPUS", "CANFINHOME", "CARBORUNIV", "CEATLTD", "CENTRALBK",
  "CHAMBLFERT", "CHEMPLASTS", "CUB", "DATAPATTNS", "DOMS",
  "EPL", "ERIS", "FINPIPE", "FIRSTSOURC", "GLS",
  "GODFRYPHLP", "GPPL", "GRANULES", "GRAPHITE", "HEG",
  "HUDCO", "IDBI", "IFCI", "INDIACEM", "IONEXCHANG"
])).slice(0, 100);

// 10. Nifty Smallcap 250
const niftySmallcap250 = Array.from(new Set([
  ...niftySmallcap100,
  "ACE", "ACTIONCONST", "AHLUCONT", "AIAENG", "AJANTPHARM",
  "AKUMS", "ALKYLAMINE", "ALLCARGO", "AMBER", "ANANDRATHI",
  "ANANTRAJ", "APARINDS", "APLLTD", "APTUS", "ARCHEAN",
  "ARE&M", "ASKAUTOLTD", "ASAHIINDIA", "ASTRAZEN", "ATUL",
  "AVALON", "AWL", "BAJAJCON", "BALAJIAMIN", "BANCOINDIA",
  "BEML", "BLS", "BORORENEW", "CAMPUS", "CCL",
  "CEATLTD", "CENTURYPLY", "CERA", "CHALET", "CHENNPETRO",
  "CHOICEIN", "CIEINDIA", "COCHINSHIP", "CONCORDBIO", "CRAFTSMAN",
  "CREDITACC", "CYIENT", "DATAPATTNS", "DBREALTY", "DCBBANK",
  "DEEPAKFERT", "DELHIVERY", "DEVYANI", "DISHTV", "DOMS",
  "DREDGECORP", "ECLERX", "EDELWEISS", "ELECON", "EMIL",
  "ENGINERSIN", "EPIGRAL", "ERIS", "ESCORTS", "FDC",
  "FEDFINA", "FINCABLES", "FINPIPE", "FIVESTAR", "FORCEIND",
  "FORTIS", "FSL", "GABRIEL", "GARFIBRES", "GATEWAY",
  "GENUSPOWER", "GICRE", "GILLETTE", "GLENMARK", "GLOBAL",
  "GLS", "GMMPFAUDLR", "GOCLCORP", "GODREJIND", "GOKEX",
  "GOKULAGRO", "GPIL", "GRAPHITE", "GRAVITA", "GREAVESCOT",
  "GRINDWELL", "GRSE", "GSFC", "GSPL", "GTLINFRA",
  "HALEON", "HAPPSTMNDS", "HATHWAY", "HATSUN", "HEG",
  "HEIDELBERG", "HERITGFOOD", "HFCL", "HIKAL", "HINDCOPPER",
  "HINDOILEXP", "HINDWAREAP", "HMT", "HONASA", "IBREALEST",
  "ICRA", "IDBI", "IFCI", "IIFL", "IMFA",
  "INDGN", "INDIACEM", "INDIAGLYCO", "INDIAMART", "INDIANB",
  "INDIGOPNTS", "INDOCO", "INDRAMEDCO", "INFIBEAM", "INGERRAND",
  "INOXINDIA", "INOXWIND", "IOB", "IONEXCHANG", "IPCALAB",
  "IRB", "IRCON", "ISEC", "ITC", "ITI",
  "J&KBANK", "JAICORPLTD", "JAMNAAUTO", "JBCHEPHARM", "JBMA",
  "JINDALSAW", "JINDWORLD", "JIOFIN", "JKCEMENT", "JKIL",
  "JKLAKSHMI", "JKPAPER", "JKTYRE", "JMFINANCIL", "JPASSOCIAT",
  "JSWINFRA", "JUBLINGREA", "JUBLPHARMA", "JUSTDIAL", "JYOTHYLAB",
  "JYOTICNC", "KAJARIACER", "KALYANKJIL", "KANSAINER", "KARURVYSYA",
  "KAYNES", "KEC", "KEI", "KFINTECH", "KIMS",
  "KIRLOSBROS", "KIRLENG", "KIRLOSIND", "KNRCON", "KPIL",
  "KPITTECH", "KRBL", "KSB", "KSL", "KTKBANK"
])).slice(0, 250);

// 11. Nifty 200 = Nifty 100 + Nifty Midcap 100
const nifty200 = Array.from(new Set([...nifty100, ...niftyMidcap100]));

// 12. Nifty LargeMidcap 250 = Nifty 100 + Nifty Midcap 150
const niftyLargeMidcap250 = Array.from(new Set([...nifty100, ...niftyMidcap150]));

// 13. Nifty MidSmallcap 400 = Nifty Midcap 150 + Nifty Smallcap 250
const niftyMidSmallcap400 = Array.from(new Set([...niftyMidcap150, ...niftySmallcap250]));

// 14. Nifty 500 = Nifty 100 + Nifty Midcap 150 + Nifty Smallcap 250
const nifty500 = Array.from(new Set([...nifty100, ...niftyMidcap150, ...niftySmallcap250]));

// 15. Nifty Microcap 250
const niftyMicrocap250 = [
  "20MICRONS", "5PAISA", "63MOONS", "AARTISURF", "ABAN",
  "ACCELYA", "ADFFOODS", "ADVANIHOTR", "ADVENZYMES", "AGARIND",
  "AGI", "AGROPHOS", "AJMERA", "ALANKIT", "ALBERTDAVD",
  "ALLSEC", "ALMONDZ", "ALPA", "ALPHAGEO", "AMJLAND",
  "ANDHRAPAP", "ANDHRSUGAR", "ANGELONE", "ANIKINDS", "ANMOL",
  "ANSALAPI", "ANTGRAPHIC", "APCOTEXIND", "APEX", "APOLLO",
  "APOLSINHOT", "APTECHT", "ARCHIDPLY", "ARCHIES", "ARIES",
  "ARIHANTCAP", "ARIHANTSUP", "ARMSTRONG", "ARMANFIN", "ARROWGREEN",
  "ARSHIYA", "ARVEE", "ARVIND", "ASAHISONG", "ASAL",
  "ASHAPURMIN", "ASHIANA", "ASHIMASYN", "ASHOKA", "ASIANENE",
  "ASIANHOTNR", "ASIANSTAR", "ASTEC", "ASTRAL", "ASTRAMICRO",
  "ASTROVITA", "ATFL", "ATLANTA", "ATLASCYCLE", "ATULAUTO",
  "AURIONPRO", "AUROLABS", "AUSOMENT", "AUTOAXLES", "AUTOLITIND",
  "AVADHSUGAR", "AVANTIFEED", "AVONMORE", "AXISCADES", "AYMSYNTEX",
  "BAFNAPH", "BAGFILMS", "BAJAJHCARE", "BAJAJHIND", "BALAJITELE",
  "BALAMINES", "BALMLAWRIE", "BALPHARMA", "BANARBEADS", "BANARISUG",
  "BANCOINDIA", "BANG", "BANKA", "BANSWRAS", "BARBEQUE",
  "BARTRONICS", "BASF", "BASML", "BATAINDIA", "BAYERCROP",
  "BBL", "BBTC", "BCG", "BCLIND", "BCP",
  "BDL", "BEARDSELL", "BECTORFOOD", "BEDMUTHA", "BEL",
  "BEML", "BEPL", "BERGEPAINT", "BESTAGRO", "BFINVEST",
  "BFUTILITIE", "BGRENERGY", "BHAGCHEM", "BHAGERIA", "BHAGYANGR",
  "BHANDARI", "BHARATFORG", "BHARATGEAR", "BHARATRAS", "BHARATWIRE",
  "BHARTIHEXA", "BHEL", "BIGBLOC", "BIL", "BILENERGY",
  "BINANIIND", "BIOCON", "BIOFILCHEM", "BIRLACABLE", "BIRLACORPN",
  "BIRLAMONEY", "BIRLATYRE", "BLACKROSE", "BLBLIMITED", "BLISSGVS",
  "BLKASHYAP", "BLS", "BLUECHIP", "BLUECOAST", "BLUEDART",
  "BLUESTARCO", "BODALCHEM", "BOHRAIND", "BOMDYEING", "BOROLTD",
  "BORORENEW", "BOSCHLTD", "BPCL", "BPL", "BRIGADE",
  "BRITANNIA", "BRNL", "BROOKS", "BSE", "BSL",
  "BSOFT", "BURNPUR", "BUTTERFLY", "BVCL", "BYKE",
  "CALSOFT", "CAMLINFINE", "CAMPUS", "CAMS", "CANBK",
  "CANDC", "CANFINHOME", "CANTABIL", "CAPACITE", "CAPL",
  "CAPTRUST", "CARBORUNIV", "CAREERP", "CARERATING", "CARTRADE",
  "CARYSIL", "CASTROLIND", "CCCL", "CCHHL", "CCL",
  "CDSL", "CEATLTD", "CELEBRITY", "CENTENKA", "CENTEXT",
  "CENTRALBK", "CENTRUM", "CENTUM", "CENTURYENC", "CENTURYPLY"
];

// 16. Nifty Total Market = 750 Stocks (500 + 250 Microcap)
const niftyTotalMarket = Array.from(new Set([...nifty500, ...niftyMicrocap250]));

// 17. Nifty India FPI 150 (Top 150 stocks with dominant FPI holding)
const niftyIndiaFPI150 = Array.from(new Set([
  ...nifty50,
  "APLAPOLLO", "ASTRAL", "AUBANK", "AUROPHARMA", "BHARATFORG",
  "CGPOWER", "CHOLAFIN", "COFORGE", "CUMMINSIND", "DIVISLAB",
  "DIXON", "DLF", "DMART", "FEDERALBNK", "GODREJCP",
  "GODREJPROP", "HAL", "HAVELLS", "HDFCAMC", "INDHOTEL",
  "INDUSINDBK", "JINDALSTEL", "JSWENERGY", "JUBLFOOD", "KALYANKJIL",
  "KPITTECH", "LODHA", "LTIM", "LUPIN", "MANKIND",
  "MARICO", "MAXHEALTH", "MOTHERSON", "MPHASIS", "MUTHOOTFIN",
  "NAUKRI", "OFSS", "PERSISTENT", "PFC", "PHOENIXLTD",
  "PIDILITIND", "PIIND", "POLYCAB", "PRESTIGE", "RECLTD",
  "RVNL", "SHREECEM", "SIEMENS", "SOLARINDS", "SRF",
  "SUZLON", "TATAPOWER", "TORNTPHARM", "TRENT", "TVSMOTOR",
  "UNITDSPR", "VBL", "VEDL", "VOLTAS", "ZYDUSLIFE"
])).slice(0, 150);

// 18. Complete F&O Universe (131+ liquid stocks with derivatives)
const fnoUniverse = [
  "AARTIIND", "ABB", "ABBOTINDIA", "ABCAPITAL", "ABFRL", "ACC", "ADANIENT",
  "ADANIPORTS", "ALKEM", "AMARAJABAT", "AMBUJACEM", "APOLLOHOSP", "APOLLOTYRE",
  "ASHOKLEY", "ASIANPAINT", "ASTRAL", "ATUL", "AUBANK", "AUROPHARMA", "AXISBANK",
  "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BALRAMCHIN", "BANDHANBNK",
  "BANKBARODA", "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG", "BHARTIARTL",
  "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA", "BSOFT", "CANBK",
  "CANFINHOME", "CHAMBLFERT", "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE",
  "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUMMINSIND", "DABUR",
  "DALBHARAT", "DEEPAKNTR", "DELHIVERY", "DIVISLAB", "DIXON", "DLF",
  "DRREDDY", "EICHERMOT", "ESCORTS", "EXIDEIND", "FEDERALBNK", "GAIL",
  "GLENMARK", "GMRINFRA", "GNFC", "GODREJCP", "GODREJPROP", "GRANULES",
  "GRASIM", "GUJGASLTD", "HAL", "HAVELLS", "HCLTECH", "HDFCAMC",
  "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDCOPPER", "HINDPETRO",
  "HINDUNILVR", "ICICIAMC", "ICICIBANK", "ICICIGI", "ICICIPRULI", "IDEA",
  "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL", "INDIACEM", "INDIAMART",
  "INDIANB", "INDIGO", "INDUSINDBK", "INDUSTOWER", "INFY", "IOC",
  "IPCALAB", "IRCTC", "IRFC", "ITC", "JINDALSTEL", "JKCEMENT",
  "JSWENERGY", "JSWSTEEL", "JUBLFOOD", "KALYANKJIL", "KOTAKBANK", "KPITTECH",
  "LALPATHLAB", "LAURUSLABS", "LICHSGFIN", "LODHA", "LT", "LTF",
  "LTIM", "LTTS", "LUPIN", "M&M", "M&MFIN", "MANKIND",
  "MARICO", "MARUTI", "MAZDOCK", "MCX", "METROPOLIS", "MFSL",
  "MGL", "MOTHERSON", "MPHASIS", "MRF", "MUTHOOTFIN", "NATIONALUM",
  "NAUKRI", "NAVINFLUOR", "NESTLEIND", "NHPC", "NMDC", "NTPC",
  "OBEROIRLTY", "OFSS", "OIL", "ONGC", "PAGEIND", "PEL",
  "PERSISTENT", "PETRONET", "PFC", "PIDILITIND", "PIIND", "PNB",
  "POLYCAB", "POONAWALLA", "POWERGRID", "PRESTIGE", "PVRINOX", "RADICO",
  "RAMCOCEM", "RBLBANK", "RECLTD", "RELIANCE", "SAIL", "SBICARD",
  "SBILIFE", "SBIN", "SHREECEM", "SHRIRAMFIN", "SIEMENS", "SOLARINDS",
  "SONACOMS", "SRF", "SUNPHARMA", "SUNTV", "SUPREMEIND", "SYNGENE",
  "TATACHEM", "TATACOMM", "TATACONSUM", "TATAELXSI", "TATAMOTORS", "TATAPOWER",
  "TATASTEEL", "TCS", "TECHM", "TITAN", "TORNTPHARM", "TRENT",
  "TVSMOTOR", "UBL", "ULTRACEMCO", "UNIONBANK", "UNITDSPR", "UPL",
  "VBL", "VEDL", "VOLTAS", "WIPRO", "YESBANK", "ZYDUSLIFE"
];

// Broad Market Index Registry
const broadMarketIndices = [
  { id: "nifty50", name: "Nifty 50", count: nifty50.length, category: "Large Cap", symbols: nifty50 },
  { id: "niftyNext50", name: "Nifty Next 50", count: niftyNext50.length, category: "Large Cap", symbols: niftyNext50 },
  { id: "nifty100", name: "Nifty 100", count: nifty100.length, category: "Large Cap", symbols: nifty100 },
  { id: "niftyMidcap50", name: "Nifty Midcap 50", count: niftyMidcap50.length, category: "Mid Cap", symbols: niftyMidcap50 },
  { id: "niftyMidcapSelect", name: "Nifty Midcap Select", count: niftyMidcapSelect.length, category: "Mid Cap", symbols: niftyMidcapSelect },
  { id: "niftyMidcap100", name: "Nifty Midcap 100", count: niftyMidcap100.length, category: "Mid Cap", symbols: niftyMidcap100 },
  { id: "niftyMidcap150", name: "Nifty Midcap 150", count: niftyMidcap150.length, category: "Mid Cap", symbols: niftyMidcap150 },
  { id: "niftySmallcap50", name: "Nifty Smallcap 50", count: niftySmallcap50.length, category: "Small Cap", symbols: niftySmallcap50 },
  { id: "niftySmallcap100", name: "Nifty Smallcap 100", count: niftySmallcap100.length, category: "Small Cap", symbols: niftySmallcap100 },
  { id: "niftySmallcap250", name: "Nifty Smallcap 250", count: niftySmallcap250.length, category: "Small Cap", symbols: niftySmallcap250 },
  { id: "nifty200", name: "Nifty 200", count: nifty200.length, category: "Broad Market", symbols: nifty200 },
  { id: "niftyLargeMidcap250", name: "Nifty LargeMidcap 250", count: niftyLargeMidcap250.length, category: "Broad Market", symbols: niftyLargeMidcap250 },
  { id: "niftyMidSmallcap400", name: "Nifty MidSmallcap 400", count: niftyMidSmallcap400.length, category: "Broad Market", symbols: niftyMidSmallcap400 },
  { id: "niftyMidSmallcap400_5050", name: "Nifty MidSmallcap400 50:50", count: niftyMidSmallcap400.length, category: "Broad Market", symbols: niftyMidSmallcap400 },
  { id: "nifty500", name: "Nifty 500", count: nifty500.length, category: "Broad Market", symbols: nifty500 },
  { id: "nifty500Multicap502525", name: "Nifty500 Multicap 50:25:25", count: nifty500.length, category: "Broad Market", symbols: nifty500 },
  { id: "nifty500EqualCap", name: "Nifty500 LargeMidSmall Equal-Cap", count: nifty500.length, category: "Broad Market", symbols: nifty500 },
  { id: "niftyMicrocap250", name: "Nifty Microcap 250", count: niftyMicrocap250.length, category: "Micro Cap", symbols: niftyMicrocap250 },
  { id: "niftyTotalMarket", name: "Nifty Total Market (Top 750)", count: niftyTotalMarket.length, category: "Broad Market", symbols: niftyTotalMarket },
  { id: "niftyIndiaFPI150", name: "Nifty India FPI 150", count: niftyIndiaFPI150.length, category: "Thematic / Institutional", symbols: niftyIndiaFPI150 },
  { id: "fnoUniverse", name: "Complete F&O Universe (131+ Stocks)", count: fnoUniverse.length, category: "Derivatives", symbols: fnoUniverse }
];

const fnoLotSizes = {
  "RELIANCE": 250, "TCS": 175, "INFY": 400, "HDFCBANK": 550, "ICICIBANK": 700,
  "SBIN": 750, "AXISBANK": 625, "KOTAKBANK": 400, "BAJFINANCE": 125, "BAJAJFINSV": 500,
  "TATAMOTORS": 1425, "MARUTI": 50, "M&M": 350, "SUNPHARMA": 350, "CIPLA": 650,
  "DRREDDY": 125, "DIVISLAB": 200, "TITAN": 175, "TATASTEEL": 5500, "JSWSTEEL": 675,
  "HINDALCO": 1400, "VEDL": 1500, "COALINDIA": 2100, "NTPC": 1500, "POWERGRID": 1800,
  "ONGC": 3850, "BPCL": 1800, "IOC": 4875, "BHARTIARTL": 475, "LT": 150,
  "ADANIENT": 300, "ADANIPORTS": 400, "ASIANPAINT": 200, "ITC": 1600, "HINDUNILVR": 300,
  "NESTLEIND": 20, "TATACONSUM": 900, "TRENT": 100, "EICHERMOT": 150, "HEROMOTOCO": 150,
  "TVSMOTOR": 350, "BAJAJ-AUTO": 75, "ULTRACEMCO": 100, "GRASIM": 250, "BEL": 2700,
  "HAL": 150, "DIXON": 100, "POLYCAB": 100, "HAVELLS": 500, "VOLTAS": 600,
  "GODREJPROP": 275, "DLF": 825, "OBEROIRLTY": 350, "INDIGO": 150, "PERSISTENT": 100,
  "COFORGE": 75, "LTIM": 150, "TECHM": 600, "WIPRO": 1500, "HCLTECH": 350,
  "PFC": 1300, "RECLTD": 1000, "CANBK": 6750, "BANKBARODA": 2925, "PNB": 8000,
  "FEDERALBNK": 5000, "INDUSINDBK": 500, "AUBANK": 1000, "IDFCFIRSTB": 7500, "BANDHANBNK": 3000,
  "MUTHOOTFIN": 550, "CHOLAFIN": 625, "SHRIRAMFIN": 300, "APOLLOHOSP": 125, "MAXHEALTH": 500,
  "AUROPHARMA": 550, "LUPIN": 425, "BIOCON": 2500, "GLENMARK": 725, "TORNTPHARM": 250,
  "ZYDUSLIFE": 900, "ALKEM": 125, "MANKIND": 200, "JINDALSTEL": 625, "NMDC": 4500,
  "SAIL": 8000, "NATIONALUM": 3750, "TATAPOWER": 1350, "JSWENERGY": 1000, "GAIL": 2650,
  "PETRONET": 3000, "IGL": 1375, "MGL": 400, "AMBUJACEM": 900, "SHREECEM": 25,
  "PIDILITIND": 250, "SRF": 375, "TATACHEM": 550, "UPL": 1300, "DABUR": 1250,
  "MARICO": 1200, "COLPAL": 350, "VBL": 1000, "BRITANNIA": 125, "BOSCHLTD": 25,
  "MOTHERSON": 3100, "ASHOKLEY": 5000, "BALKRISIND": 300, "APOLLOTYRE": 1700, "BHARATFORG": 500,
  "CUMMINSIND": 300, "SIEMENS": 125, "ABB": 125, "CGPOWER": 850, "IRCTC": 875,
  "CONCOR": 1000, "BHEL": 2625, "IRFC": 3500, "RVNL": 1500, "SUZLON": 7500,
  "IREDA": 3000, "HUDCO": 3500, "COCHINSHIP": 400, "BDL": 600, "MAZDOCK": 150,
  "MCX": 200, "BSE": 200, "NAUKRI": 125, "JUBLFOOD": 1250, "KPITTECH": 400, "MPHASIS": 275,
  "CRUDEOIL": 100, "CRUDEOILM": 10, "NATURALGAS": 1250, "NATGASMINI": 250,
  "GOLD": 100, "GOLDM": 10, "SILVER": 30, "SILVERM": 5, "SILVERMIC": 1,
  "COPPER": 2500, "ZINC": 5000, "ALUMINIUM": 5000, "LEAD": 5000
};

module.exports = {
  timeframe: "5m",
  nifty50Constituents,
  bankNiftyConstituents,
  sectorDefinitions,
  broadMarketIndices,

  nifty50,
  niftyNext50,
  nifty100,
  niftyMidcap50,
  niftyMidcapSelect,
  niftyMidcap100,
  niftyMidcap150,
  niftySmallcap50,
  niftySmallcap100,
  niftySmallcap250,
  nifty200,
  niftyLargeMidcap250,
  niftyMidSmallcap400,
  nifty500,
  niftyMicrocap250,
  niftyTotalMarket,
  niftyIndiaFPI150,
  fnoUniverse,
  liquidStocks: [],
  fnoLotSizes
};