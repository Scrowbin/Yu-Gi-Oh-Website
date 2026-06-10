import type { MainDeckMonster } from "../types/card";
import Banner from "../components/Banner";
import { Routes,Route } from "react-router-dom";
;


export default function Home(){
    const banners = [
        {
            title: "Deck Builder",
            subtitle: "Create and share your own decks with the world!",
            image: "https://images.ygoprodeck.com/images/cards/1.jpg"
        },
        {
            title: "Tier List",
            subtitle: "View the current meta.",
            image: "https://images.ygoprodeck.com/images/cards/1.jpg"
        }
    ];

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-4">
            {banners.map((banner) => (
                <Banner
                    key={banner.title}
                    image={banner.image}
                    title={banner.title}
                    subtitle={banner.subtitle}
                />
            ))}
        </div>
    );
}