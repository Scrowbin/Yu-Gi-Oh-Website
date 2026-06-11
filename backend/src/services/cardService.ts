import prisma from "../db/prisma.js";
import { toApiCard, toApiCards } from "../mappers/cardMapper.js";
import type { ApiCard } from "../types/card.js";

const cardInclude = {
    categories: { include: { category: true } },
    masterDuel: true,
} as const;

export async function getCardById(id: number): Promise<ApiCard | null> {
    const card = await prisma.card.findUnique({
        where: { id },
        include: cardInclude,
    });

    if (!card) return null;
    return toApiCard(card);
}

export async function getIdFromName(name: string): Promise<number | null> {
    const card = await prisma.card.findFirst({
        where: { name: { contains: name, mode: "insensitive" } },
        select: { id: true },
    });
    return card?.id ?? null;
}

export async function searchCardsByName(
    name: string,
    limit = 20,
): Promise<ApiCard[]> {
    const cards = await prisma.card.findMany({
        where: {
            name: { contains: name, mode: "insensitive" },
        },
        include: cardInclude,
        take: limit,
        orderBy: { name: "asc" },
    });

    return toApiCards(cards);
}
