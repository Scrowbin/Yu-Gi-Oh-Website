import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../src/db/prisma.js";
import { decodeHtmlEntities } from "../src/lib/htmlEntities.js";
import { ensureCardId } from "./lib/ygoCardImport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECKS_DIR = path.resolve(__dirname, "../decks");

type DeckZone = "main" | "extra" | "side";

interface DeckCardJson {
  name: string;
  amount: number;
}

interface DeckJson {
  mdmId?: string;
  sourceUrl?: string;
  deckType?: string | null;
  created: string;
  rankedType?: string | null;
  engines?: string[];
  main: DeckCardJson[];
  extra: DeckCardJson[];
  side: DeckCardJson[];
}

function parseDeckDate(created: string): Date {
  return new Date(created.slice(0, 10));
}

async function readDeckFiles(): Promise<DeckJson[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(DECKS_DIR);
  } catch {
    return [];
  }

  const decks: DeckJson[] = [];
  for (const file of entries.filter((f) => f.endsWith(".json"))) {
    const raw = await fs.readFile(path.join(DECKS_DIR, file), "utf8");
    decks.push(JSON.parse(raw) as DeckJson);
  }
  return decks;
}

async function importDeckCards(
  deckId: number,
  zone: DeckZone,
  cards: DeckCardJson[],
  cardIdCache: Map<string, number>,
  missingCards: Set<string>,
): Promise<number> {
  let imported = 0;

  for (const entry of cards) {
    const cardId = await ensureCardId(entry.name, cardIdCache);
    if (cardId === null) {
      missingCards.add(entry.name);
      continue;
    }

    await prisma.deckCard.upsert({
      where: {
        deckId_cardId_zone: {
          deckId,
          cardId,
          zone,
        },
      },
      create: {
        deckId,
        cardId,
        zone,
        amount: entry.amount,
      },
      update: {
        amount: entry.amount,
      },
    });
    imported++;
  }

  return imported;
}

async function importDeck(
  deck: DeckJson,
  cardIdCache: Map<string, number>,
  missingCards: Set<string>,
): Promise<number> {
  if (!deck.mdmId && !deck.sourceUrl) {
    throw new Error("Deck JSON must include mdmId or sourceUrl.");
  }

  const deckData = {
    mdmId: deck.mdmId ?? null,
    sourceUrl: deck.sourceUrl ?? null,
    created: parseDeckDate(deck.created),
    deckType: deck.deckType ?? null,
    rankedType: deck.rankedType ?? null,
    engines: deck.engines ?? [],
  };

  const saved = await prisma.$transaction(async (tx) => {
    const existingByMdm = deckData.mdmId
      ? await tx.deck.findUnique({ where: { mdmId: deckData.mdmId } })
      : null;
    const existingByUrl = deckData.sourceUrl
      ? await tx.deck.findUnique({ where: { sourceUrl: deckData.sourceUrl } })
      : null;

    const keepId = existingByMdm?.id ?? existingByUrl?.id;

    for (const row of [existingByMdm, existingByUrl]) {
      if (row && row.id !== keepId) {
        await tx.deck.delete({ where: { id: row.id } });
      }
    }

    if (keepId) {
      return tx.deck.update({ where: { id: keepId }, data: deckData });
    }

    return tx.deck.create({ data: deckData });
  });

  await prisma.deckCard.deleteMany({ where: { deckId: saved.id } });

  let cardRows = 0;
  cardRows += await importDeckCards(saved.id, "main", deck.main ?? [], cardIdCache, missingCards);
  cardRows += await importDeckCards(saved.id, "extra", deck.extra ?? [], cardIdCache, missingCards);
  cardRows += await importDeckCards(saved.id, "side", deck.side ?? [], cardIdCache, missingCards);

  return cardRows;
}

async function main() {
  console.log(`Reading decks from ${DECKS_DIR}...`);
  const decks = await readDeckFiles();
  console.log(`Found ${decks.length} JSON files.`);

  if (decks.length === 0) {
    console.log("No decks to import. Run: python scripts/get_decks.py");
    return;
  }

  const cardIdCache = new Map<string, number>();
  const missingCards = new Set<string>();
  let importedDecks = 0;
  let importedCards = 0;

  for (const deck of decks) {
    const label = deck.deckType ?? deck.sourceUrl ?? deck.mdmId ?? "unknown";
    const cardRows = await importDeck(deck, cardIdCache, missingCards);
    importedDecks++;
    importedCards += cardRows;
    console.log(`  imported: ${label} (${cardRows} card rows)`);
  }

  console.log(`Upserted ${importedDecks} decks (${importedCards} card rows).`);
  if (missingCards.size > 0) {
    console.warn(
      `Could not resolve ${missingCards.size} card name(s) from DB or YGOPRODeck:\n` +
        [...missingCards].map((name) => `  - ${decodeHtmlEntities(name)}`).join("\n"),
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
