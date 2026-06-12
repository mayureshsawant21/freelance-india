import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    api.get('/jobs').then(res => setJobs(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
      <div className="grid gap-4">
        {jobs.map((job: any) => (
          <Link href={`/jobs/${job.id}`} key={job.id} className="p-4 bg-white rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.category} - {job.location_type}</p>
            <p className="mt-2">Budget: ₹{job.budget_min} - ₹{job.budget_max}</p>
          </Link>
        ))}
        {jobs.length === 0 && <p>No jobs found.</p>}
      </div>
    </div>
  );
}