import React, { useState, useCallback } from 'react';
import { FactData, AppState, DOMAINS, DOMAIN_CONFIG, FactMode } from './types';
import { fetchFact } from './services/geminiService';
import FactCard from './components/FactCard';
import ExitScreen from './components/ExitScreen';
import StartScreen from './components/StartScreen';
import { Sparkles, HelpCircle, X, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START_SCREEN);
  const [factData, setFactData] = useState<FactData | null>(null);
  
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [rootObservation, setRootObservation] = useState<string>(""); // The base fact we are explaining

  // Load a fact
  const loadContent = useCallback(async (
    domain: string, 
    mode: FactMode, 
    contextObs?: string, 
    lastFactText?: string
  ) => {
    setAppState(AppState.LOADING);
    
    // If switching domains or starting new observation, update current domain
    if (mode === FactMode.OBSERVATION) {
      setCurrentDomain(domain);
    }

    const data = await fetchFact(domain, mode, { 
      rootObservation: contextObs, 
      lastFact: lastFactText 
    });
    
    setFactData(data);
    
    // If this was an observation (start of a chain), set it as the root
    if (mode === FactMode.OBSERVATION) {
      setRootObservation(data.fact);
    }

    setAppState(AppState.SHOWING_FACT);
  }, []);

  // --- Handlers ---

  const handleStartSelection = (domain: string) => {
    loadContent(domain, FactMode.OBSERVATION);
  };

  const handleTellMeMore = () => {
    if (!factData) return;
    loadContent(currentDomain, FactMode.EXPLANATION, rootObservation, factData.fact);
  };

  const handleDomainSelect = (domain: string) => {
    loadContent(domain, FactMode.OBSERVATION);
  };

  const handleExit = () => {
    setAppState(AppState.EXIT);
  };

  // --- Render ---

  if (appState === AppState.START_SCREEN) {
    return <StartScreen onSelectDomain={handleStartSelection} />;
  }

  if (appState === AppState.EXIT) {
    return <ExitScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6 font-fredoka relative">
      
      {/* Persistent Exit Button */}
      <button 
        onClick={handleExit}
        className="fixed top-4 right-4 z-50 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform active:scale-90 border-4 border-white"
        aria-label="Exit"
      >
        <X size={32} strokeWidth={3} />
      </button>

      <div className="max-w-2xl w-full h-[85vh] md:h-[90vh] flex flex-col gap-4">
        
        {/* Top Slot: Main Fact Card */}
        <div className="flex-grow relative basis-2/3">
          {appState === AppState.LOADING ? (
            <div className="w-full h-full flex flex-col justify-center items-center bg-white rounded-3xl shadow-lg animate-pulse border-4 border-white">
              <Sparkles className="w-16 h-16 text-yellow-400 animate-spin mb-4" />
              <p className="text-2xl text-gray-400 font-bold">Thinking...</p>
            </div>
          ) : (
             factData && <FactCard data={factData} />
          )}
        </div>

        {/* Bottom Slot: Control Panel */}
        <div className="basis-1/3 min-h-[180px] grid grid-cols-2 gap-4">
          
          {/* LEFT: 2x2 Domain Grid */}
          <div className="grid grid-cols-2 gap-2 h-full">
            {DOMAINS.map((domain) => {
               const config = DOMAIN_CONFIG[domain];
               return (
                <button
                  key={domain}
                  onClick={() => handleDomainSelect(domain)}
                  disabled={appState === AppState.LOADING}
                  className={`
                    ${config.color} ${config.hover} ${config.border} border-b-4
                    rounded-2xl flex flex-col items-center justify-center
                    transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100
                    p-1
                  `}
                  aria-label={`New ${domain} Fact`}
                >
                  <span className="text-2xl md:text-3xl filter drop-shadow-sm">{config.emoji}</span>
                  <span className="text-xs md:text-sm font-bold text-gray-700 uppercase mt-1">
                    {domain}
                  </span>
                </button>
               );
            })}
          </div>

          {/* RIGHT: Tell Me More Card */}
          <button 
            onClick={handleTellMeMore}
            disabled={appState === AppState.LOADING}
            className={`
              rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3
              border-b-8 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100
              ${factData ? factData.backgroundColor : 'bg-gray-100'} 
              ${factData ? 'border-black/20' : 'border-gray-300'}
            `}
          >
             <div className="bg-white/60 p-3 rounded-full shadow-sm backdrop-blur-sm min-w-[64px] min-h-[64px] flex items-center justify-center">
               {factData ? (
                 <span className="text-4xl block animate-bounce">{factData.emoji}</span>
               ) : (
                <HelpCircle size={32} className="text-gray-800" />
               )}
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-800 text-center leading-tight px-4">
              Tell me more
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default App;