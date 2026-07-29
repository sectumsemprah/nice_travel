import type { ItineraryDay, RouteSnapshot } from '@nice-travel/shared';

export function buildRouteSnapshot(input: {
  id: string;
  tripId: string;
  provider: string;
  days: ItineraryDay[];
  createdAt: string;
}): RouteSnapshot {
  const names = input.days.flatMap((day) => day.items.map((item) => item.placeName));
  const distanceKm = Math.max(1, names.length - 1) * 2.8;
  const durationMinutes = Math.round(distanceKm * 18);
  return {
    id: input.id,
    tripId: input.tripId,
    provider: input.provider,
    status: names.length >= 2 ? 'rendered' : 'degraded',
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes,
    points: names.map((name) => ({ name })),
    renderedText: names.length >= 2 ? names.join(' -> ') : '地点不足，已降级为顺序列表',
    createdAt: input.createdAt,
  };
}

