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

export type TypeLine = [MonsterRace, ...MonsterCardType[]];

export type CardCategory =
    | "Hand-trap"
    | "Floodgate"

export type Rarity =
    | "Normal (N)"
    | "Rare (R)" 
    | "Super Rare (SR)" 
    | "Ultra Rare (UR)"    

export type CardFrame =
    | "Effect"
    | "Effect Pendulum"
    | "Fusion"
    | "Fusion Pendulum"
    | "Link"
    | "Normal"
    | "Ritual"
    | "Spell"
    | "Synchro"
    | "Trap"
    | "Xyz"
    | "Xyz Pendulum"

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

export type MonsterRace = 
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

    // i dont know if i should seperate these into their own seperate tag for meta filtering
    // | "Main Deck"
    // | "Special Summon"
    // | "Extra Deck"
    // | "Non-Effect"
    // | "Generic Materials"

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

    monsterRace: MonsterRace;
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

export type ExtraDeckMonster =
    | FusionMonster    | SynchroMonster    | XyzMonster    | LinkMonster
    | PendulumFusion    | PendulumSynchro    | PendulumXyz;

/* ======================================================
   Monster type guards 
   ====================================================== */    
export const isLink = (card: MonsterCard): card is LinkMonster => 
    card.monsterCardType.includes("Link");

export const isXyz = (card: MonsterCard): card is XyzMonster => 
    card.monsterCardType.includes("Xyz");

export const isFusion = (card: MonsterCard): card is FusionMonster | PendulumFusion =>
    card.monsterCardType.includes("Fusion")

export const isPendulum = (card: MonsterCard): card is (MonsterCard & IsPendulum) => 
    card.monsterCardType.includes("Pendulum");

export const isSynchro = (card: MonsterCard): card is (SynchroMonster | PendulumSynchro) =>
    card.monsterCardType.includes("Synchro");

export const hasLevel = (card: MonsterCard): card is (MonsterCard & HasLevel) =>
    'level' in card;

// export const isMainDeck = (card: MonsterCard): card is (MonsterCard & HasLevel) =>
//     card.monsterCardType.includes("Main Deck");

export const isExtraDeck = (card: MonsterCard): card is ExtraDeckMonster =>
    isFusion(card) ||
    isSynchro(card) ||
    isXyz(card) ||
    isLink(card);

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
        | "ritual"
        | "equip";
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


// example 
// const blueEyes: MainDeckMonster = {
//     id: "0001",
//     name: "Blue-Eyes White Dragon",
//     effect: "This legendary dragon is a powerful engine of destruction.",
//     status: "unlimited",
//     cardFrame: "Normal",
//     cardType: "monster",
//     rarity: "Ultra Rare (UR)",

//     attribute: "LIGHT",
//     monsterType: "Dragon",
//     monsterCardType: ["Normal", "Main Deck"],

//     atk: 3000,
//     def: 2500,
//     level: 8,
// };