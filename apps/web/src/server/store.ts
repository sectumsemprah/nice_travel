import {
  createTripSchema,
  memoryAssetSchema,
  sourceImportSchema,
  updateTripSchema,
  type ExportRecord,
  type ItineraryDay,
  type Job,
  type MemoryAlbum,
  type MemoryAsset,
  type Place,
  type RouteSnapshot,
  type ShareToken,
  type TravelInsight,
  type TravelSource,
  type Trip,
} from '@nice-travel/shared';
import { generateItinerary, generateMemoryAlbum, insightToPlace, mergeDuplicatePlaces } from '@nice-travel/domain';
import { ManualSourceProvider, MockInsightProvider, MockMapProvider } from '@nice-travel/providers';
import { randomBytes, randomUUID } from 'node:crypto';
import { logError, logInfo } from './logging';

const DEMO_USER_ID = 'user_demo';

interface Store {
  trips: Trip[];
  sources: TravelSource[];
  insights: TravelInsight[];
  places: Place[];
  itineraryDays: ItineraryDay[];
  routes: RouteSnapshot[];
  assets: MemoryAsset[];
  albums: MemoryAlbum[];
  shares: ShareToken[];
  exports: ExportRecord[];
  jobs: Job[];
}

const globalStore = globalThis as typeof globalThis & { niceTravelStore?: Store };

export const store: Store =
  globalStore.niceTravelStore ??
  (globalStore.niceTravelStore = {
    trips: [],
    sources: [],
    insights: [],
    places: [],
    itineraryDays: [],
    routes: [],
    assets: [],
    albums: [],
    shares: [],
    exports: [],
    jobs: [],
  });

function now() {
  return new Date().toISOString();
}

