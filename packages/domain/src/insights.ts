import type { Place, TravelInsight } from '@nice-travel/shared';

export function normalizePlaceName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function insightToPlace(insight: TravelInsight): Place {
  return {
    id: `place_${insight.id}`,
    tripId: insight.tripId,
    name: normalizePlaceName(insight.placeName),
    address: `${normalizePlaceName(insight.placeName)} 附近`,
    tags: insight.tags,
    score: Math.round((insight.heatScore * 0.45 + insight.confidence * 0.55) * 100) / 100,
    sourceInsightIds: [insight.id],
    openingHint: insight.avoidTips.length ? `注意：${insight.avoidTips[0]}` : '建议出发前确认营业时间',
  };
}

export function mergeDuplicatePlaces(places: Place[]): Place[] {
  const byName = new Map<string, Place>();
  for (const place of places) {
    const key = normalizePlaceName(place.name).toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, place);
      continue;
    }
    existing.tags = Array.from(new Set([...existing.tags, ...place.tags]));
    existing.sourceInsightIds = Array.from(new Set([...existing.sourceInsightIds, ...place.sourceInsightIds]));
    existing.score = Math.max(existing.score, place.score);
  }
  return [...byName.values()].sort((a, b) => b.score - a.score);
}

