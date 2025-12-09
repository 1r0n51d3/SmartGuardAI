import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import Reports from './components/Reports';
import { ViewState, AnalysisResult } from './types';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Store analysis history here so the Dashboard can reflect real-time updates
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  const handleNewAnalysis = (result: AnalysisResult) => {
    // Add new result to history
    setAnalysisHistory(prev => [...prev, result]);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden`}>
         <Sidebar currentView={currentView} onNavigate={(view) => { setCurrentView(view); setMobileMenuOpen(false); }} />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white">SiteGuard AI</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-white">
            <Menu />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentView === ViewState.DASHBOARD && <Dashboard history={analysisHistory} />}
            {currentView === ViewState.ANALYZE && <Analyzer onNewAnalysis={handleNewAnalysis} />}
            {currentView === ViewState.REPORTS && <Reports history={analysisHistory} />}
          </div>
        </main>
      </div>
    </div>
  );
}