import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="text-center py-20 px-4 bg-gradient-to-br from-primary to-secondary text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          India's Dedicated Freelance Marketplace for Digital Marketers
        </h1>
        <p className="text-xl mb-8">Connect with top digital marketing talent or find your next freelance opportunity.</p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/signup">
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full">Find Freelancers</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-secondary border border-white text-white hover:bg-gray-800 px-8 py-3 rounded-full">Post a Job</Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">For Freelancers</h3>
            <ol className="list-decimal list-inside space-y-2 text-lg">
              <li>Create Profile</li>
              <li>Showcase Portfolio</li>
              <li>Browse Opportunities</li>
              <li>Connect with Clients</li>
              <li>Get Hired</li>
            </ol>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">For Employers</h3>
            <ol className="list-decimal list-inside space-y-2 text-lg">
              <li>Create Account</li>
              <li>Post a Job</li>
              <li>Browse Freelancers</li>
              <li>Connect</li>
              <li>Hire</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Why Freelance India */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Why Freelance India</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['India-focused', 'Verified Users', 'Real-time Chat', 'Connect Credits', 'Niche Platform', 'Portfolio Showcase', 'Transparent Hiring'].map(f => (
              <div key={f} className="p-4 border rounded-lg text-center">{f}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between">
          <div>&copy; 2024 Freelance India</div>
          <div className="flex gap-4">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}