import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

  console.log("Seeding admin user...");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin",
      instrument: "guitar",
      level: "advanced",
      goals: "Admin account for managing Practice Arena data.",
    },
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      nickname: "Admin",
      instrument: "guitar",
      level: "advanced",
      goals: "Admin account for managing Practice Arena data.",
      role: "admin",
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
