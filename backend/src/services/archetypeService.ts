import prisma from "../db/prisma.js";
import { cardNameSearchTerms } from "../lib/htmlEntities.js";
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
    const terms = cardNameSearchTerms(name);
    const cards = await prisma.card.findMany({
        where: {
            OR: terms.map((term) => ({
                name: { contains: term, mode: "insensitive" as const },
            })),
        },
        include: cardInclude,
        take: limit,
        orderBy: { name: "asc" },
    });

    return toApiCards(cards);
}
