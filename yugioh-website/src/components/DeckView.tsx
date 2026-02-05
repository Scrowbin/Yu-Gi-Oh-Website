import type { Card } from "../types/card";
import CardImage from "./CardImage";

interface DeckViewProps {
  cards: Card[];
}

export default function DeckView({ cards }: DeckViewProps) {
  return (
    <div className="w-full ">
      {cards.map(card => <CardImage card={card}/>)}
    </div>
  );
}
