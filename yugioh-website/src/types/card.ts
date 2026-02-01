/* =========================
   General card literals
   ========================= */

export type CardStatus =
    | "forbidden"
    | "limited"
    | "semi-limited"
    | "unlimited";

export type CardType =
    | "monster"
    | "spell"
    | "trap";

export type CardCategory =
    | "Hand-trap"
    | "Floodgate"

export type Rarity =
    | "Normal (N)"
    | "Rare (R)" 
    | "Super Rare (SR)" 
    | "Ultra Rare (UR)"    

export type CardFrame =
    | "Overframe"
    | "Normal"

/* =========================
   Monster related literals
   ========================= */

export type MonsterAttribute =
    | "DARK"
    | "LIGHT"
    | "FIRE"
    | "WATER"
    | "EARTH"
    | "WIND"
    | "DIVINE";

export type MonsterType = 
    | "Spellcaster"
    | "Dragon"
    | "Zombie"
    | "Warrior"
    | "Beast-Warrior"
    | "Beast"
    | "Winged Beast"
    | "Machine"
    | "Fiend"
    | "Fairy"
    | "Insect"
    | "Dinosaur"
    | "Reptile"
    | "Fish"
    | "Sea Serpent"
    | "Aqua"
    | "Pyro"
    | "Thunder"
    | "Rock"
    | "Plant"
    | "Psychic"
    | "Wyrm"
    | "Cyberse"
    | "Divine-Beast"
    | "Illusion"

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
    | "Tuner"
    | "Main Deck"
    | "Special Summon"
    | "Extra Deck"
    | "Non-Effect"
    | "Generic Materials"

export type LinkArrows =
    | "Top-Left" 
    | "Top" 
    | "Top-Right" 
    | "Left" 
    | "Right" 
    | "Bottom-Left" 
    | "Bottom" 
    | "Bottom-Right" 

/* =========================
   Base card
   ========================= */

export interface BaseCard {
    id: string;
    name: string;
    effect: string;
    status: CardStatus;
    cardFrame: CardFrame;
    cardType: CardType;
    cardCategory?: CardCategory[]; //e.g. floodgate, handtrap, non-engine,... similar to above
    rarity: Rarity
}


/* =========================
   Monster mixins 
   ========================= */
interface HasLevel { level: number; def: number | "?"; }
interface HasRank  { rank: number; def: number | "?"; }
interface HasLink  { linkNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; linkArrows: LinkArrows[]; }
interface IsPendulum { pendScale: number; pendEffect: string; }

/* ======================================================
   monster base + main/extra
   ====================================================== */

export interface MonsterBase extends BaseCard {
    cardType: "monster";

    attribute: MonsterAttribute;

    monsterType: MonsterType;
    monsterCardType: MonsterCardType[];
    atk: number|"?";
}

export interface MainDeckMonster extends MonsterBase, HasLevel {}
export interface ExtraDeckBase extends MonsterBase {
    material: string;
}

/* ======================================================
    monster types
   ====================================================== */

export interface FusionMonster extends ExtraDeckBase, HasLevel {}
export interface SynchroMonster extends ExtraDeckBase, HasLevel {}
export interface XyzMonster extends ExtraDeckBase, HasRank {}
export interface LinkMonster extends ExtraDeckBase, HasLink {}
export interface PendulumMain extends MainDeckMonster, IsPendulum {}
export interface PendulumFusion extends FusionMonster, IsPendulum {}
export interface PendulumSynchro extends SynchroMonster, IsPendulum {}
export interface PendulumXyz extends XyzMonster, IsPendulum {}


export type MonsterCard = 
    | MainDeckMonster | FusionMonster | SynchroMonster | XyzMonster | LinkMonster 
    | PendulumMain | PendulumFusion | PendulumSynchro | PendulumXyz;

/* ======================================================
   Monster type guards 
   ====================================================== */    
export const isLink = (card: MonsterCard): card is LinkMonster => 
    card.monsterCardType.includes("Link");

export const isXyz = (card: MonsterCard): card is XyzMonster => 
    card.monsterCardType.includes("Xyz");

export const isPendulum = (card: MonsterCard): card is (MonsterCard & IsPendulum) => 
    card.monsterCardType.includes("Pendulum");

export const isSynchro = (card: MonsterCard): card is (MonsterCard & HasLevel) =>
    card.monsterCardType.includes("Synchro");

export const hasLevel = (card: MonsterCard): card is (MonsterCard & HasLevel) =>
    'level' in card;

export const isMainDeck = (card: MonsterCard): card is (MonsterCard & HasLevel) =>
    card.monsterCardType.includes("Main Deck");

export const isExtraDeck = (card: MonsterCard): card is (MonsterCard & ExtraDeckBase) =>
    card.monsterCardType.includes("Extra Deck");

export const isOnBanList = (card: Card) => card.status !== "unlimited" && !!card.status;

/* ======================================================
   Spell & Trap cards
   ====================================================== */

export interface SpellCard extends BaseCard {
    cardType: "spell";
    spellType:
        | "normal"
        | "continuous"
        | "quick-play"
        | "field"
        | "ritual";
}


export interface TrapCard extends BaseCard {
    cardType: "trap";
    trapType:
        | "normal"
        | "continuous"
        | "counter";
}

/* ======================================================
   Unified card type
   ====================================================== */

export type Card =
    | MonsterCard
    | SpellCard
    | TrapCard;
