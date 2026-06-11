import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../src/db/prisma.js";
import {
  banStatusToDb,
  cardKindToDb,
  EXTRA_DECK_TYPES_DB,
  frameTypeToDb,
  monsterTypesToDb,
  parseLevelAndRankDb,
  spellTypeToDb,
  statToDb,
  trapTypeToDb,
} from "../src/lib/normalizeYgo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_DIR = path.resolve(__dirname, "../cards");
const BANLIST_EFFECTIVE_DATE = new Date("2025-01-01");

interface YgoCardJson {
  id: number;
  name: string;
  typeline?: string[];
  type: string;
  frameType: string;
  desc: string;
  pend_desc?: string;
  monster_desc?: string;
  race: string;
  atk?: number | string;
  def?: number | string;
  level?: number;
  attribute?: string;
  archetype?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  ygoprodeck_url?: string;
  card_images?: { image_url: string }[];
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
    ban_goat?: string;
  };
}

function parseTypeline(ygo: YgoCardJson): { monsterRace: string | null; monsterCardType: string[] } {
  if (!ygo.typeline?.length) {
    return { monsterRace: null, monsterCardType: [] };
  }
  const [race, ..._rest] = ygo.typeline;
  return {
    monsterRace: race ?? null,
    monsterCardType: monsterTypesToDb(ygo.typeline),
  };
}

function isExtraDeck(monsterCardType: string[]): boolean {
  return monsterCardType.some((t) => EXTRA_DECK_TYPES_DB.has(t));
}

function parseMaterial(ygo: YgoCardJson, monsterCardType: string[]): string | null {
  if (!isExtraDeck(monsterCardType)) return null;
  const source = ygo.monster_desc ?? ygo.desc;
  return source.split(/\r?\n/)[0]?.trim() || null;
}

function parseMonsterEffect(ygo: YgoCardJson): string {
  return ygo.monster_desc ?? ygo.desc;
}

function toCardCreateInput(ygo: YgoCardJson) {
  const cardType = cardKindToDb(ygo.type);
  const { monsterRace, monsterCardType } = parseTypeline(ygo);
  const { level, rank } = parseLevelAndRankDb(monsterCardType, ygo.level);
  const isPendulum = monsterCardType.includes("pendulum");
  const isLink = monsterCardType.includes("link");

  const imageUrl = ygo.card_images?.[0]?.image_url;
  if (!imageUrl) {
    throw new Error(`Missing image for card ${ygo.id} (${ygo.name})`);
  }

  return {
    id: ygo.id,
    name: ygo.name,
    effect: parseMonsterEffect(ygo),
    cardFrame: frameTypeToDb(ygo.frameType),
    cardType,
    attribute: ygo.attribute ?? null,
    monsterRace,
    monsterCardType,
    atk: statToDb(ygo.atk),
    def: isLink ? null : statToDb(ygo.def),
    level,
    rank,
    material: parseMaterial(ygo, monsterCardType),
    pendScale: isPendulum ? (ygo.scale ?? null) : null,
    pendEffect: isPendulum ? (ygo.pend_desc ?? null) : null,
    linkNumber: isLink ? (ygo.linkval ?? null) : null,
    linkArrows: isLink ? (ygo.linkmarkers ?? []) : [],
    spellType: cardType === "spell" ? spellTypeToDb(ygo.race) : null,
    trapType: cardType === "trap" ? trapTypeToDb(ygo.race) : null,
    archetype: ygo.archetype ?? null,
    imageUrl,
    ygoprodeckUrl: ygo.ygoprodeck_url ?? null,
  };
}

async function readYgoCards(): Promise<YgoCardJson[]> {
  const files = await fs.readdir(CARDS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const cards: YgoCardJson[] = [];
  for (const file of jsonFiles) {
    const raw = await fs.readFile(path.join(CARDS_DIR, file), "utf8");
    cards.push(JSON.parse(raw) as YgoCardJson);
  }
  return cards;
}

async function seedBanlists() {
  const banlists = [
    { slug: "tcg", name: "TCG Forbidden & Limited List" },
    { slug: "ocg", name: "OCG Forbidden & Limited List" },
    { slug: "goat", name: "GOAT Format Banlist" },
  ] as const;

  for (const banlist of banlists) {
    await prisma.banlist.upsert({
      where: { slug: banlist.slug },
      create: banlist,
      update: { name: banlist.name },
    });
  }
}

async function importBanlistEntries(
  ygoCards: YgoCardJson[],
  slug: "tcg" | "ocg",
  field: "ban_tcg" | "ban_ocg",
) {
  const banlist = await prisma.banlist.findUniqueOrThrow({ where: { slug } });

  const snapshot = await prisma.banlistSnapshot.upsert({
    where: {
      banlistId_effectiveDate: {
        banlistId: banlist.id,
        effectiveDate: BANLIST_EFFECTIVE_DATE,
      },
    },
    create: {
      banlistId: banlist.id,
      effectiveDate: BANLIST_EFFECTIVE_DATE,
    },
    update: {},
  });

  await prisma.banlistEntry.deleteMany({ where: { snapshotId: snapshot.id } });

  const entries = ygoCards
    .filter((c) => c.banlist_info?.[field])
    .map((c) => ({
      snapshotId: snapshot.id,
      cardId: c.id,
      status: banStatusToDb(c.banlist_info![field]!),
    }));

  if (entries.length > 0) {
    await prisma.banlistEntry.createMany({ data: entries });
  }

  return entries.length;
}

async function main() {
  console.log(`Reading cards from ${CARDS_DIR}...`);
  const ygoCards = await readYgoCards();
  console.log(`Found ${ygoCards.length} JSON files.`);

  let imported = 0;
  for (const ygo of ygoCards) {
    const data = toCardCreateInput(ygo);
    await prisma.card.upsert({
      where: { id: ygo.id },
      create: data,
      update: data,
    });
    imported++;
  }
  console.log(`Upserted ${imported} cards.`);

  await seedBanlists();
  console.log("Seeded banlists: tcg, ocg, goat (goat has no snapshot — frozen format).");

  const tcgCount = await importBanlistEntries(ygoCards, "tcg", "ban_tcg");
  const ocgCount = await importBanlistEntries(ygoCards, "ocg", "ban_ocg");
  console.log(
    `Banlist snapshot ${BANLIST_EFFECTIVE_DATE.toISOString().slice(0, 10)}: ` +
      `${tcgCount} TCG entries, ${ocgCount} OCG entries.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
