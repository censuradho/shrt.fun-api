-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "monthlyQrCodeLimit" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "urls" ADD COLUMN     "hasQrCode" BOOLEAN NOT NULL DEFAULT false;
