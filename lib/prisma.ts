import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_POSTGRES_PRISMA_URL ?? process.env.SUPABASE_POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or SUPABASE_POSTGRES_PRISMA_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
