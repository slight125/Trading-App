import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: "trader1@example.com" },
    update: {},
    create: {
      email: "trader1@example.com",
      password: await bcrypt.hash("password123", 10),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "trader2@example.com" },
    update: {},
    create: {
      email: "trader2@example.com",
      password: await bcrypt.hash("password123", 10),
    },
  });

  console.log("Created users:", { user1, user2 });

  // Create test payments
  const payment1 = await prisma.payment.create({
    data: {
      userId: user1.id,
      status: "completed",
      amount: 99.99,
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      userId: user2.id,
      status: "completed",
      amount: 99.99,
    },
  });

  console.log("Created payments:", { payment1, payment2 });

  // Create test trading links (valid for 24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const link1 = await prisma.tradingLink.create({
    data: {
      token: `token_${Date.now()}_1`,
      userId: user1.id,
      isUsed: false,
      expiresAt,
    },
  });

  const link2 = await prisma.tradingLink.create({
    data: {
      token: `token_${Date.now()}_2`,
      userId: user2.id,
      isUsed: false,
      expiresAt,
    },
  });

  console.log("Created trading links:", { link1, link2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
