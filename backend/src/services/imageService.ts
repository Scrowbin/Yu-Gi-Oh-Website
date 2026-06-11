import fs from "node:fs/promises";
import path from "node:path";
import prisma from "../db/prisma.js";
import { CARD_IMAGES_DIR } from "../lib/paths.js";

export type ImageType = "cropped" | "full" | "small";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

/** e.g. "A Hero Lives_8949584_cropped" */
export function buildImageBaseName(
    cardName: string,
    cardId: number,
    imageType: ImageType,
): string {
    return `${cardName}_${cardId}_${imageType}`;
}

function toPublicImageUrl(imageType: ImageType, fileName: string): string {
    return `/card_images/${imageType}/${encodeURIComponent(fileName)}`;
}

async function findImageFile(
    dir: string,
    cardName: string,
    cardId: number,
    imageType: ImageType,
): Promise<string | null> {
    const exactBase = buildImageBaseName(cardName, cardId, imageType);

    for (const ext of IMAGE_EXTENSIONS) {
        const fileName = `${exactBase}${ext}`;
        try {
            await fs.access(path.join(dir, fileName));
            return toPublicImageUrl(imageType, fileName);
        } catch {
            // try next extension
        }
    }

    const idSuffix = `_${cardId}_${imageType}.`;
    let entries: string[];
    try {
        entries = await fs.readdir(dir);
    } catch {
        return null;
    }

    const match = entries.find((file) => {
        const lower = file.toLowerCase();
        if (!lower.includes(idSuffix)) return false;
        return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
    });

    return match ? toPublicImageUrl(imageType, match) : null;
}

async function resolveLocalImageUrl(
    cardName: string,
    cardId: number,
    imageType: ImageType,
): Promise<string | null> {
    const dir = path.join(CARD_IMAGES_DIR, imageType);
    return findImageFile(dir, cardName, cardId, imageType);
}

export async function searchImageByName(
    name: string,
    imageType: ImageType = "full",
): Promise<string | null> {
    const card = await prisma.card.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true, name: true },
    });

    if (!card) return null;
    return resolveLocalImageUrl(card.name, card.id, imageType);
}

export async function searchImageById(
    id: number,
    imageType: ImageType = "full",
): Promise<string | null> {
    const card = await prisma.card.findUnique({
        where: { id },
        select: { id: true, name: true },
    });

    if (!card) return null;
    return resolveLocalImageUrl(card.name, card.id, imageType);
}
