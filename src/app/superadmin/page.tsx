import { getSuperAdminInitialData } from '@/lib/actions/superadmin';
import { SuperAdminCRM } from '@/components/superadmin-crm';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const initialData = await getSuperAdminInitialData();

  return <SuperAdminCRM initialData={initialData} />;
}
