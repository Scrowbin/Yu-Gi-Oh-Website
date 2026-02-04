import type { Card } from "../types/card";
import {isOnBanList } from "../types/card"; 

interface CardImage {
    card: Card;
}
const things ={
    "forbidden": "https://www.masterduelmeta.com/_app/immutable/assets/forbidden-49ca3c01.svg",
    "limited": "https://www.masterduelmeta.com/_app/immutable/assets/limited-1-464ca3c1.svg",
    "semi-limited": "https://www.masterduelmeta.com/_app/immutable/assets/limited-2-6c4a0f68.svg",
    "unlimited": ""
}
export function ImageWithBadge({ card }: CardImage) {
  return (
    <div className="relative inline-block">
        {/* Base image */}
        <img
            src={card.id}
            alt={card.name}
            className="z-[1] w-full h-auto aspect-1.46 overflow-clip [overflow-clip-margin:content-box]"
        />

        {/* Overlay / child */}
        {isOnBanList(card) &&
            <img src= {things[card.status]}
                className="absolute top-0 w-1/4 min-w-[20px] max-w-[40px] z-[2] drop-shadow-[1px_1px_2px_rgba(0,0,0,1)] overflow-clip [overflow-clip-margin:content-box]">
            </img>
        }
    </div>
  );
}

