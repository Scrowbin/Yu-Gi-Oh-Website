import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../../src/db/prisma.js";
import {
  cardKindToDb,
  EXTRA_DECK_TYPES_DB,
  frameTypeToDb,
  monsterTypesToDb,
  parseLevelAndRankDb,
  spellTypeToDb,
  statToDb,
  trapTypeToDb,
} from "../../src/lib/normalizeYgo.js";
import { resolveCardImageUrls } from "../../src/lib/cardImages.js";
import { cardNameSearchTerms, decodeHtmlEntities } from "../../src/lib/htmlEntities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CARDS_DIR = path.resolve(__dirname, "../../cards");
const CARD_IMAGES_DIR = path.resolve(__dirname, "../../card_images");
const YGOPRODECK_API = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
const MASTERDUEL_CARDS_API = "https://www.masterduelmeta.com/api/v1/cards";
const MIN_FETCH_INTERVAL_MS = 100; // half of YGOProDeck's 20 req/s limit
const IMAGE_TYPES = {
  full: "image_url",
  small: "image_url_small",
  cropped: "image_url_cropped",
} as const;
type ImageType = keyof typeof IMAGE_TYPES;

let lastFetchAt = 0;

export interface YgoCardJson {
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
  card_images?: {
    id: number;
    image_url?: string;
    image_url_small?: string;
    image_url_cropped?: string;
  }[];
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
    ban_goat?: string;
  };
}

function sanitizeCardFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_");
}

