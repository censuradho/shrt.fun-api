/*
  Warnings:

  - You are about to drop the column `maxUrls` on the `plans` table. All the data in the column will be lost.
  - Added the required column `dailyLinkLimit` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyLinkLimit` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLinkLimit` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "maxUrls",
ADD COLUMN     "dailyLinkLimit" INTEGER NOT NULL,
ADD COLUMN     "monthlyLinkLimit" INTEGER NOT NULL,
ADD COLUMN     "totalLinkLimit" INTEGER NOT NULL;
