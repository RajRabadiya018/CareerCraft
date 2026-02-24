import { PrismaClient } from "@prisma/client";

// Clear any cached client with old config (fixes hot-reload stale timeout)
if (globalThis.prisma) {
  delete globalThis.prisma;
}

export const db = new PrismaClient({
  transactionOptions: {
    maxWait: 10000,
    timeout: 30000,
  },
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
