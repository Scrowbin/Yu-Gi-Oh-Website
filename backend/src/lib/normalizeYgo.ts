/** Normalize YGOPRODeck JSON values for DB storage (lowercase / snake_case). */

const MONSTER_TYPE_TO_DB: Record<string, string> = {
    Normal: "normal",
    Effect: "effect",
    Union: "union",
    Spirit: "spirit",
    Flip: "flip",
    Gemini: "gemini",
    Toon: "toon",
    Ritual: "ritual",
    Fusion: "fusion",
    Synchro: "synchro",
    Xyz: "xyz",
    Pendulum: "pendulum",
    Link: "link",
    Tuner: "tuner",
};

const SPELL_TYPE_TO_DB: Record<string, string> = {
    Normal: "normal",
    Continuous: "continuous",
    "Quick-Play": "quick-play",
    Field: "field",
    Ritual: "ritual",
    Equip: "equip",
};

const TRAP_TYPE_TO_DB: Record<string, string> = {
    Normal: "normal",
    Continuous: "continuous",
    Counter: "counter",
};

const BAN_STATUS_TO_DB: Record<string, string> = {
    Forbidden: "forbidden",
    Limited: "limited",
    "Semi-Limited": "semi-limited",
};

export const EXTRA_DECK_TYPES_DB = new Set(["fusion", "synchro", "xyz", "link"]);

export function monsterTypesToDb(typeline: string[] | undefined): string[] {
    if (!typeline?.length) return [];
    return typeline.slice(1).map((t) => {
        const mapped = MONSTER_TYPE_TO_DB[t];
        if (!mapped) throw new Error(`Unknown monster card type: ${t}`);
        return mapped;
    });
}

export function spellTypeToDb(race: string): string {
    const mapped = SPELL_TYPE_TO_DB[race];
    if (!mapped) throw new Error(`Unknown spell type: ${race}`);
    return mapped;
}

export function trapTypeToDb(race: string): string {
    const mapped = TRAP_TYPE_TO_DB[race];
    if (!mapped) throw new Error(`Unknown trap type: ${race}`);
    return mapped;
}

export function banStatusToDb(raw: string): string {
    const mapped = BAN_STATUS_TO_DB[raw];
    if (!mapped) throw new Error(`Unknown ban status: ${raw}`);
    return mapped;
}

export function frameTypeToDb(frameType: string): string {
    return frameType;
}

export function cardKindToDb(type: string): "monster" | "spell" | "trap" {
    if (type === "Spell Card") return "spell";
    if (type === "Trap Card") return "trap";
    return "monster";
}

export function statToDb(value: number | string | undefined): string | null {
    if (value === undefined || value === null) return null;
    return String(value);
}

export function parseLevelAndRankDb(
    monsterCardType: string[],
    level?: number,
): { level: number | null; rank: number | null } {
    if (level === undefined) return { level: null, rank: null };
    if (monsterCardType.includes("xyz")) return { level: null, rank: level };
    return { level, rank: null };
}
