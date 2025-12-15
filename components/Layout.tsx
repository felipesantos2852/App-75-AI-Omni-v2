import React from 'react';
import { LayoutDashboard, Dumbbell, MessageSquare, TrendingUp } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      <main className="flex-1 pb-24 px-4 pt-6 max-w-md mx-auto w-full">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
            icon={<LayoutDashboard size={24} />} 
            label="Início" 
          />
          <NavButton 
            active={activeTab === 'training'} 
            onClick={() => onTabChange('training')} 
            icon={<Dumbbell size={24} />} 
            label="Treino" 
          />
          <NavButton 
            active={activeTab === 'coach'} 
            onClick={() => onTabChange('coach')} 
            icon={<MessageSquare size={24} />} 
            label="Coach" 
          />
          <NavButton 
            active={activeTab === 'progress'} 
            onClick={() => onTabChange('progress')} 
            icon={<TrendingUp size={24} />} 
            label="Evolução" 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({
  active, onClick, icon, label
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
      active ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon}
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);