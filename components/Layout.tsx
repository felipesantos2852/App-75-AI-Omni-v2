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
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    try {
        // Safe check for Standalone mode
        const isInStandalone = 
            (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
            ((window.navigator as any).standalone === true);
        
        if (isInStandalone) {
            setIsStandalone(true);
        }

        // Safe check for iOS
        if (typeof navigator !== 'undefined') {
             const userAgent = navigator.userAgent || '';
             const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) || 
                                (userAgent.includes("Mac") && "ontouchend" in document);
             setIsIOS(!!isIosDevice);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Fallback timer for iOS or if event doesn't fire but not installed
        const timer = setTimeout(() => {
            if (!isInStandalone && !installPrompt && !showInstallBanner) {
                // Show banner if we think we can install but haven't been prompted
                setShowInstallBanner(true);
            }
        }, 4000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    } catch (err) {
        console.error("PWA Detection Error:", err);
    }
  }, [installPrompt, showInstallBanner]);

  const handleInstallClick = async () => {
    if (installPrompt) {
        try {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') {
                setInstallPrompt(null);
                setShowInstallBanner(false);
            }
        } catch (e) {
            console.error("Install prompt failed", e);
        }
    } else {
        alert(isIOS 
            ? "Para instalar no iPhone/iPad:\n1. Toque no botão Compartilhar (Share)\n2. Selecione 'Adicionar à Tela de Início'"
            : "Para instalar:\n1. Toque no menu do navegador (3 pontinhos)\n2. Selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'"
        );
        setShowInstallBanner(false); // Hide after showing instructions
    }
  };

  if (isStandalone) {
      return (
        <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
            <main className="flex-1 pb-24 px-4 pt-6 max-w-md mx-auto w-full">
                {children}
            </main>
            <NavBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      
      {/* PWA Install Banner */}
      {showInstallBanner && !isStandalone && (
        <div className="bg-yellow-500 text-black px-4 py-3 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-top-5 sticky top-0 z-50">
           <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-lg">
                <Download size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Instalar App</span>
                <span className="text-xs opacity-80">
                    {installPrompt ? "Acesso rápido e offline" : "Adicionar à Tela de Início"}
                </span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
              >
                {installPrompt ? "Instalar" : "Instalar"}
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
      
      <NavBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

const NavBar: React.FC<{ activeTab: Tab; onTabChange: (t: Tab) => void }> = ({ activeTab, onTabChange }) => (
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
);

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