import { deleteTrip, getTripDetail, updateTrip } from '../../../../server/store';
import { handleJson } from '../../../../server/http';

export async function GET(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => getTripDetail((await params).tripId));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => updateTrip((await params).tripId, await request.json()));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  return handleJson(async () => deleteTrip((await params).tripId));
}

