/** API response shapes aligned with frontend/src/types/card.ts */

export type CardStatus =
    | "forbidden"
    | "limited"
    | "semi-limited"
    | "unlimited";

export type CardType = "monster" | "spell" | "trap";

export type CardCategory = "Hand-trap" | "Floodgate";

export type Rarity =
    | "Normal (N)"
    | "Rare (R)"
    | "Super Rare (SR)"
    | "Ultra Rare (UR)";

export type CardFrame =
    | "Effect"
    | "Effect Pendulum"
    | "Fusion"
    | "Fusion Pendulum"
    | "Xyz"
    | "Xyz Pendulum"
    | "Synchro"
    | "Synchro Pendulum"
    | "Link"
    | "Normal"
    | "Ritual"
    | "Spell"
    | "Trap";
    

export type MonsterCardType =
    | "Normal"
    | "Effect"
    | "Union"
    | "Spirit"
    | "Flip"
    | "Gemini"
    | "Toon"
    | "Ritual"
    | "Fusion"
    | "Synchro"
    | "Xyz"
    | "Pendulum"
    | "Link"
    | "Tuner";

/** Paths served by express.static at /card_images — use directly with fetch(). */
export interface CardImages {
    full?: string;
    cropped?: string;
    small?: string;
}

export interface ApiBaseCard {
    id: string;
    name: string;
    effect: string;
    status: CardStatus;
    cardFrame: CardFrame;
    cardType: CardType;
    images: CardImages;
    cardCategory?: CardCategory[];
    rarity?: Rarity;
}

export interface ApiMonsterCard extends ApiBaseCard {
    cardType: "monster";
    attribute: string | null;
    monsterRace: string | null;
    monsterCardType: MonsterCardType[];
    atk: number | "?";
    def?: number | "?";
    level?: number;
    rank?: number;
    material?: string;
    pendScale?: number;
    pendEffect?: string;
    linkNumber?: number;
    linkArrows?: string[];
}

export interface ApiSpellCard extends ApiBaseCard {
    cardType: "spell";
    spellType: string | null;
}

export interface ApiTrapCard extends ApiBaseCard {
    cardType: "trap";
    trapType: string | null;
}

export type ApiCard = ApiMonsterCard | ApiSpellCard | ApiTrapCard;
