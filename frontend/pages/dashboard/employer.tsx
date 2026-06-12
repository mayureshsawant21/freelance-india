import { useAuth } from '@/lib/auth-context';

export default function EmployerDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.full_name || 'Employer'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-6 bg-white rounded-xl shadow">Available Connects: --</div>
        <div className="p-6 bg-white rounded-xl shadow">Active Jobs: --</div>
        <div className="p-6 bg-white rounded-xl shadow">Applications: --</div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Browse Freelancers</h2>
        <p>Freelancer profiles will appear here.</p>
      </div>
    </div>
  );
}