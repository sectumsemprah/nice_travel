import { createExport } from '../../../../../server/store';
import { handleJson } from '../../../../../server/http';

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => {
    const body = (await request.json().catch(() => ({}))) as { format?: 'html' | 'json' };
    return createExport((await params).tripId, body.format ?? 'json');
  });
}

