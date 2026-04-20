import {
  Ticker,
  ChartDataPoint,
  OrderBook,
  RecentTrade,
} from "../types/index";

// Mock ticker data for various trading pairs
export const MOCK_TICKERS: Record<string, Ticker> = {
  BTC: {
    symbol: "BTC/USD",
    price: 42350,
    change: 1250,
    changePercent: 3.05,
    high: 43000,
    low: 41200,
    volume: 28500000,
  },
  ETH: {
    symbol: "ETH/USD",
    price: 2280,
    change: 85,
    changePercent: 3.88,
    high: 2320,
    low: 2150,
    volume: 15200000,
  },
  AAPL: {
    symbol: "AAPL",
    price: 189.45,
    change: 2.15,
    changePercent: 1.14,
    high: 191.2,
    low: 187.8,
    volume: 52300000,
  },
  MSFT: {
    symbol: "MSFT",
    price: 378.91,
    change: 5.22,
    changePercent: 1.39,
    high: 381.5,
    low: 375.2,
    volume: 18900000,
  },
};

// Mock chart data (simulates price history)
export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { time: "09:00", price: 41500 },
  { time: "09:30", price: 41800 },
  { time: "10:00", price: 41600 },
  { time: "10:30", price: 42000 },
  { time: "11:00", price: 42250 },
  { time: "11:30", price: 42100 },
  { time: "12:00", price: 42350 },
  { time: "12:30", price: 42450 },
  { time: "13:00", price: 42300 },
  { time: "13:30", price: 42500 },
  { time: "14:00", price: 42350 },
];

// Mock order book data
export const MOCK_ORDER_BOOK: OrderBook = {
  bids: [
    { price: 42340, quantity: 0.5 },
    { price: 42330, quantity: 1.2 },
    { price: 42320, quantity: 0.8 },
    { price: 42310, quantity: 2.1 },
    { price: 42300, quantity: 1.5 },
  ],
  asks: [
    { price: 42360, quantity: 0.7 },
    { price: 42370, quantity: 1.3 },
    { price: 42380, quantity: 0.9 },
    { price: 42390, quantity: 1.8 },
    { price: 42400, quantity: 2.2 },
  ],
};

// Mock recent trades
export const MOCK_RECENT_TRADES: RecentTrade[] = [
  {
    id: "1",
    symbol: "BTC/USD",
    price: 42350,
    quantity: 0.25,
    side: "buy",
    timestamp: new Date(Date.now() - 2 * 60000),
  },
  {
    id: "2",
    symbol: "BTC/USD",
    price: 42340,
    quantity: 0.5,
    side: "sell",
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "3",
    symbol: "BTC/USD",
    price: 42330,
    quantity: 1.2,
    side: "buy",
    timestamp: new Date(Date.now() - 8 * 60000),
  },
  {
    id: "4",
    symbol: "BTC/USD",
    price: 42310,
    quantity: 0.75,
    side: "sell",
    timestamp: new Date(Date.now() - 12 * 60000),
  },
  {
    id: "5",
    symbol: "BTC/USD",
    price: 42300,
    quantity: 2.0,
    side: "buy",
    timestamp: new Date(Date.now() - 15 * 60000),
  },
];
