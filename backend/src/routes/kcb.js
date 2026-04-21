const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const { initiateSTKPush } = require("../services/kcbBuni");

const router = Router();
const prisma = new PrismaClient();

router.post("/initiate", authenticate, async (req, res) => {
  const { amount, phoneNumber } = req.body;
  const userId = req.userId;

  if (!amount || !phoneNumber) {
    return res.status(400).json({ error: "Amount and phone number are required" });
  }

  try {
    // Create a pending payment record in our database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: "pending",
        currency: "KES",
      },
    });

    // Initiate STK push
    const transactionDesc = `Payment for trading app access for user ${userId}`;
    const buniResponse = await initiateSTKPush(phoneNumber, amount, transactionDesc);

    // Update our payment record with the transaction ID from KCB Buni
    await prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: buniResponse.CheckoutRequestID },
    });

    res.json({ message: "STK push initiated. Please check your phone.", paymentId: payment.id });
  } catch (error) {
    console.error("KCB Buni initiation error:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

router.post("/callback", async (req, res) => {
  const callbackData = req.body;
  console.log("KCB Buni Callback received:", JSON.stringify(callbackData, null, 2));

  const { Body: { stkCallback } } = callbackData;
  const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

  try {
    const payment = await prisma.payment.findFirst({
      where: { transactionId: CheckoutRequestID },
    });

    if (!payment) {
      console.error(`Payment with transactionId ${CheckoutRequestID} not found.`);
      // Acknowledge receipt to KCB Buni
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (ResultCode === 0) {
      // Payment successful
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "completed" },
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
    }

    // Acknowledge receipt to KCB Buni
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Error processing KCB Buni callback:", error);
    // Acknowledge receipt to KCB Buni even if our internal processing fails
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

module.exports = router;
