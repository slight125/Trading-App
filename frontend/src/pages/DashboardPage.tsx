import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentAPI, tradingAPI } from "../api/client";

interface Payment {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface TradingLink {
  id: string;
  token: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tradingLinks, setTradingLinks] = useState<TradingLink[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch payments and links on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchPayments();
    fetchLinks();
  }, [user, navigate]);

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true);
      const response = await paymentAPI.getPayments();
      setPayments(response.data);
      setPaymentError("");
    } catch (error: any) {
      setPaymentError(error.response?.data?.error || "Failed to fetch payments");
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchLinks = async () => {
    try {
      setIsLoadingLinks(true);
      const response = await tradingAPI.getLinks();
      setTradingLinks(response.data);
      setLinkError("");
    } catch (error: any) {
      setLinkError(error.response?.data?.error || "Failed to fetch links");
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleCreatePayment = async () => {
    setPaymentError("");
    setIsCreatingPayment(true);

    try {
      const response = await paymentAPI.createPayment(99.99);
      const paymentId = response.data.payment.id;

      // In production, you would redirect to a payment provider (Stripe, PayPal, etc.)
      // For now, we'll simulate confirmation
      await paymentAPI.confirmPayment(paymentId);

      setPayments([...payments, response.data.payment]);
      alert("Payment confirmed! You can now create a trading link.");
    } catch (error: any) {
      setPaymentError(error.response?.data?.error || "Payment failed");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCreateLink = async () => {
    setLinkError("");
    setIsCreatingLink(true);

    try {
      const response = await tradingAPI.createLink();
      setTradingLinks([{ ...response.data.link, id: Date.now().toString() }, ...tradingLinks]);

      // Show the link to the user
      alert(`Your trading link has been created! Share this with your user:\n\n${response.data.link.url}`);
    } catch (error: any) {
      setLinkError(error.response?.data?.error || "Failed to create link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const hasCompletedPayment = payments.some((p) => p.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.email}</p>
      </div>

      {/* Payments Section */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Payment & Trading Links</h2>

        {paymentError && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
            {paymentError}
          </div>
        )}

        {/* Payment Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Payment Status</h3>
          {isLoadingPayments ? (
            <p className="text-gray-400">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="text-gray-400">No payments yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-4 rounded-lg border ${
                    payment.status === "completed"
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-yellow-900/20 border-yellow-500/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Payment</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status === "completed"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">${payment.amount}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!hasCompletedPayment && (
            <button
              onClick={handleCreatePayment}
              disabled={isCreatingPayment}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isCreatingPayment ? "Processing..." : "Make Payment ($99.99)"}
            </button>
          )}
        </div>

        {/* Trading Links */}
        <div className="mt-8 pt-8 border-t border-purple-500/30">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Trading Links</h3>

          {linkError && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
              {linkError}
            </div>
          )}

          {hasCompletedPayment ? (
            <>
              {isLoadingLinks ? (
                <p className="text-gray-400">Loading links...</p>
              ) : tradingLinks.length === 0 ? (
                <p className="text-gray-400 mb-4">No trading links yet</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {tradingLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-4 rounded-lg border flex items-center justify-between ${
                        link.isUsed
                          ? "bg-red-900/20 border-red-500/30 opacity-60"
                          : "bg-slate-700/50 border-purple-500/30"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-mono text-gray-400 truncate">{link.token}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {link.isUsed ? "Used" : "Active"} •{" "}
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!link.isUsed && (
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/trade/${link.token}`,
                              link.token
                            )
                          }
                          className={`px-3 py-1 rounded text-sm font-semibold transition ${
                            copiedToken === link.token
                              ? "bg-green-500/30 text-green-300"
                              : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          }`}
                        >
                          {copiedToken === link.token ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleCreateLink}
                disabled={isCreatingLink}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isCreatingLink ? "Creating..." : "Create Trading Link"}
              </button>
            </>
          ) : (
            <p className="text-gray-400">Complete a payment to create trading links</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
