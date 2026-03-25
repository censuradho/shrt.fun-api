/*
  Warnings:

  - You are about to drop the column `isAtcive` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isAtcive",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
