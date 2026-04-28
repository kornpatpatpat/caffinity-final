import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserBaseline } from '@/src/types';

interface OnboardingProps {
  onComplete: (baseline: UserBaseline) => void;
  onBack: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = React.useState<UserBaseline>({
    age: 28,
    weight: 72,
    height: 180,
    sleepTime: '23:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col p-8 max-w-md mx-auto bg-background relative"
    >
      <div className="absolute top-8 left-8">
        <button 
          onClick={onBack}
          type="button"
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
          title="Back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="mt-32 mb-16">
        <h1 className="text-[56px] editorial-heading mb-4">
          Defining the <br /> Foundation
        </h1>
        <p className="text-black text-lg leading-relaxed">
          To tailor your caffeine cycle and sleep recovery, we begin with your physical baseline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="bg-card rounded-[40px] p-10 shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="micro-label">Age</Label>
              <Input 
                type="number" 
                value={formData.age === 0 ? '' : formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="border-0 border-b border-gray-200 rounded-none px-0 text-[56px] text-black focus-visible:ring-0 focus-visible:border-black transition-colors h-auto py-2"
              />
            </div>
  
            <div className="space-y-2">
              <Label className="micro-label">Weight (kg)</Label>
              <Input 
                type="number" 
                value={formData.weight === 0 ? '' : formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                className="border-0 border-b border-gray-200 rounded-none px-0 text-[56px] text-black focus-visible:ring-0 focus-visible:border-black transition-colors h-auto py-2"
              />
            </div>
  
            <div className="space-y-2">
              <Label className="micro-label">Height (cm)</Label>
              <Input 
                type="number" 
                value={formData.height === 0 ? '' : formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                className="border-0 border-b border-gray-200 rounded-none px-0 text-[56px] text-black focus-visible:ring-0 focus-visible:border-black transition-colors h-auto py-2"
              />
            </div>
  
            <div className="space-y-2">
              <Label className="micro-label">Sleep Time (24-hr)</Label>
              <Input 
                type="text" 
                placeholder="23:00"
                value={formData.sleepTime}
                onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                className="border-0 border-b border-gray-200 rounded-none px-0 text-[56px] text-black focus-visible:ring-0 focus-visible:border-black transition-colors h-auto py-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button 
            type="submit"
            className="rounded-full h-16 px-10 bg-black text-white hover:bg-black/90 text-lg flex items-center gap-3 transition-transform active:scale-95"
          >
            NEXT <ArrowRight size={20} />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Onboarding;
