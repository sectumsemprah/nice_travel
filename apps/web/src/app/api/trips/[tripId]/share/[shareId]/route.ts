import { revokeShare } from '../../../../../../server/store';
import { handleJson } from '../../../../../../server/http';

export async function DELETE(_request: Request, { params }: { params: Promise<{ tripId: string; shareId: string }> }) {
  return handleJson(async () => {
    const { tripId, shareId } = await params;
    return revokeShare(tripId, shareId);
  });
}

