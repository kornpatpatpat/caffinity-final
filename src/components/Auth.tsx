import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Facebook, Mail } from 'lucide-react';

interface AuthProps {
  onNext: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onNext, onBack }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo progression
    onNext();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="p-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setMode('login')}
            className={`text-xs font-bold tracking-widest uppercase transition-colors ${mode === 'login' ? 'text-black' : 'text-black/30'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('signup')}
            className={`text-xs font-bold tracking-widest uppercase transition-colors ${mode === 'signup' ? 'text-black' : 'text-black/30'}`}
          >
            Join
          </button>
        </div>
      </header>

      <main className="px-8 pt-12 pb-20 max-w-md mx-auto space-y-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-4"
        >
          <h1 className="text-5xl font-serif tracking-tight leading-[0.9]">
            {mode === 'login' ? 'Welcome back.' : 'Start your journey.'}
          </h1>
          <p className="text-sm font-medium tracking-tight text-black/50">
            {mode === 'login' 
              ? 'Enter your details to sync your caffeine profile.' 
              : 'Create a profile to get precise caffeine metabolic windows.'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 px-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="yourmail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-gray-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-black px-4 placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 px-1">Password</label>
              <Input 
                type="password" 
                placeholder="*******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 bg-gray-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-black px-4 placeholder:text-gray-400"
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-16 bg-black text-white rounded-none text-sm font-bold tracking-widest uppercase hover:bg-black/90 active:scale-[0.98] transition-all"
          >
            {mode === 'login' ? 'Continue' : 'Create Account'}
          </Button>
        </form>

        <div className="space-y-6 pt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-black/20">OR SIGN IN WITH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-none border-black/5 hover:bg-black/5 flex gap-2">
              <Facebook size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
            </Button>
            <Button variant="outline" className="h-14 rounded-none border-black/5 hover:bg-black/5 flex gap-2">
              <Mail size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
            </Button>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center">
         <p className="text-[10px] font-medium tracking-tight text-black/30">
           By continuing, you agree to our <span className="text-black underline cursor-pointer">Terms</span> and <span className="text-black underline cursor-pointer">Privacy</span>.
         </p>
      </footer>
    </div>
  );
};

export default Auth;
