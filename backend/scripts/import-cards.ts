import "dotenv/config";

import fs from "node:fs/promises";

import path from "node:path";

import prisma from "../src/db/prisma.js";

import { banStatusToDb } from "../src/lib/normalizeYgo.js";

import {

  CARDS_DIR,

  type YgoCardJson,

  upsertYgoCard,

} from "./lib/ygoCardImport.js";



const BANLIST_EFFECTIVE_DATE = new Date("2025-01-01");



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
    await upsertYgoCard(ygo);
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

