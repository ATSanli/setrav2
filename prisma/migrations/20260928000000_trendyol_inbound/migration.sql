ALTER TABLE "products" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "products" ADD COLUMN "trendyolMainId" TEXT;
ALTER TABLE "products" ADD COLUMN "trendyolCategoryId" INTEGER;
ALTER TABLE "products" ADD COLUMN "trendyolCategoryName" TEXT;
ALTER TABLE "products" ADD COLUMN "lastTrendyolSyncAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "products_trendyolMainId_key" ON "products"("trendyolMainId");

ALTER TABLE "product_variants" ADD COLUMN "barcode" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "sellerSku" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "trendyolVariantId" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "trendyolContentId" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "trendyolStatus" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "salePriceCents" INTEGER;
ALTER TABLE "product_variants" ADD COLUMN "listPriceCents" INTEGER;
ALTER TABLE "product_variants" ADD COLUMN "remoteStock" INTEGER;
ALTER TABLE "product_variants" ADD COLUMN "localStockDelta" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "product_variants" ADD COLUMN "lastTrendyolSyncAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");
CREATE UNIQUE INDEX "product_variants_trendyolVariantId_key" ON "product_variants"("trendyolVariantId");
ALTER TABLE "order_items" ADD COLUMN "trendyolReserved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product_images" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';

CREATE TABLE "trendyol_category_maps" (
  "trendyolCategoryId" INTEGER NOT NULL,
  "trendyolCategoryName" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "trendyol_category_maps_pkey" PRIMARY KEY ("trendyolCategoryId")
);
ALTER TABLE "trendyol_category_maps" ADD CONSTRAINT "trendyol_category_maps_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "trendyol_sync_state" (
  "id" TEXT NOT NULL,
  "lockToken" TEXT,
  "lockedUntil" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  CONSTRAINT "trendyol_sync_state_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "trendyol_sync_runs" (
  "id" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "processed" INTEGER NOT NULL DEFAULT 0,
  "created" INTEGER NOT NULL DEFAULT 0,
  "updated" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  CONSTRAINT "trendyol_sync_runs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "trendyol_sync_issues" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "barcode" TEXT,
  "reason" TEXT NOT NULL,
  CONSTRAINT "trendyol_sync_issues_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "trendyol_sync_issues" ADD CONSTRAINT "trendyol_sync_issues_runId_fkey" FOREIGN KEY ("runId") REFERENCES "trendyol_sync_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
