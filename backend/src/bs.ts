import { PrismaClient } from "@prisma/client";

console.log(PrismaClient);

const prisma = new PrismaClient();

console.log("constructed");