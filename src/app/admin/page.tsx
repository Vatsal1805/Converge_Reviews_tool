import { Metadata } from 'next';
import AdminDashboard from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Internal Admin — Converge Reviews',
  description: 'Manage client accounts, view analytics, and generate standee QR codes.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
