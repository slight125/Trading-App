// Types for the Trading Application

export interface User {
  id: string;
  email: string;
}

export interface TradingSession {
  sessionToken: string;
  expiresAt: string;
  userId: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: "market" | "limit";
  side: "buy" | "sell";
  quantity: number;
  price: number;
  timestamp: Date;
  status: "pending" | "filled" | "cancelled";
}

export interface Ticker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}

export interface OrderBook {
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
}

export interface RecentTrade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  timestamp: Date;
}
