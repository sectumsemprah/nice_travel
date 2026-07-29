import { getTripDetail, listTrips, seedDemoIfEmpty } from '../server/store';
import TravelWorkbench from './travel-workbench';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await seedDemoIfEmpty();
  const [firstTrip] = listTrips();
  const initialData = firstTrip ? getTripDetail(firstTrip.id) : null;
  return <TravelWorkbench initialData={initialData} />;
}
