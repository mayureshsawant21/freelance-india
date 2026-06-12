import { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function ConnectButton({ jobId, employerId }: { jobId: string; employerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/connections/initiate', { targetId: employerId, jobId });
      window.location.href = `/chat/${data.connectionId}`;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Connection failed');
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleConnect} disabled={loading} className="bg-primary text-white">
      {loading ? 'Connecting...' : 'Connect (5 Credits)'}
    </Button>
  );
}