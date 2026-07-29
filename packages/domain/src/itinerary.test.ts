import { describe, expect, it } from 'vitest';
import { generateItinerary } from './itinerary';

describe('generateItinerary', () => {
  it('按旅行天数和节奏生成行程', () => {
    const days = generateItinerary({
      tripId: 'trip_1',
      destination: '成都',
      startDate: '2026-05-01',
      endDate: '2026-05-02',
      preferences: {
        interests: ['美食', '城市漫步'],
        pace: 'relaxed',
        budgetLevel: 'medium',
        companions: 'friends',
        transportModes: ['walking'],
        avoidances: [],
        accessibilityNeeds: [],
      },
      places: [
        { id: 'p1', tripId: 'trip_1', name: '宽窄巷子', address: '', tags: ['城市漫步'], score: 0.9, sourceInsightIds: [] },
        { id: 'p2', tripId: 'trip_1', name: '人民公园', address: '', tags: ['休闲'], score: 0.8, sourceInsightIds: [] },
        { id: 'p3', tripId: 'trip_1', name: '奎星楼街', address: '', tags: ['美食'], score: 0.85, sourceInsightIds: [] },
      ],
    });

    expect(days).toHaveLength(2);
    expect(days[0].items[0].placeName).toBe('宽窄巷子');
    expect(days[0].items.length).toBeLessThanOrEqual(3);
  });

  it('候选地点不足时显式失败', () => {
    expect(() =>
      generateItinerary({
        tripId: 'trip_1',
        destination: '成都',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        preferences: {
          interests: [],
          pace: 'balanced',
          budgetLevel: 'medium',
          companions: 'solo',
          transportModes: ['walking'],
          avoidances: [],
          accessibilityNeeds: [],
        },
        places: [],
      }),
    ).toThrow('候选地点不足');
  });
});

