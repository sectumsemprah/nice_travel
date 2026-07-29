import { z } from 'zod';

export const tripStatusSchema = z.enum(['draft', 'planning', 'ready', 'traveling', 'completed', 'archived']);
export const jobStatusSchema = z.enum(['pending', 'running', 'succeeded', 'failed', 'canceled']);
export const sourceStatusSchema = z.enum(['pending', 'imported', 'processed', 'failed']);
export const transportModeSchema = z.enum(['walking', 'driving', 'cycling', 'transit']);

export const preferenceProfileSchema = z.object({
  interests: z.array(z.string()).default([]),
  pace: z.enum(['relaxed', 'balanced', 'intense']).default('balanced'),
  budgetLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  companions: z.enum(['solo', 'couple', 'family', 'friends', 'business']).default('solo'),
  transportModes: z.array(transportModeSchema).default(['walking', 'transit']),
  avoidances: z.array(z.string()).default([]),
  accessibilityNeeds: z.array(z.string()).default([]),
});

export const createTripSchema = z.object({
  title: z.string().min(1).max(80),
  destination: z.string().min(1).max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budgetCny: z.number().int().positive().optional(),
  preferences: preferenceProfileSchema,
});

export const updateTripSchema = createTripSchema.partial();

export const sourceImportSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  links: z.array(z.string().url()).default([]),
  notes: z.string().max(8000).optional(),
});

export const memoryAssetSchema = z.object({
  fileName: z.string().min(1).max(180),
  url: z.string().min(1),
  caption: z.string().max(500).optional(),
  takenAt: z.string().optional(),
  placeId: z.string().optional(),
});

export type TripStatus = z.infer<typeof tripStatusSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type TransportMode = z.infer<typeof transportModeSchema>;
export type PreferenceProfile = z.infer<typeof preferenceProfileSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type SourceImportInput = z.infer<typeof sourceImportSchema>;
export type MemoryAssetInput = z.infer<typeof memoryAssetSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetCny?: number;
  status: TripStatus;
  preferences: PreferenceProfile;
  createdAt: string;
  updatedAt: string;
}

export interface TravelSource {
  id: string;
  tripId: string;
  provider: string;
  sourceType: 'manual_link' | 'manual_text' | 'public_search';
  title: string;
  url?: string;
  excerpt: string;
  status: SourceStatus;
  copyrightNote: string;
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface TravelInsight {
  id: string;
  tripId: string;
  sourceIds: string[];
  placeName: string;
  summary: string;
  tags: string[];
  avoidTips: string[];
  heatScore: number;
  confidence: number;
  createdAt: string;
}

export interface Place {
  id: string;
  tripId: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  tags: string[];
  score: number;
  sourceInsightIds: string[];
  openingHint?: string;
  estimatedCostCny?: number;
}

export interface ItineraryItem {
  id: string;
  placeId: string;
  placeName: string;
  startTime: string;
  durationMinutes: number;
  transportMode: TransportMode;
  reason: string;
  riskHints: string[];
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

export interface RouteSnapshot {
  id: string;
  tripId: string;
  provider: string;
  status: 'rendered' | 'degraded';
  distanceKm: number;
  durationMinutes: number;
  points: Array<{ name: string; lat?: number; lng?: number }>;
  renderedText: string;
  createdAt: string;
}

export interface MemoryAsset {
  id: string;
  tripId: string;
  fileName: string;
  url: string;
  caption?: string;
  takenAt?: string;
  placeId?: string;
  visibility: 'private' | 'shared';
  createdAt: string;
  deletedAt?: string;
}

export interface MemoryAlbum {
  id: string;
  tripId: string;
  version: number;
  title: string;
  coverAssetId?: string;
  narrative: string;
  sections: Array<{
    heading: string;
    body: string;
    assetIds: string[];
    routePointNames: string[];
  }>;
  createdAt: string;
}

export interface ShareToken {
  id: string;
  tripId: string;
  token: string;
  scope: 'trip' | 'album';
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  tripId: string;
  status: JobStatus;
  format: 'html' | 'json';
  url?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Job {
  id: string;
  tripId: string;
  type: 'source_search' | 'insight_extract' | 'itinerary_generate' | 'route_render' | 'album_generate' | 'export';
  status: JobStatus;
  traceId: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

