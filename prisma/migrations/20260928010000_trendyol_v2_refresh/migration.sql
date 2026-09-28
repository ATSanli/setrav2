ALTER TABLE "products" ADD COLUMN "trendyolBrandId" INTEGER;
ALTER TABLE "products" ADD COLUMN "trendyolBrandName" TEXT;
ALTER TABLE "trendyol_sync_state" ADD COLUMN "lastFullSuccessAt" TIMESTAMP(3);
ALTER TABLE "trendyol_sync_runs" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'FULL';
ALTER TABLE "trendyol_sync_runs" ADD COLUMN "deactivated" INTEGER NOT NULL DEFAULT 0;
