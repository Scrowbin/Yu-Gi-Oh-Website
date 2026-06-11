-- Drop old Card schema (1 dev seed row) and recreate with expanded model.
-- Safe for local dev; re-run `npm run import:cards` after applying.

-- DropForeignKey
ALTER TABLE "DeckCard" DROP CONSTRAINT "DeckCard_cardId_fkey";

-- DropTable
DROP TABLE "Card";

-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "cardFrame" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "attribute" TEXT,
    "monsterRace" TEXT,
    "monsterCardType" TEXT[],
    "atk" TEXT,
    "def" TEXT,
    "level" INTEGER,
    "rank" INTEGER,
    "material" TEXT,
    "pendScale" INTEGER,
    "pendEffect" TEXT,
    "linkNumber" INTEGER,
    "linkArrows" TEXT[],
    "spellType" TEXT,
    "trapType" TEXT,
    "archetype" TEXT,
    "imageUrl" TEXT NOT NULL,
    "ygoprodeckUrl" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banlist" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Banlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanlistSnapshot" (
    "id" SERIAL NOT NULL,
    "banlistId" INTEGER NOT NULL,
    "effectiveDate" DATE NOT NULL,

    CONSTRAINT "BanlistSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanlistEntry" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "BanlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardCategory" (
    "cardId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CardCategory_pkey" PRIMARY KEY ("cardId","categoryId")
);

-- CreateTable
CREATE TABLE "MasterDuelCard" (
    "cardId" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,

    CONSTRAINT "MasterDuelCard_pkey" PRIMARY KEY ("cardId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_key" ON "Card"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Banlist_slug_key" ON "Banlist"("slug");

-- CreateIndex
CREATE INDEX "BanlistSnapshot_banlistId_effectiveDate_idx" ON "BanlistSnapshot"("banlistId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "BanlistSnapshot_banlistId_effectiveDate_key" ON "BanlistSnapshot"("banlistId", "effectiveDate");

-- CreateIndex
CREATE INDEX "BanlistEntry_cardId_idx" ON "BanlistEntry"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "BanlistEntry_snapshotId_cardId_key" ON "BanlistEntry"("snapshotId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "BanlistSnapshot" ADD CONSTRAINT "BanlistSnapshot_banlistId_fkey" FOREIGN KEY ("banlistId") REFERENCES "Banlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanlistEntry" ADD CONSTRAINT "BanlistEntry_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "BanlistSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanlistEntry" ADD CONSTRAINT "BanlistEntry_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardCategory" ADD CONSTRAINT "CardCategory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardCategory" ADD CONSTRAINT "CardCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterDuelCard" ADD CONSTRAINT "MasterDuelCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
