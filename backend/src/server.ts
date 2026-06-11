import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

// console.log(process.env.DATABASE_URL);

const app = express();
const prisma = new PrismaClient();

app.get("/", async (_, res) => {
    res.json({ status: "Database connected" });
});

app.get("/cards", async (_, res) => {
    const cards = await prisma.card.findMany();
    res.json(cards);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});