import { addMemoryAsset, getTripDetail } from '../../../../../../server/store';
import { handleJson } from '../../../../../../server/http';

export async function GET(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => ({ assets: getTripDetail((await params).tripId).assets }));
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => addMemoryAsset((await params).tripId, await request.json()));
}

