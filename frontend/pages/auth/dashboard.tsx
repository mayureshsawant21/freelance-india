import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/auth/login');
      else if (user.role === 'freelancer') router.push('/dashboard/freelancer');
      else if (user.role === 'employer') router.push('/dashboard/employer');
    }
  }, [user, loading, router]);

  return <div>Loading...</div>;
}