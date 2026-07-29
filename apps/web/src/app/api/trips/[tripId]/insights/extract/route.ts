import { extractInsightsAndPlaces } from '../../../../../../server/store';
import { handleJson } from '../../../../../../server/http';

export async function POST(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => extractInsightsAndPlaces((await params).tripId));
}

