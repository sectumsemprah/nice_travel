import { getExport } from '../../../../server/store';
import { handleJson } from '../../../../server/http';

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  return handleJson(async () => getExport((await params).exportId));
}

