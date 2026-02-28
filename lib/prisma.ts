import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    })
  } catch {
    return null
  }
}

export const prisma = global.prisma ?? (createPrismaClient() as PrismaClient)

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prisma = prisma
}
