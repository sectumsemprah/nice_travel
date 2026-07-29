import type { ItineraryDay, ItineraryItem, Place, PreferenceProfile, TransportMode } from '@nice-travel/shared';

const PACE_LIMIT: Record<PreferenceProfile['pace'], number> = {
  relaxed: 3,
  balanced: 4,
  intense: 6,
};

export function daysBetweenInclusive(startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new Error('结束日期必须不早于开始日期');
  }
  const dates: string[] = [];
  for (let current = start; current <= end; current = new Date(current.getTime() + 86400000)) {
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
}

export function generateItinerary(input: {
  tripId: string;
  startDate: string;
  endDate: string;
  destination: string;
  preferences: PreferenceProfile;
  places: Place[];
}): ItineraryDay[] {
  const dates = daysBetweenInclusive(input.startDate, input.endDate);
  if (input.places.length < Math.min(2, dates.length)) {
    throw new Error('候选地点不足，无法生成完整行程');
  }

  const perDay = PACE_LIMIT[input.preferences.pace];
  const sorted = [...input.places].sort((a, b) => b.score - a.score);
  const transportMode: TransportMode = input.preferences.transportModes[0] ?? 'walking';

  return dates.map((date, dayIndex) => {
    const items = sorted.slice(dayIndex * perDay, (dayIndex + 1) * perDay).map((place, itemIndex): ItineraryItem => {
      const hour = 9 + itemIndex * 2;
      return {
        id: `item_${dayIndex + 1}_${itemIndex + 1}_${place.id}`,
        placeId: place.id,
        placeName: place.name,
        startTime: `${String(hour).padStart(2, '0')}:00`,
        durationMinutes: input.preferences.pace === 'relaxed' ? 120 : 90,
        transportMode,
        reason: `匹配 ${input.preferences.interests.join('、') || input.destination} 偏好，综合评分 ${place.score}`,
        riskHints: place.openingHint ? [place.openingHint] : [],
      };
    });
    return {
      id: `day_${input.tripId}_${dayIndex + 1}`,
      tripId: input.tripId,
      dayNumber: dayIndex + 1,
      date,
      title: `${input.destination} 第 ${dayIndex + 1} 天`,
      items,
    };
  });
}

