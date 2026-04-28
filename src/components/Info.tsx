import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfoProps {
  onNext: () => void;
  onBack: () => void;
}

export const Info: React.FC<InfoProps> = ({ onNext, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col p-8 max-w-md mx-auto bg-background relative"
    >
      <div className="absolute top-8 left-8">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
          title="Back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col pt-24 space-y-12">
        <h2 className="text-[56px] editorial-heading leading-tight">
          Caffeine <br />
          Decoded.
        </h2>
        
        <div className="space-y-6">
          <p className="text-black text-lg leading-relaxed">
            This application collects basic information such as age, weight, and height to analyze caffeine intake and provide personalized insights. 
            <span className="font-semibold"> All data is used only within the system for analysis purposes.</span>
          </p>
          
          <p className="text-black text-lg leading-relaxed">
            The application's recommendations are for informational use only and are not medical advice. 
            Users with sleep issues, stress, or medical conditions should consult a healthcare professional.
          </p>
        </div>
      </div>

      <div className="py-12 flex justify-end">
        <Button 
          onClick={onNext}
          className="rounded-full h-16 px-10 bg-black text-white hover:bg-black/90 text-lg flex items-center gap-3 transition-transform active:scale-95"
        >
          NEXT <ArrowRight size={20} />
        </Button>
      </div>
    </motion.div>
  );
};

export default Info;
