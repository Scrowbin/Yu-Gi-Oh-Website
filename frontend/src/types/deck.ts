import type { Card } from "./card"

export interface Deck{
    mainDeck: Card[];
    extraDeck: Card[];
    sideDeck: Card[];
    
    deckId: string;
    date: Date;
    tournamentinfo: {
        placing: string;
        tournamentName: string;
        people: number;
    }
    format: string;
}

