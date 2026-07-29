import type { TravelInsight, TravelSource, Trip } from '@nice-travel/shared';

export interface InsightProvider {
  id: string;
  extract(trip: Trip, sources: TravelSource[]): Promise<TravelInsight[]>;
}

const fallbackPlaces = ['城市地标', '本地市场', '特色街区', '日落观景点', '博物馆', '咖啡馆'];

export class MockInsightProvider implements InsightProvider {
  id = 'mock-llm';

  async extract(trip: Trip, sources: TravelSource[]): Promise<TravelInsight[]> {
    const now = new Date().toISOString();
    const interests = trip.preferences.interests.length ? trip.preferences.interests : ['旅行体验'];
    return sources.slice(0, 6).map((source, index) => ({
      id: `ins_${Date.now()}_${index}`,
      tripId: trip.id,
      sourceIds: [source.id],
      placeName: `${trip.destination}${fallbackPlaces[index % fallbackPlaces.length]}`,
      summary: `从「${source.title}」中提取到适合${interests.join('、')}的旅行线索。`,
      tags: Array.from(new Set([interests[index % interests.length], '可步行探索'])),
      avoidTips: ['节假日建议提前预约或错峰前往'],
      heatScore: Math.max(0.55, 0.92 - index * 0.06),
      confidence: Math.max(0.5, 0.86 - index * 0.05),
      createdAt: now,
    }));
  }
}

