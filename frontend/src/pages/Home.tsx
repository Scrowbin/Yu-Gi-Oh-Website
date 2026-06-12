import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import type { CardImageType } from "../types/card";
import { Link } from "react-router-dom";
import fetchCardImage from "../lib/fetchCard";

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
