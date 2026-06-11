-- Replace remote imageUrl with local static paths per variant
ALTER TABLE "Card" ADD COLUMN "imageFull" TEXT;
ALTER TABLE "Card" ADD COLUMN "imageCropped" TEXT;
ALTER TABLE "Card" ADD COLUMN "imageSmall" TEXT;

ALTER TABLE "Card" DROP COLUMN "imageUrl";
