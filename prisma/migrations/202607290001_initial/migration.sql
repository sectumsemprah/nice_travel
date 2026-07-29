CREATE TYPE "TripStatus" AS ENUM ('draft', 'planning', 'ready', 'traveling', 'completed', 'archived');
CREATE TYPE "SourceStatus" AS ENUM ('pending', 'imported', 'processed', 'failed');
CREATE TYPE "JobStatus" AS ENUM ('pending', 'running', 'succeeded', 'failed', 'canceled');
CREATE TYPE "ShareScope" AS ENUM ('trip', 'album');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Trip" (
  "id" TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "budgetCny" INTEGER,
  "status" "TripStatus" NOT NULL DEFAULT 'planning',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Trip_ownerId_status_idx" ON "Trip"("ownerId", "status");
CREATE INDEX "Trip_destination_idx" ON "Trip"("destination");

CREATE TABLE "PreferenceProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "tripId" TEXT UNIQUE REFERENCES "Trip"("id") ON DELETE CASCADE,
  "interests" TEXT[] NOT NULL,
  "pace" TEXT NOT NULL,
  "budgetLevel" TEXT NOT NULL,
  "companions" TEXT NOT NULL,
  "transportModes" TEXT[] NOT NULL,
  "avoidances" TEXT[] NOT NULL,
  "accessibilityNeeds" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PreferenceProfile_userId_idx" ON "PreferenceProfile"("userId");

CREATE TABLE "TravelSource" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "excerpt" TEXT NOT NULL,
  "status" "SourceStatus" NOT NULL DEFAULT 'pending',
  "copyrightNote" TEXT NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3)
);

CREATE INDEX "TravelSource_tripId_provider_idx" ON "TravelSource"("tripId", "provider");
CREATE INDEX "TravelSource_status_idx" ON "TravelSource"("status");

CREATE TABLE "TravelInsight" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "placeName" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "avoidTips" TEXT[] NOT NULL,
  "heatScore" DOUBLE PRECISION NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "TravelInsight_tripId_idx" ON "TravelInsight"("tripId");
CREATE INDEX "TravelInsight_placeName_idx" ON "TravelInsight"("placeName");

CREATE TABLE "TravelInsightSource" (
  "insightId" TEXT NOT NULL REFERENCES "TravelInsight"("id") ON DELETE CASCADE,
  "sourceId" TEXT NOT NULL REFERENCES "TravelSource"("id") ON DELETE CASCADE,
  PRIMARY KEY ("insightId", "sourceId")
);

CREATE TABLE "Place" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "tags" TEXT[] NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "openingHint" TEXT,
  "estimatedCostCny" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Place_tripId_name_idx" ON "Place"("tripId", "name");

CREATE TABLE "PlaceInsight" (
  "placeId" TEXT NOT NULL REFERENCES "Place"("id") ON DELETE CASCADE,
  "insightId" TEXT NOT NULL REFERENCES "TravelInsight"("id") ON DELETE CASCADE,
  PRIMARY KEY ("placeId", "insightId")
);

CREATE TABLE "ItineraryDay" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "dayNumber" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "title" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("tripId", "dayNumber", "version")
);

CREATE INDEX "ItineraryDay_tripId_date_idx" ON "ItineraryDay"("tripId", "date");

CREATE TABLE "ItineraryItem" (
  "id" TEXT PRIMARY KEY,
  "itineraryDayId" TEXT NOT NULL REFERENCES "ItineraryDay"("id") ON DELETE CASCADE,
  "placeId" TEXT NOT NULL REFERENCES "Place"("id") ON DELETE RESTRICT,
  "startTime" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "transportMode" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "riskHints" TEXT[] NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ItineraryItem_itineraryDayId_sortOrder_idx" ON "ItineraryItem"("itineraryDayId", "sortOrder");

CREATE TABLE "RouteSnapshot" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "distanceKm" DOUBLE PRECISION NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "pointsJson" JSONB NOT NULL,
  "renderedText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "RouteSnapshot_tripId_createdAt_idx" ON "RouteSnapshot"("tripId", "createdAt");

CREATE TABLE "MemoryAsset" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "placeId" TEXT REFERENCES "Place"("id") ON DELETE SET NULL,
  "fileName" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "caption" TEXT,
  "takenAt" TIMESTAMP(3),
  "visibility" TEXT NOT NULL DEFAULT 'private',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

CREATE INDEX "MemoryAsset_tripId_deletedAt_idx" ON "MemoryAsset"("tripId", "deletedAt");
CREATE INDEX "MemoryAsset_ownerId_idx" ON "MemoryAsset"("ownerId");

CREATE TABLE "MemoryAlbum" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "coverAssetId" TEXT,
  "narrative" TEXT NOT NULL,
  "sectionsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("tripId", "version")
);

CREATE INDEX "MemoryAlbum_tripId_createdAt_idx" ON "MemoryAlbum"("tripId", "createdAt");

CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'pending',
  "traceId" TEXT NOT NULL,
  "errorMessage" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Job_tripId_status_idx" ON "Job"("tripId", "status");
CREATE INDEX "Job_traceId_idx" ON "Job"("traceId");

CREATE TABLE "ShareToken" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "scope" "ShareScope" NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ShareToken_tripId_revokedAt_idx" ON "ShareToken"("tripId", "revokedAt");

CREATE TABLE "ExportRecord" (
  "id" TEXT PRIMARY KEY,
  "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "status" "JobStatus" NOT NULL DEFAULT 'pending',
  "format" TEXT NOT NULL,
  "url" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3)
);

CREATE INDEX "ExportRecord_tripId_status_idx" ON "ExportRecord"("tripId", "status");

