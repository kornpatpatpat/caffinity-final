import React from 'react';
import { motion } from 'motion/react';
import { X, Coffee, Zap, Leaf, CupSoda, Utensils, Droplet, PlusSquare, MoreHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { BEVERAGES, Beverage, Activity } from '@/src/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Zap, Coffee, Leaf, CupSoda, Utensils, Droplet, PlusSquare, MoreHorizontal
};

interface AddBeverageProps {
  onAdd: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

export default function AddBeverage({ onAdd, onClose }: AddBeverageProps) {
  const [selectedBev, setSelectedBev] = React.useState<Beverage>(BEVERAGES[0]);
  const [volume, setVolume] = React.useState(selectedBev.defaultVolume);

  const calculatedIntensity = Math.round(volume * 0.6);

  const handleAdd = () => {
    onAdd({
      beverageId: selectedBev.id,
      name: selectedBev.name,
      mg: calculatedIntensity,
      volume: volume,
    });
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-[100] flex flex-col"
    >
      <header className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-2xl font-serif italic">Caffinity</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-12 space-y-12 max-w-md mx-auto w-full">
        <div className="pt-8 text-center">
          <h3 className="micro-label mb-8">Select Beverage</h3>
          <div className="grid grid-cols-3 gap-4">
            {BEVERAGES.map((bev) => {
              const Icon = ICON_MAP[bev.icon];
              const isSelected = selectedBev.id === bev.id;
              return (
                <button
                  key={bev.id}
                  onClick={() => {
                    setSelectedBev(bev);
                    setVolume(bev.defaultVolume);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-[32px] transition-all aspect-square",
                    isSelected ? "bg-black text-white scale-105 shadow-lg" : "bg-white text-black hover:bg-gray-50"
                  )}
                >
                  <Icon size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">{bev.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-sm space-y-10">
          <div className="flex justify-between items-baseline">
            <div className="space-y-1">
              <h4 className="text-4xl font-serif">Volume.</h4>
              <p className="micro-label">Adjust Portion Size</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-light leading-none">{isNaN(volume) ? 0 : volume}</span>
              <span className="text-xl italic text-black">ml</span>
            </div>
          </div>

          <div className="space-y-8">
            <Slider 
              value={isNaN(volume) ? 30 : volume} 
              onValueChange={(val: any) => setVolume(Array.isArray(val) ? val[0] : val)}
              min={30}
              max={1000}
              step={10}
              className="py-4 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-medium text-black uppercase tracking-widest">
              <span>30ml</span>
              <span>1000ml</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <p className="micro-label">Caffeine</p>
            <p className="text-4xl font-light text-black">{isNaN(calculatedIntensity) ? 0 : calculatedIntensity}mg</p>
          </div>

          <Button 
            onClick={handleAdd}
            className="w-full h-16 rounded-full bg-black text-white hover:bg-black/90 text-lg font-medium transition-transform active:scale-95"
          >
            ADD
          </Button>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="micro-label opacity-30">Caffinity</p>
      </footer>
    </motion.div>
  );
}
