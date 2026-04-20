const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const { generateTradingLinkToken, generateToken } = require("../utils/jwt");

const router = Router();
const prisma = new PrismaClient();

// Create trading link
router.post("/create-link", authenticate, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID required" });
    }

    // Verify payment exists and is completed
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.userId !== req.userId || payment.status !== "completed") {
      return res.status(400).json({ error: "Invalid or incomplete payment" });
    }

    const token = generateTradingLinkToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const link = await prisma.tradingLink.create({
      data: {
        token,
        userId: req.userId,
        paymentId,
        isUsed: false,
        expiresAt,
      },
    });

    res.status(201).json({
      ...link,
      url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/trade/${token}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trading links
router.get("/links", authenticate, async (req, res) => {
  try {
    const links = await prisma.tradingLink.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Validate and consume link (atomic transaction)
router.get("/validate-link/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Find link
      const link = await tx.tradingLink.findUnique({ where: { token } });

      if (!link) {
        throw new Error("Invalid link");
      }

      if (link.isUsed) {
        throw new Error("Link already used");
      }

      if (new Date() > link.expiresAt) {
        throw new Error("Link expired");
      }

      // Atomically mark as used
      await tx.tradingLink.update({
        where: { token },
        data: { isUsed: true },
      });

      // Fetch user
      const user = await tx.user.findUnique({ where: { id: link.userId } });
      return { user, link };
    });

    // Generate trading session token
    const tradingToken = generateToken(result.user.id, "trading");
    res.cookie("token", tradingToken, { httpOnly: true, secure: false, sameSite: "lax" });

    res.json({
      user: { id: result.user.id, email: result.user.email },
      session: "Trading session started",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
