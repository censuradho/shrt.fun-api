-- AlterTable
ALTER TABLE "hits" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "referrer" TEXT;

-- CreateIndex
CREATE INDEX "hits_urlId_idx" ON "hits"("urlId");