function createJob(tripId: string, type: Job['type']): Job {
  const timestamp = now();
  const job: Job = {
    id: randomUUID(),
    tripId,
    type,
    status: 'running',
    traceId: randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.jobs.push(job);
  return job;
}

function completeJob(job: Job, status: Job['status'], errorMessage?: string) {
  job.status = status;
  job.errorMessage = errorMessage;
  job.updatedAt = now();
}

function getOwnedTrip(tripId: string, userId = DEMO_USER_ID): Trip {
  const trip = store.trips.find((candidate) => candidate.id === tripId && candidate.ownerId === userId);
  if (!trip) {
    throw Object.assign(new Error('旅行项目不存在或无权访问'), { status: 404 });
  }
  return trip;
}

export function listTrips() {
  return store.trips.filter((trip) => trip.ownerId === DEMO_USER_ID);
}

export function createTrip(body: unknown) {
  const input = createTripSchema.parse(body);
  if (new Date(input.endDate) < new Date(input.startDate)) {
    throw Object.assign(new Error('结束日期必须不早于开始日期'), { status: 400 });
  }
  const timestamp = now();
  const trip: Trip = {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: input.title,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    budgetCny: input.budgetCny,
    status: 'planning',
    preferences: input.preferences,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.trips.push(trip);
  logInfo('trip.created', { userId: DEMO_USER_ID, tripId: trip.id, result: 'succeeded' });
  return trip;
}

export function getTripDetail(tripId: string) {
  const trip = getOwnedTrip(tripId);
  return {
    trip,
    sources: store.sources.filter((source) => source.tripId === tripId),
    insights: store.insights.filter((insight) => insight.tripId === tripId),
    places: store.places.filter((place) => place.tripId === tripId),
    itineraryDays: store.itineraryDays.filter((day) => day.tripId === tripId),
    routes: store.routes.filter((route) => route.tripId === tripId),
    assets: store.assets.filter((asset) => asset.tripId === tripId && !asset.deletedAt),
    albums: store.albums.filter((album) => album.tripId === tripId),
    shares: store.shares.filter((share) => share.tripId === tripId && !share.revokedAt),
    exports: store.exports.filter((record) => record.tripId === tripId),
    jobs: store.jobs.filter((job) => job.tripId === tripId),
  };
}

export function updateTrip(tripId: string, body: unknown) {
  const input = updateTripSchema.parse(body);
  const trip = getOwnedTrip(tripId);
  if (input.startDate && input.endDate && new Date(input.endDate) < new Date(input.startDate)) {
    throw Object.assign(new Error('结束日期必须不早于开始日期'), { status: 400 });
  }
  Object.assign(trip, input, { updatedAt: now() });
  return trip;
}

export function deleteTrip(tripId: string) {
  getOwnedTrip(tripId);
  store.trips = store.trips.filter((trip) => trip.id !== tripId);
  store.sources = store.sources.filter((source) => source.tripId !== tripId);
  store.insights = store.insights.filter((insight) => insight.tripId !== tripId);
  store.places = store.places.filter((place) => place.tripId !== tripId);
  store.itineraryDays = store.itineraryDays.filter((day) => day.tripId !== tripId);
  store.routes = store.routes.filter((route) => route.tripId !== tripId);
  store.assets = store.assets.filter((asset) => asset.tripId !== tripId);
  store.albums = store.albums.filter((album) => album.tripId !== tripId);
  store.shares = store.shares.filter((share) => share.tripId !== tripId);
  return { success: true };
}

export async function searchSources(tripId: string, body: unknown) {
  const started = Date.now();
  const input = sourceImportSchema.parse(body);
  const trip = getOwnedTrip(tripId);
  const job = createJob(tripId, 'source_search');
  try {
    const sources = await new ManualSourceProvider().search(trip, input);
    store.sources.push(...sources);
    completeJob(job, 'succeeded');
    logInfo('source.search', { userId: DEMO_USER_ID, tripId, jobId: job.id, traceId: job.traceId, durationMs: Date.now() - started, result: 'succeeded' });
    return { job, sources };
  } catch (error) {
    const message = error instanceof Error ? error.message : '检索失败';
    completeJob(job, 'failed', message);
    logError('source.search.failed', { userId: DEMO_USER_ID, tripId, jobId: job.id, traceId: job.traceId, durationMs: Date.now() - started, result: 'failed' });
    throw error;
  }
}

export async function extractInsightsAndPlaces(tripId: string) {
  const trip = getOwnedTrip(tripId);
  const job = createJob(tripId, 'insight_extract');
  const sources = store.sources.filter((source) => source.tripId === tripId);
  if (!sources.length) {
    completeJob(job, 'failed', '请先导入旅行信息源');
    throw Object.assign(new Error('请先导入旅行信息源'), { status: 400 });
  }
  const insights = await new MockInsightProvider().extract(trip, sources);
  store.insights.push(...insights);
  const places = mergeDuplicatePlaces([...store.places.filter((place) => place.tripId === tripId), ...insights.map(insightToPlace)]);
  store.places = [...store.places.filter((place) => place.tripId !== tripId), ...places];
  completeJob(job, 'succeeded');
  return { job, insights, places };
}

export async function generateTripItinerary(tripId: string) {
  const trip = getOwnedTrip(tripId);
  const job = createJob(tripId, 'itinerary_generate');
  try {
    if (!store.places.some((place) => place.tripId === tripId)) {
      await extractInsightsAndPlaces(tripId);
    }
    const places = store.places.filter((place) => place.tripId === tripId);
    const days = generateItinerary({
      tripId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destination: trip.destination,
      preferences: trip.preferences,
      places,
    });
    store.itineraryDays = [...store.itineraryDays.filter((day) => day.tripId !== tripId), ...days];
    trip.status = 'ready';
    trip.updatedAt = now();
    completeJob(job, 'succeeded');
    return { job, days };
  } catch (error) {
    const message = error instanceof Error ? error.message : '行程生成失败';
    completeJob(job, 'failed', message);
    throw Object.assign(new Error(message), { status: 400 });
  }
}

export function updateItinerary(tripId: string, body: unknown) {
  getOwnedTrip(tripId);
  const days = body as ItineraryDay[];
  if (!Array.isArray(days)) {
    throw Object.assign(new Error('行程数据必须是数组'), { status: 400 });
  }
  store.itineraryDays = [...store.itineraryDays.filter((day) => day.tripId !== tripId), ...days.map((day) => ({ ...day, tripId }))];
  return { days: store.itineraryDays.filter((day) => day.tripId === tripId) };
}

export async function renderRoute(tripId: string) {
  getOwnedTrip(tripId);
  const job = createJob(tripId, 'route_render');
  const days = store.itineraryDays.filter((day) => day.tripId === tripId);
  if (!days.length) {
    completeJob(job, 'failed', '请先生成或编辑行程');
    throw Object.assign(new Error('请先生成或编辑行程'), { status: 400 });
  }
  const route = await new MockMapProvider().renderRoute(tripId, days);
  store.routes.push(route);
  completeJob(job, 'succeeded');
  return { job, route };
}

export function addMemoryAsset(tripId: string, body: unknown) {
  getOwnedTrip(tripId);
  const input = memoryAssetSchema.parse(body);
  const asset: MemoryAsset = {
    id: randomUUID(),
    tripId,
    fileName: input.fileName,
    url: input.url,
    caption: input.caption,
    takenAt: input.takenAt,
    placeId: input.placeId,
    visibility: 'private',
    createdAt: now(),
  };
  store.assets.push(asset);
  return asset;
}

export function deleteMemoryAsset(tripId: string, assetId: string) {
  getOwnedTrip(tripId);
  const asset = store.assets.find((candidate) => candidate.id === assetId && candidate.tripId === tripId);
  if (!asset) {
    throw Object.assign(new Error('素材不存在'), { status: 404 });
  }
  asset.deletedAt = now();
  store.exports
    .filter((record) => record.tripId === tripId)
    .forEach((record) => {
      if (record.status === 'succeeded') {
        record.status = 'failed';
        record.errorMessage = '关联素材已变更，导出产物已过期';
      }
    });
  return { success: true };
}

export function generateAlbum(tripId: string) {
  const trip = getOwnedTrip(tripId);
  const job = createJob(tripId, 'album_generate');
  const days = store.itineraryDays.filter((day) => day.tripId === tripId);
  const assets = store.assets.filter((asset) => asset.tripId === tripId && !asset.deletedAt);
  const version = store.albums.filter((album) => album.tripId === tripId).length + 1;
  const album = generateMemoryAlbum({ id: randomUUID(), version, trip, days, assets, createdAt: now() });
  store.albums.push(album);
  completeJob(job, 'succeeded');
  return { job, album };
}

export function createShare(tripId: string, scope: ShareToken['scope'] = 'album') {
  getOwnedTrip(tripId);
  const share: ShareToken = {
    id: randomUUID(),
    tripId,
    token: randomBytes(24).toString('hex'),
    scope,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: now(),
  };
  store.shares.push(share);
  return share;
}

export function revokeShare(tripId: string, shareId: string) {
  getOwnedTrip(tripId);
  const share = store.shares.find((candidate) => candidate.id === shareId && candidate.tripId === tripId);
  if (!share) {
    throw Object.assign(new Error('分享链接不存在'), { status: 404 });
  }
  share.revokedAt = now();
  return { success: true };
}

export function getPublicShare(token: string) {
  const share = store.shares.find((candidate) => candidate.token === token && !candidate.revokedAt);
  if (!share || (share.expiresAt && new Date(share.expiresAt) < new Date())) {
    throw Object.assign(new Error('分享链接不存在或已失效'), { status: 404 });
  }
  const detail = getTripDetail(share.tripId);
  return { share, ...detail };
}

export function createExport(tripId: string, format: ExportRecord['format'] = 'json') {
  getOwnedTrip(tripId);
  const job = createJob(tripId, 'export');
  const record: ExportRecord = {
    id: randomUUID(),
    tripId,
    format,
    status: 'succeeded',
    url: `/api/exports/${job.id}`,
    createdAt: now(),
    completedAt: now(),
  };
  store.exports.push(record);
  completeJob(job, 'succeeded');
  return { job, export: record };
}

export function getExport(exportId: string) {
  const record = store.exports.find((candidate) => candidate.id === exportId || candidate.url === `/api/exports/${exportId}`);
  if (!record) {
    throw Object.assign(new Error('导出记录不存在'), { status: 404 });
  }
  return { record, detail: getTripDetail(record.tripId) };
}

export async function seedDemoIfEmpty() {
  if (store.trips.length) return;
  const trip = createTrip({
    title: '成都慢游计划',
    destination: '成都',
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    budgetCny: 3600,
    preferences: {
      interests: ['美食', '城市漫步', '人文'],
      pace: 'balanced',
      budgetLevel: 'medium',
      companions: 'friends',
      transportModes: ['walking', 'transit'],
      avoidances: ['过度排队'],
      accessibilityNeeds: [],
    },
  });
  await searchSources(trip.id, {
    query: '成都 五一 美食 城市漫步',
    links: ['https://example.com/chengdu-guide'],
    notes: '想要轻松一点，少赶路，多吃本地小店。',
  });
}
