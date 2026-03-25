/*
  Warnings:

  - You are about to drop the column `userId` on the `urls` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "urls" DROP CONSTRAINT "urls_userId_fkey";

-- AlterTable
ALTER TABLE "urls" DROP COLUMN "userId",
ADD COLUMN     "supabaseId" TEXT;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_supabaseId_fkey" FOREIGN KEY ("supabaseId") REFERENCES "users"("supabaseId") ON DELETE SET NULL ON UPDATE CASCADE;
