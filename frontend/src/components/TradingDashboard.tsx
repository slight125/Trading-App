import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MOCK_TICKERS,
  MOCK_CHART_DATA,
  MOCK_ORDER_BOOK,
  MOCK_RECENT_TRADES,
} from "../constants/mockData";
import { Ticker, ChartDataPoint, Order } from "../types";

const TradingDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC");
  const [currentTicker, setCurrentTicker] = useState<Ticker>(MOCK_TICKERS.BTC);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(MOCK_CHART_DATA);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState<string>("1.0");
  const [price, setPrice] = useState<string>(currentTicker.price.toString());
  const [executedOrders, setExecutedOrders] = useState<Order[]>([]);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTicker((prev) => {
        const priceChange = (Math.random() - 0.5) * 100;
        const newPrice = Math.max(prev.price + priceChange, 100);
        return {
          ...prev,
          price: newPrice,
          change: newPrice - prev.price,
          changePercent: ((newPrice - prev.price) / prev.price) * 100,
        };
      });

      // Update chart data (simulating price history)
      setChartData((prev) => {
        const newData = [...prev.slice(1)];
        const lastPrice = newData[newData.length - 1]?.price || currentTicker.price;
        const newPrice = Math.max(lastPrice + (Math.random() - 0.5) * 50, 100);
        newData.push({
          time: new Date().toLocaleTimeString().slice(0, 5),
          price: newPrice,
        });
        return newData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [currentTicker]);

  // Handle symbol change
  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    const ticker = MOCK_TICKERS[symbol];
    setCurrentTicker(ticker);
    setPrice(ticker.price.toString());
  };

  // Handle order execution
  const handleExecuteOrder = () => {
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      symbol: currentTicker.symbol,
      type: orderType,
      side: orderSide,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      timestamp: new Date(),
      status: "filled",
    };

    setExecutedOrders([newOrder, ...executedOrders.slice(0, 9)]);
    setShowOrderConfirm(true);

    // Reset confirmation after 2 seconds
    setTimeout(() => setShowOrderConfirm(false), 2000);
  };

  const totalValue = parseFloat(quantity) * parseFloat(price);
  const isValidOrder = quantity && price && parseFloat(quantity) > 0 && parseFloat(price) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Trading Terminal
          </h1>
          <div className="text-sm text-gray-400">
            Session Active • {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chart and Ticker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticker Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 flex-wrap"
            >
              {Object.keys(MOCK_TICKERS).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSymbolChange(symbol)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedSymbol === symbol
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </motion.div>

            {/* Current Price Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-gray-400 text-sm mb-1">{currentTicker.symbol}</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {currentTicker.price.toFixed(2)}
                    </span>
                    <motion.span
                      key={currentTicker.change}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-lg font-semibold ${
                        currentTicker.change >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {currentTicker.change >= 0 ? "+" : ""}
                      {currentTicker.change.toFixed(2)}
                    </motion.span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-sm">24h High</p>
                  <p className="text-white font-semibold">
                    {currentTicker.high.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm mt-3">24h Low</p>
                  <p className="text-white font-semibold">
                    {currentTicker.low.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                <div>
                  <p className="text-gray-400 text-sm">24h Change %</p>
                  <p
                    className={`text-lg font-semibold ${
                      currentTicker.changePercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {currentTicker.changePercent >= 0 ? "+" : ""}
                    {currentTicker.changePercent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Volume</p>
                  <p className="text-lg font-semibold text-white">
                    {(currentTicker.volume / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Price Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Price Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #a855f7",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Right Column: Order Entry & Book */}
          <div className="space-y-6">
            {/* Order Entry Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 text-white">Place Order</h3>

              {/* Order Type Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["buy", "sell"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setOrderSide(side)}
                    className={`py-2 rounded-lg font-semibold transition ${
                      orderSide === side
                        ? side === "buy"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-slate-700/50 text-gray-300"
                    }`}
                  >
                    {side.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Order Type */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["market", "limit"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`py-2 rounded-lg font-semibold text-sm transition ${
                      orderType === type
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700/50 text-gray-300"
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Price Input (only for limit orders) */}
              {orderType === "limit" && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}

              {/* Total Value */}
              <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  ${isValidOrder ? totalValue.toFixed(2) : "0.00"}
                </p>
              </div>

              {/* Execute Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecuteOrder}
                disabled={!isValidOrder}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  orderSide === "buy"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {orderSide === "buy" ? "Buy" : "Sell"} {currentTicker.symbol}
              </motion.button>

              {/* Order Confirmation Animation */}
              {showOrderConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-4 p-4 bg-green-600/20 border border-green-500/50 rounded-lg text-green-300 text-center font-semibold"
                >
                  ✓ Order Executed Successfully!
                </motion.div>
              )}
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 max-h-72 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Orders</h3>
              {executedOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {executedOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`p-3 rounded-lg text-sm ${
                        order.side === "buy"
                          ? "bg-green-900/20 border border-green-500/30"
                          : "bg-red-900/20 border border-red-500/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {order.side === "buy" ? "📈" : "📉"} {order.side.toUpperCase()}{" "}
                            {order.quantity} {order.symbol}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            @ ${order.price.toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            order.side === "buy"
                              ? "bg-green-500/30 text-green-300"
                              : "bg-red-500/30 text-red-300"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Order Book Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Order Book</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-red-400 font-semibold mb-2">ASKS</p>
                  {MOCK_ORDER_BOOK.asks.slice(0, 5).map((ask, idx) => (
                    <div key={idx} className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">${ask.price.toFixed(0)}</span>
                      <span className="text-red-400">{ask.quantity.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-green-400 font-semibold mb-2">BIDS</p>
                  {MOCK_ORDER_BOOK.bids.slice(0, 5).map((bid, idx) => (
                    <div key={idx} className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">${bid.price.toFixed(0)}</span>
                      <span className="text-green-400">{bid.quantity.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Market Trades */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Market Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left text-gray-400 py-2 px-2">Time</th>
                  <th className="text-left text-gray-400 py-2 px-2">Side</th>
                  <th className="text-left text-gray-400 py-2 px-2">Price</th>
                  <th className="text-left text-gray-400 py-2 px-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_TRADES.map((trade) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-purple-500/10 hover:bg-purple-500/10"
                  >
                    <td className="py-2 px-2 text-gray-400">
                      {trade.timestamp.toLocaleTimeString()}
                    </td>
                    <td
                      className={`py-2 px-2 font-semibold ${
                        trade.side === "buy" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="py-2 px-2 text-white">${trade.price.toFixed(0)}</td>
                    <td className="py-2 px-2 text-white">{trade.quantity.toFixed(3)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingDashboard;
