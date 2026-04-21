const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const KCB_BUNI_API_KEY = process.env.KCB_BUNI_API_KEY;
const KCB_BUNI_API_SECRET = process.env.KCB_BUNI_API_SECRET;
const KCB_BUNI_SHORTCODE = process.env.KCB_BUNI_SHORTCODE;
const KCB_BUNI_API_URL = process.env.KCB_BUNI_API_URL || 'https://api.buni.kcbgroup.com/v1';

const getAccessToken = async () => {
  const credentials = Buffer.from(`${KCB_BUNI_API_KEY}:${KCB_BUNI_API_SECRET}`).toString('base64');
  
  try {
    const response = await axios.get(`${KCB_BUNI_API_URL}/auth/token`, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting KCB Buni access token:', error.response ? error.response.data : error.message);
    throw new Error('Could not authenticate with KCB Buni');
  }
};

const initiateSTKPush = async (phoneNumber, amount, transactionDesc) => {
  const accessToken = await getAccessToken();
  
  const payload = {
    "BusinessShortCode": KCB_BUNI_SHORTCODE,
    "Password": "YOUR_PASSWORD", // This should be generated as per KCB Buni documentation
    "Timestamp": new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3),
    "TransactionType": "CustomerPayBillOnline",
    "Amount": amount,
    "PartyA": phoneNumber,
    "PartyB": KCB_BUNI_SHORTCODE,
    "PhoneNumber": phoneNumber,
    "CallBackURL": `${process.env.BACKEND_URL}/api/payments/kcb/callback`,
    "AccountReference": "TradingApp",
    "TransactionDesc": transactionDesc
  };

  try {
    const response = await axios.post(`${KCB_BUNI_API_URL}/stkpush/v1/processrequest`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating KCB Buni STK push:', error.response ? error.response.data : error.message);
    throw new Error('Could not initiate STK push');
  }
};

module.exports = {
  initiateSTKPush,
};
