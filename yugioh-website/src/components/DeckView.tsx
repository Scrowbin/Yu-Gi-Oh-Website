import type { Card } from "../types/card";
import {isOnBanList } from "../types/card"; 

interface DeckViewProps {
  cards: Card[];
}

export default function DeckView({ cards }: DeckViewProps) {
  return (
    <div className="w-full ">
      {cards.map(card => (
        <div key={card.id}>
          {card.name}
        </div>
      ))}
    </div>
  );
}
