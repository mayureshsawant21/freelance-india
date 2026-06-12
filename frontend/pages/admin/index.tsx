import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, activeJobs: 0, revenue: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, [user, router]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">Total Users: {stats.totalUsers}</div>
        <div className="bg-white p-6 rounded-xl shadow">Active Jobs: {stats.activeJobs}</div>
        <div className="bg-white p-6 rounded-xl shadow">Revenue: ₹{stats.revenue}</div>
      </div>
    </div>
  );
}