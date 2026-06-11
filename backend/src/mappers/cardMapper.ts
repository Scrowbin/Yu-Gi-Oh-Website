import type { Card as DbCard, Category, MasterDuelCard } from "@prisma/client";
import type {
    ApiCard,
    CardCategory,
    CardFrame,
    CardImages,
    CardStatus,
    MonsterCardType,
    Rarity,
} from "../types/card.js";

const FRAME_FROM_DB: Record<string, CardFrame> = {
    effect: "Effect",
    effect_pendulum: "Effect Pendulum",
    fusion: "Fusion",
    fusion_pendulum: "Fusion Pendulum",
    link: "Link",
    normal: "Normal",
    ritual: "Ritual",
    spell: "Spell",
    synchro: "Synchro",
    synchro_pendulum: "Synchro Pendulum",
    trap: "Trap",
    xyz: "Xyz",
    xyz_pendulum: "Xyz Pendulum",
};

const MONSTER_TYPE_FROM_DB: Record<string, MonsterCardType> = {
    normal: "Normal",
    effect: "Effect",
    union: "Union",
    spirit: "Spirit",
    flip: "Flip",
    gemini: "Gemini",
    toon: "Toon",
    ritual: "Ritual",
    fusion: "Fusion",
    synchro: "Synchro",
    xyz: "Xyz",
    pendulum: "Pendulum",
    link: "Link",
    tuner: "Tuner",
};

const CATEGORY_FROM_DB: Record<string, CardCategory> = {
    "hand-trap": "Hand-trap",
    floodgate: "Floodgate",
};

const RARITY_FROM_DB: Record<string, Rarity> = {
    "normal-n": "Normal (N)",
    rare: "Rare (R)",
    "super-rare": "Super Rare (SR)",
    "ultra-rare": "Ultra Rare (UR)",
};

export type DbCardWithRelations = DbCard & {
    categories?: { category: Category }[];
    masterDuel?: MasterDuelCard | null;
};

export type CardMapperContext = {
    status?: CardStatus;
};

function mapFrame(frame: string): CardFrame {
    const mapped = FRAME_FROM_DB[frame];
    if (!mapped) throw new Error(`Unknown cardFrame in DB: ${frame}`);
    return mapped;
}

function mapMonsterTypes(types: string[]): MonsterCardType[] {
    return types.map((t) => {
        const mapped = MONSTER_TYPE_FROM_DB[t];
        if (!mapped) throw new Error(`Unknown monsterCardType in DB: ${t}`);
        return mapped;
    });
}

function mapCategories(
    categories: { category: Category }[] | undefined,
): CardCategory[] | undefined {
    if (!categories?.length) return undefined;
    return categories.map(({ category }) => {
        const mapped = CATEGORY_FROM_DB[category.slug];
        return mapped ?? (category.name as CardCategory);
    });
}

function mapRarity(
    masterDuel: MasterDuelCard | null | undefined,
): Rarity | undefined {
    if (!masterDuel) return undefined;
    return RARITY_FROM_DB[masterDuel.rarity] ?? (masterDuel.rarity as Rarity);
}

function mapStat(value: string | null): number | "?" | undefined {
    if (value === null) return undefined;
    if (value === "?") return "?";
    const n = Number(value);
    return Number.isNaN(n) ? "?" : n;
}

function mapImages(card: DbCard): CardImages {
    return {
        ...(card.imageFull ? { full: card.imageFull } : {}),
        ...(card.imageCropped ? { cropped: card.imageCropped } : {}),
        ...(card.imageSmall ? { small: card.imageSmall } : {}),
    };
}

export function toApiCard(
    card: DbCardWithRelations,
    ctx: CardMapperContext = {},
): ApiCard {
    const base = {
        id: String(card.id),
        name: card.name,
        effect: card.effect,
        cardFrame: mapFrame(card.cardFrame),
        cardType: card.cardType as ApiCard["cardType"],
        status: ctx.status ?? "unlimited",
        images: mapImages(card),
    };

    const categories = mapCategories(card.categories);
    const rarity = mapRarity(card.masterDuel);

    if (card.cardType === "spell") {
        return {
            ...base,
            cardType: "spell",
            ...(categories ? { cardCategory: categories } : {}),
            ...(rarity ? { rarity } : {}),
            spellType: card.spellType,
        };
    }

    if (card.cardType === "trap") {
        return {
            ...base,
            cardType: "trap",
            ...(categories ? { cardCategory: categories } : {}),
            ...(rarity ? { rarity } : {}),
            trapType: card.trapType,
        };
    }

    const monster: ApiCard = {
        ...base,
        cardType: "monster",
        ...(categories ? { cardCategory: categories } : {}),
        ...(rarity ? { rarity } : {}),
        attribute: card.attribute,
        monsterRace: card.monsterRace,
        monsterCardType: mapMonsterTypes(card.monsterCardType),
        atk: mapStat(card.atk) ?? "?",
    };

    if (card.level !== null) {
        monster.level = card.level;
        monster.def = mapStat(card.def) ?? "?";
    }

    if (card.rank !== null) {
        monster.rank = card.rank;
        monster.def = mapStat(card.def) ?? "?";
    }

    if (card.material) monster.material = card.material;

    if (card.pendScale !== null) {
        monster.pendScale = card.pendScale;
        monster.pendEffect = card.pendEffect ?? "";
    }

    if (card.linkNumber !== null) {
        monster.linkNumber = card.linkNumber;
        monster.linkArrows = card.linkArrows;
    }

    return monster;
}

export function toApiCards(
    cards: DbCardWithRelations[],
    ctx: CardMapperContext = {},
): ApiCard[] {
    return cards.map((c) => toApiCard(c, ctx));
}
