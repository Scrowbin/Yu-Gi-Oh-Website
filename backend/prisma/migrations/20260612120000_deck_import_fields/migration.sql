-- AlterTable
ALTER TABLE "Deck" ADD COLUMN "created" DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE "Deck" ALTER COLUMN "created" DROP DEFAULT;

ALTER TABLE "Deck" ADD COLUMN "mdmId" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "deckType" TEXT,
ADD COLUMN "rankedType" TEXT,
ADD COLUMN "engines" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Deck" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DeckCard" ADD COLUMN "zone" TEXT NOT NULL DEFAULT 'main',
ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 1;

-- DropIndex
DROP INDEX "DeckCard_deckId_cardId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Deck_mdmId_key" ON "Deck"("mdmId");

-- CreateIndex
CREATE UNIQUE INDEX "Deck_sourceUrl_key" ON "Deck"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_cardId_zone_key" ON "DeckCard"("deckId", "cardId", "zone");

-- CreateIndex
CREATE INDEX "DeckCard_cardId_idx" ON "DeckCard"("cardId");

-- DropForeignKey
ALTER TABLE "DeckCard" DROP CONSTRAINT "DeckCard_deckId_fkey";

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
