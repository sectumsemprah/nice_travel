import { createTrip, listTrips, seedDemoIfEmpty } from '../../../server/store';
import { handleJson } from '../../../server/http';

export async function GET() {
  return handleJson(async () => {
    await seedDemoIfEmpty();
    return { trips: listTrips() };
  });
}

export async function POST(request: Request) {
  return handleJson(async () => createTrip(await request.json()));
}

