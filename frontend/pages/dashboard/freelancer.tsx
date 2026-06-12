import { useAuth } from '@/lib/auth-context';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.full_name || 'Freelancer'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-6 bg-white rounded-xl shadow">Available Connects: --</div>
        <div className="p-6 bg-white rounded-xl shadow">Profile Views: --</div>
        <div className="p-6 bg-white rounded-xl shadow">Messages: --</div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Browse Jobs</h2>
        <p>Job listings will appear here.</p>
      </div>
    </div>
  );
}