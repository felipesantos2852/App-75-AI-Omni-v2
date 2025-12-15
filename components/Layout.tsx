import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Dumbbell, MessageSquare, TrendingUp, Download, X } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-yellow-500 text-black px-4 py-3 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-top-5">
           <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-lg">
                <Download size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Instalar App</span>
                <span className="text-xs opacity-80">Acesso rápido e offline</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Instalar
              </button>
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-black/10 rounded-full"
              >
                <X size={18} />
              </button>
           </div>
        </div>
      )}

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