function parseTypeline(ygo: YgoCardJson): { monsterRace: string | null; monsterCardType: string[] } {
  if (!ygo.typeline?.length) {
    return { monsterRace: null, monsterCardType: [] };
  }
  const [race] = ygo.typeline;
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

function humanReadableCardType(card: YgoCardJson): string {
  if (card.type === "Spell Card") return `${card.race || "Normal"} Spell`;
  if (card.type === "Trap Card") return `${card.race || "Normal"} Trap`;
  return card.type;
}

function transformYgoCardForDisk(card: YgoCardJson): YgoCardJson & { humanReadableCardType: string } {
  return {
    ...card,
    humanReadableCardType: humanReadableCardType(card),
  };
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = MIN_FETCH_INTERVAL_MS - (now - lastFetchAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastFetchAt = Date.now();
  return fetch(url);
}

async function rateLimitedYgoFetch(url: string, allowNotFound = false): Promise<Response> {
  const response = await rateLimitedFetch(url);
  if (!response.ok) {
    if (allowNotFound && response.status === 400) {
      return response;
    }
    throw new Error(`YGOPRODeck request failed (${response.status}): ${url}`);
  }
  return response;
}

function namesMatch(a: string, b: string): boolean {
  return decodeHtmlEntities(a).localeCompare(decodeHtmlEntities(b), undefined, {
    sensitivity: "accent",
  }) === 0;
}

function pickBestMatch(cards: YgoCardJson[], name: string): YgoCardJson | null {
  if (cards.length === 0) return null;
  const exact = cards.find((card) => namesMatch(card.name, name));
  return exact ?? cards[0] ?? null;
}

async function fetchYgoCardsFromApi(params: Record<string, string>): Promise<YgoCardJson[]> {
  const url = new URL(YGOPRODECK_API);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await rateLimitedYgoFetch(url.toString(), true);
  if (response.status === 400) {
    return [];
  }
  const payload = (await response.json()) as { data?: YgoCardJson[]; error?: string };
  if (payload.error || !payload.data?.length) {
    return [];
  }
  return payload.data;
}

async function fetchKonamiIdFromMdm(name: string): Promise<number | null> {
  const url = new URL(MASTERDUEL_CARDS_API);
  url.searchParams.set("name", decodeHtmlEntities(name));
  url.searchParams.set("limit", "5");

  const response = await fetch(url);
  if (!response.ok) return null;

  const cards = (await response.json()) as Array<{ konamiID?: string; name?: string }>;
  if (!Array.isArray(cards) || cards.length === 0) return null;

  const match = cards.find((card) => card.name && namesMatch(card.name, name));
  const card = match ?? cards[0];
  if (!card?.konamiID) return null;

  const konamiId = Number.parseInt(card.konamiID, 10);
  return Number.isNaN(konamiId) ? null : konamiId;
}

export async function fetchYgoCardByKonamiId(konamiId: number): Promise<YgoCardJson | null> {
  const cards = await fetchYgoCardsFromApi({ id: String(konamiId) });
  return cards[0] ?? null;
}

export async function fetchYgoCardByName(name: string): Promise<YgoCardJson | null> {
  const decoded = decodeHtmlEntities(name);

  const exactMatches = await fetchYgoCardsFromApi({ name: decoded });
  const exact = pickBestMatch(exactMatches, decoded);
  if (exact) return exact;

  const fuzzyMatches = await fetchYgoCardsFromApi({ fname: decoded, num: "20" });
  const fuzzy = pickBestMatch(fuzzyMatches, decoded);
  if (fuzzy) return fuzzy;

  const konamiId = await fetchKonamiIdFromMdm(decoded);
  if (konamiId === null) return null;

  const byId = await fetchYgoCardByKonamiId(konamiId);
  if (!byId) return null;

  // MDM names can be ahead of YGOPRODeck (e.g. "The Hidden Hecahands" vs "Hecahands").
  return { ...byId, name: decoded };
}

function imageDest(cardName: string, imageId: number, imageType: ImageType): string {
  const safeName = sanitizeCardFilename(cardName);
  if (imageType === "full") {
    return path.join(CARD_IMAGES_DIR, imageType, `${safeName}_${imageId}.jpg`);
  }
  return path.join(CARD_IMAGES_DIR, imageType, `${safeName}_${imageId}_${imageType}.jpg`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function downloadMissingCardImages(ygo: YgoCardJson): Promise<number> {
  let downloaded = 0;

  for (const entry of ygo.card_images ?? []) {
    const imageId = entry.id;
    for (const [imageType, urlKey] of Object.entries(IMAGE_TYPES) as [ImageType, string][]) {
      const url = entry[urlKey as keyof typeof entry];
      if (typeof url !== "string" || !url) continue;

      const dest = imageDest(ygo.name, imageId, imageType);
      if (await fileExists(dest)) continue;

      const response = await rateLimitedYgoFetch(url, true);
      if (response.status === 400) continue;
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(await response.arrayBuffer()));
      downloaded++;
    }
  }

  return downloaded;
}

export async function saveYgoCardJson(ygo: YgoCardJson): Promise<void> {
  await fs.mkdir(CARDS_DIR, { recursive: true });
  const filePath = path.join(CARDS_DIR, `${sanitizeCardFilename(ygo.name)}.json`);
  await fs.writeFile(
    filePath,
    `${JSON.stringify(transformYgoCardForDisk(ygo), null, 2)}\n`,
    "utf8",
  );
}

export async function toCardCreateInput(ygo: YgoCardJson) {
  const cardType = cardKindToDb(ygo.type);
  const { monsterRace, monsterCardType } = parseTypeline(ygo);
  const { level, rank } = parseLevelAndRankDb(monsterCardType, ygo.level);
  const isPendulum = monsterCardType.includes("pendulum");
  const isLink = monsterCardType.includes("link");
  const name = decodeHtmlEntities(ygo.name);
  const images = await resolveCardImageUrls(name, ygo.id);

  return {
    id: ygo.id,
    name,
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
    spellType: cardType === "spell" ? spellTypeToDb(ygo.race || "Normal") : null,
    trapType: cardType === "trap" ? trapTypeToDb(ygo.race || "Normal") : null,
    archetype: ygo.archetype ?? null,
    imageFull: images.full ?? null,
    imageCropped: images.cropped ?? null,
    imageSmall: images.small ?? null,
    ygoprodeckUrl: ygo.ygoprodeck_url ?? null,
  };
}

export async function upsertYgoCard(ygo: YgoCardJson): Promise<number> {
  const imagesAdded = await downloadMissingCardImages(ygo);
  if (imagesAdded > 0) {
    console.log(`  downloaded ${imagesAdded} image(s): ${decodeHtmlEntities(ygo.name)}`);
  }
  const data = await toCardCreateInput(ygo);

  await prisma.$transaction(async (tx) => {
    const existingByName = await tx.card.findUnique({ where: { name: data.name } });
    if (existingByName && existingByName.id !== data.id) {
      console.warn(
        `Replaced ${data.name}: removed id ${existingByName.id}, importing id ${data.id}`,
      );
      await tx.card.delete({ where: { id: existingByName.id } });
    }
    await tx.card.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  });

  return data.id;
}

export async function findCardIdByName(name: string): Promise<number | null> {
  const terms = cardNameSearchTerms(decodeHtmlEntities(name));
  const card = await prisma.card.findFirst({
    where: {
      OR: terms.map((term) => ({
        name: { equals: term, mode: "insensitive" as const },
      })),
    },
    select: { id: true },
  });
  return card?.id ?? null;
}

export async function ensureCardId(
  name: string,
  cache: Map<string, number>,
): Promise<number | null> {
  const decoded = decodeHtmlEntities(name);
  const cached = cache.get(decoded);
  if (cached !== undefined) return cached === -1 ? null : cached;

  const existing = await findCardIdByName(decoded);
  if (existing !== null) {
    cache.set(decoded, existing);
    return existing;
  }

  const konamiId = await fetchKonamiIdFromMdm(decoded);
  if (konamiId !== null) {
    const existingById = await prisma.card.findUnique({
      where: { id: konamiId },
      select: { id: true },
    });
    if (existingById) {
      cache.set(decoded, existingById.id);
      return existingById.id;
    }
  }

  try {
    const ygo = await fetchYgoCardByName(decoded);
    if (!ygo) {
      cache.set(decoded, -1);
      return null;
    }

    await saveYgoCardJson(ygo);
    const id = await upsertYgoCard(ygo);
    cache.set(decoded, id);
    console.log(`  fetched card from YGOPRODeck: ${decodeHtmlEntities(ygo.name)} (${id})`);
    return id;
  } catch (error) {
    console.warn(`  failed to fetch card: ${decoded}`, error);
    cache.set(decoded, -1);
    return null;
  }
}
