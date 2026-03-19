-- CreateTable
CREATE TABLE "hits" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "hitsCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "tags" TEXT[],
    "expireAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_stats" (
    "id" TEXT NOT NULL,
    "totalUrls" INTEGER NOT NULL DEFAULT 0,
    "totalHits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "general_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_shortUrl_key" ON "urls"("shortUrl");

-- AddForeignKey
ALTER TABLE "hits" ADD CONSTRAINT "hits_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
