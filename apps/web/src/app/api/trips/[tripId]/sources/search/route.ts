import { searchSources } from '../../../../../../server/store';
import { handleJson } from '../../../../../../server/http';

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => searchSources((await params).tripId, await request.json()));
}

