import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import { cardNamesMatch } from "../lib/htmlEntities";
import type { Card, CardImageType } from "../types/card";
import { Link } from "react-router-dom";

const banners = [
    {
        title: "Deck Builder",
        subtitle: "Create and share your own decks with the world!",
        cardName: "Alba-Lenatus the Abyss Dragon",
        imageType: "cropped",
        route: "/deck-builder",
    },
    {
        title: "Tier List",
        subtitle: "View the current meta.",
        cardName: "The Fallen & The Virtuous",
        imageType: "cropped",
        route: "/tier-list",
    },
] as const satisfies ReadonlyArray<{
    title: string;
    subtitle: string;
    cardName: string;
    imageType: CardImageType;
    route: string;
}>;

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

async function fetchCardImage(
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

export default function Home() {
    const [bannerImages, setBannerImages] = useState<Record<string, string>>({});

    useEffect(() => {
        void (async () => {
            const entries = await Promise.all(
                banners.map(async ({ cardName, imageType }) => {
                    const image = await fetchCardImage(cardName, imageType);
                    return [`${cardName}:${imageType}`, image] as const;
                }),
            );
            setBannerImages(Object.fromEntries(entries));
        })();
    }, []);

    return (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {banners.map((banner) => (
                <Link key={banner.title} to={banner.route}>
                    <Banner
                        image={bannerImages[`${banner.cardName}:${banner.imageType}`]}
                        title={banner.title}
                        subtitle={banner.subtitle}
                    />
                </Link>
            ))}
        </div>
    );
}
