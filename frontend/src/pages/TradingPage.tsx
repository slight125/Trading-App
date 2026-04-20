import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tradingAPI } from "../api/client";
import TradingDashboard from "../components/TradingDashboard";

const TradingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const validateLink = async () => {
      if (!token) {
        setError("Invalid token");
        setIsValidating(false);
        return;
      }

      try {
        const response = await tradingAPI.validateLink(token);
        console.log("Link validated:", response.data);
        setIsValidated(true);
        setError("");
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || "Failed to validate trading link";
        setError(errorMessage);
        console.error("Link validation error:", err);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setIsValidating(false);
      }
    };

    validateLink();
  }, [token, navigate]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Validating trading link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isValidated) {
    return null;
  }

  return <TradingDashboard />;
};

export default TradingPage;
