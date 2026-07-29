import { deleteMemoryAsset } from '../../../../../../../server/store';
import { handleJson } from '../../../../../../../server/http';

export async function DELETE(_request: Request, { params }: { params: Promise<{ tripId: string; assetId: string }> }) {
  return handleJson(async () => {
    const { tripId, assetId } = await params;
    return deleteMemoryAsset(tripId, assetId);
  });
}

