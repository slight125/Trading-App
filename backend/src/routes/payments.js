const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = Router();
const prisma = new PrismaClient();

// Create payment
router.post("/create", authenticate, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        amount,
        description: description || "",
        status: "pending",
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post("/:id/confirm", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.userId !== req.userId) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "completed" },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments
router.get("/", authenticate, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
