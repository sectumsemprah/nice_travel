import { updateItinerary } from '../../../../../server/store';
import { handleJson } from '../../../../../server/http';

export async function PATCH(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => updateItinerary((await params).tripId, await request.json()));
}

