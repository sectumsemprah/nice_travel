import { createShare, getTripDetail } from '../../../../../server/store';
import { handleJson } from '../../../../../server/http';

export async function GET(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => ({ shares: getTripDetail((await params).tripId).shares }));
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => {
    const body = (await request.json().catch(() => ({}))) as { scope?: 'trip' | 'album' };
    return createShare((await params).tripId, body.scope ?? 'album');
  });
}

