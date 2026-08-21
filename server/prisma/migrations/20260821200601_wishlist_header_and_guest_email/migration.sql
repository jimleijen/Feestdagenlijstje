-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN "dateLabel" TEXT;
ALTER TABLE "Wishlist" ADD COLUMN "location" TEXT;
ALTER TABLE "Wishlist" ADD COLUMN "note" TEXT;
ALTER TABLE "Wishlist" ADD COLUMN "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "WishlistItem" ADD COLUMN "reservedByEmail" TEXT;
