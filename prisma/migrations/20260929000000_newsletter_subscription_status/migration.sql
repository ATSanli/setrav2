ALTER TABLE "newsletter_subscribers"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "unsubscribedAt" TIMESTAMP(3);
