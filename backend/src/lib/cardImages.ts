import fs from "node:fs/promises";
import path from "node:path";
import { CARD_IMAGES_DIR } from "./paths.js";

export type ImageType = "full" | "cropped" | "small";

export type CardImageUrls = {
    full?: string;
    cropped?: string;
    small?: string;
};

const IMAGE_TYPES: ImageType[] = ["full", "cropped", "small"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

/** full: "A Hero Lives_8949584" (no suffix) — cropped/small append _{type} */
export function buildImageBaseName(
    cardName: string,
    cardId: number,
    imageType: ImageType,
): string {
    if (imageType === "full") {
        return `${cardName}_${cardId}`;
    }
    return `${cardName}_${cardId}_${imageType}`;
}

function idSuffixForType(cardId: number, imageType: ImageType): string {
    if (imageType === "full") {
        return `_${cardId}.`;
    }
    return `_${cardId}_${imageType}.`;
}

export function toPublicImageUrl(imageType: ImageType, fileName: string): string {
    return `/card_images/${imageType}/${encodeURIComponent(fileName)}`;
}

async function findImageFile(
    cardName: string,
    cardId: number,
    imageType: ImageType,
): Promise<string | undefined> {
    const dir = path.join(CARD_IMAGES_DIR, imageType);
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

    const idSuffix = idSuffixForType(cardId, imageType);
    let entries: string[];
    try {
        entries = await fs.readdir(dir);
    } catch {
        return undefined;
    }

    const match = entries.find((file) => {
        const lower = file.toLowerCase();
        if (!lower.includes(idSuffix)) return false;
        if (imageType === "full") {
            if (lower.includes(`_${cardId}_cropped`)) return false;
            if (lower.includes(`_${cardId}_small`)) return false;
        }
        return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
    });

    return match ? toPublicImageUrl(imageType, match) : undefined;
}

export async function resolveCardImageUrls(
    cardName: string,
    cardId: number,
): Promise<CardImageUrls> {
    const entries = await Promise.all(
        IMAGE_TYPES.map(async (type) => {
            const url = await findImageFile(cardName, cardId, type);
            return [type, url] as const;
        }),
    );

    const images: CardImageUrls = {};
    for (const [type, url] of entries) {
        if (url) images[type] = url;
    }
    return images;
}
