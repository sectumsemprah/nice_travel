import type { ItineraryDay, MemoryAlbum, MemoryAsset, Trip } from '@nice-travel/shared';

export function generateMemoryAlbum(input: {
  id: string;
  version: number;
  trip: Trip;
  days: ItineraryDay[];
  assets: MemoryAsset[];
  createdAt: string;
}): MemoryAlbum {
  const activeAssets = input.assets.filter((asset) => !asset.deletedAt);
  return {
    id: input.id,
    tripId: input.trip.id,
    version: input.version,
    title: `${input.trip.title} 旅行回忆`,
    coverAssetId: activeAssets[0]?.id,
    narrative: `这趟前往 ${input.trip.destination} 的旅行，从计划中的地点开始，最终沉淀为 ${activeAssets.length} 段可回看的记忆。`,
    sections: input.days.map((day) => ({
      heading: day.title,
      body: `${day.date} 的路线围绕 ${day.items.map((item) => item.placeName).join('、') || '自由探索'} 展开。`,
      assetIds: activeAssets.filter((asset) => day.items.some((item) => item.placeId === asset.placeId)).map((asset) => asset.id),
      routePointNames: day.items.map((item) => item.placeName),
    })),
    createdAt: input.createdAt,
  };
}

