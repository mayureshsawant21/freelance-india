import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ConnectButton from '@/components/job/ConnectButton';

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (id) api.get(`/jobs/${id}`).then(res => setJob(res.data)).catch(console.error);
  }, [id]);

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <p className="text-gray-600 mb-2">{job.Employer?.User?.full_name} - {job.Employer?.company_name}</p>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <p>{job.description}</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>Budget: ₹{job.budget_min} - ₹{job.budget_max} ({job.budget_type})</div>
          <div>Experience: {job.experience_level}</div>
          <div>Location: {job.location_type}</div>
        </div>
      </div>
      <ConnectButton jobId={job.id} employerId={job.employer_id} />
    </div>
  );
}