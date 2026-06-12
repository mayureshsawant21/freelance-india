import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import api from '@/lib/api';

export default function Signup() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'freelancer' | 'employer' | ''>('');
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', mobile: '', city: '', state: '',
    primarySkill: '', yearsOfExperience: '', linkedin: '', portfolio: '',
    companyName: '', industry: '', companyWebsite: ''
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role };
      const { data } = await api.post('/auth/signup', payload);
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        {step === 'role' ? (
          <>
            <h2 className="text-2xl font-bold text-secondary mb-6">Who are you?</h2>
            <RadioGroup onValueChange={(v) => { setRole(v as any); setStep('form'); }}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="freelancer" id="freelancer" />
                <label htmlFor="freelancer" className="text-lg font-medium">I am a Freelancer</label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:border-primary mt-3">
                <RadioGroupItem value="employer" id="employer" />
                <label htmlFor="employer" className="text-lg font-medium">I want to Hire Freelancers</label>
              </div>
            </RadioGroup>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Create {role === 'freelancer' ? 'Freelancer' : 'Employer'} Account</h2>
            <Input placeholder="Full Name" required onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} />
            <Input placeholder="Email" type="email" required className="mt-3" onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
            <Input placeholder="Mobile Number" type="tel" className="mt-3" onChange={e => setFormData(p => ({...p, mobile: e.target.value}))} />
            <Input placeholder="Password" type="password" required className="mt-3" onChange={e => setFormData(p => ({...p, password: e.target.value}))} />
            <Input placeholder="City" className="mt-3" onChange={e => setFormData(p => ({...p, city: e.target.value}))} />
            <Input placeholder="State" className="mt-3" onChange={e => setFormData(p => ({...p, state: e.target.value}))} />
            {role === 'freelancer' && (
              <>
                <Input placeholder="Primary Skill" className="mt-3" onChange={e => setFormData(p => ({...p, primarySkill: e.target.value}))} />
                <Input placeholder="Years of Experience" type="number" className="mt-3" onChange={e => setFormData(p => ({...p, yearsOfExperience: e.target.value}))} />
                <Input placeholder="LinkedIn Profile" className="mt-3" onChange={e => setFormData(p => ({...p, linkedin: e.target.value}))} />
                <Input placeholder="Portfolio Website (optional)" className="mt-3" onChange={e => setFormData(p => ({...p, portfolio: e.target.value}))} />
              </>
            )}
            {role === 'employer' && (
              <>
                <Input placeholder="Company Name" className="mt-3" onChange={e => setFormData(p => ({...p, companyName: e.target.value}))} />
                <Input placeholder="Industry" className="mt-3" onChange={e => setFormData(p => ({...p, industry: e.target.value}))} />
                <Input placeholder="Company Website" className="mt-3" onChange={e => setFormData(p => ({...p, companyWebsite: e.target.value}))} />
              </>
            )}
            <Button type="submit" className="w-full mt-6 bg-primary text-white">Create Account & Get 100 Free Credits</Button>
          </form>
        )}
      </div>
    </div>
  );
}