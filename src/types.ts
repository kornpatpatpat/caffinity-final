export interface UserBaseline {
  age: number;
  weight: number;
  height: number;
  sleepTime: string; // "HH:mm"
}

export interface Beverage {
  id: string;
  name: string;
  icon: string;
  mgPerMl: number;
  defaultVolume: number;
}

export interface Activity {
  id: string;
  beverageId: string;
  name: string;
  mg: number;
  volume: number;
  timestamp: number;
}

export const BEVERAGES: Beverage[] = [
  { id: 'espresso', name: 'Espresso', icon: 'Zap', mgPerMl: 2.1, defaultVolume: 30 },
  { id: 'cold-brew', name: 'Cold Brew', icon: 'Coffee', mgPerMl: 0.6, defaultVolume: 300 },
  { id: 'green-tea', name: 'Green Tea', icon: 'Leaf', mgPerMl: 0.15, defaultVolume: 300 },
  { id: 'thai-tea', name: 'Thai Tea', icon: 'CupSoda', mgPerMl: 0.2, defaultVolume: 300 },
  { id: 'matcha', name: 'Matcha', icon: 'Utensils', mgPerMl: 0.3, defaultVolume: 300 },
  { id: 'energy', name: 'Energy', icon: 'Zap', mgPerMl: 0.32, defaultVolume: 200 },
  { id: 'drip', name: 'Drip', icon: 'Droplet', mgPerMl: 0.4, defaultVolume: 300 },
  { id: 'tablet', name: 'Tablet', icon: 'PlusSquare', mgPerMl: 1, defaultVolume: 100 },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', mgPerMl: 0.2, defaultVolume: 250 },
];
