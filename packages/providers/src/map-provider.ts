import type { ItineraryDay, RouteSnapshot } from '@nice-travel/shared';
import { buildRouteSnapshot } from '@nice-travel/domain';

export interface MapProvider {
  id: string;
  renderRoute(tripId: string, days: ItineraryDay[]): Promise<RouteSnapshot>;
}

export class MockMapProvider implements MapProvider {
  id = 'mock-map';

  async renderRoute(tripId: string, days: ItineraryDay[]): Promise<RouteSnapshot> {
    return buildRouteSnapshot({
      id: `route_${Date.now()}`,
      tripId,
      provider: this.id,
      days,
      createdAt: new Date().toISOString(),
    });
  }
}

