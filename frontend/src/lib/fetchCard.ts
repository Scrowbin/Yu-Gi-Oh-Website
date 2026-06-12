import { cardNamesMatch } from "../lib/htmlEntities";
import type { Card, CardImageType } from "../types/card";

const IMAGE_FALLBACK_ORDER: CardImageType[] = ["full", "cropped", "small"];

function pickBannerImage(card: Card, imageType: CardImageType): string {
    if (card.images[imageType]) {
        return card.images[imageType]!;
    }
    for (const type of IMAGE_FALLBACK_ORDER) {
        if (card.images[type]) {
            return card.images[type]!;
        }
    }
    return "";
}

export default async function fetchCardImage(
    cardName: string,
    imageType: CardImageType,
): Promise<string> {
    const res = await fetch(
        `/api/cards/search/name?name=${encodeURIComponent(cardName)}`,
    );
    if (!res.ok) return "";

    const cards: Card[] = await res.json();
    const card =
        cards.find((c) => cardNamesMatch(c.name, cardName)) ?? cards[0];

    return card ? pickBannerImage(card, imageType) : "";
}
