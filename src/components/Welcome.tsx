import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
  onNext: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-background"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-[64px] editorial-heading mb-12">Caffinity</h1>
        <Button 
          onClick={onNext}
          variant="outline"
          className="rounded-full h-16 px-10 border-black text-black hover:bg-black hover:text-white text-lg flex items-center gap-3 transition-all duration-300"
        >
          START <ArrowRight size={20} />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default Welcome;
