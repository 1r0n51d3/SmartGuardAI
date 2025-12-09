import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AlertOctagon, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardProps {
  history: AnalysisResult[];
}

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        <p className={`text-sm mt-1 ${color}`}>{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg bg-slate-700/50`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  // Compute Dynamic Stats based on history, fallback to mock data if empty
  const stats = useMemo(() => {
    if (history.length === 0) {
      // Default / Demo State
      return {
        avgScore: 87.4,
        openHazards: 4,
        progress: 42,
        chartData: [
          { name: 'Mon', score: 85 },
          { name: 'Tue', score: 82 },
          { name: 'Wed', score: 88 },
          { name: 'Thu', score: 76 },
          { name: 'Fri', score: 92 },
          { name: 'Sat', score: 95 },
          { name: 'Sun', score: 94 },
        ],
        hazardTypes: [
          { name: 'PPE', count: 12 },
          { name: 'Electric', count: 5 },
          { name: 'Trip', count: 8 },
        ]
      };
    }

    // Real Data Calculation
    const avgScore = history.reduce((acc, curr) => acc + curr.safetyScore, 0) / history.length;
    const totalHazards = history.reduce((acc, curr) => acc + curr.hazards.length, 0);
    const avgProgress = history.reduce((acc, curr) => acc + curr.progressEstimate, 0) / history.length;
    
    // Prepare Chart Data (Last 7 scans or meaningful distribution)
    const chartData = history.map((h, i) => ({
      name: `Scan ${i + 1}`,
      score: h.safetyScore
    })).slice(-10); // Last 10

    // Count hazard types (simple naive grouping for demo)
    const hazardCounts: Record<string, number> = {};
    history.forEach(h => {
      h.hazards.forEach(haz => {
        // Group by simple keywords
        let key = 'Other';
        if (haz.toLowerCase().includes('helmet') || haz.toLowerCase().includes('hard hat') || haz.toLowerCase().includes('vest')) key = 'PPE';
        else if (haz.toLowerCase().includes('debris') || haz.toLowerCase().includes('clutter')) key = 'Housekeeping';
        else if (haz.toLowerCase().includes('wire') || haz.toLowerCase().includes('electric')) key = 'Electrical';
        else if (haz.toLowerCase().includes('fall') || haz.toLowerCase().includes('height')) key = 'Fall Risk';
        
        hazardCounts[key] = (hazardCounts[key] || 0) + 1;
      });
    });

    const hazardTypes = Object.keys(hazardCounts).map(k => ({ name: k, count: hazardCounts[k] }));

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      openHazards: totalHazards,
      progress: Math.round(avgProgress),
      chartData,
      hazardTypes
    };
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg Safety Score" 
          value={stats.avgScore} 
          subtext={history.length > 0 ? "Based on recent scans" : "+2.4% vs last week"} 
          icon={ShieldCheck} 
          color={stats.avgScore > 80 ? "text-green-400" : "text-amber-400"} 
        />
        <StatCard 
          title="Detected Hazards" 
          value={stats.openHazards} 
          subtext={history.length > 0 ? "Cumulative total" : "Requires attention"} 
          icon={AlertOctagon} 
          color="text-red-400" 
        />
        <StatCard 
          title="Est. Progress" 
          value={`${stats.progress}%`} 
          subtext="Visual estimation" 
          icon={TrendingUp} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Scans Performed" 
          value={history.length > 0 ? history.length : "128"} 
          subtext="Total inspections" 
          icon={Users} 
          color="text-amber-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Safety Trend Chart */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Safety Compliance Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="#f59e0b" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Breakdown */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Hazards by Category</h3>
          <div className="h-[300px]">
             {stats.hazardTypes.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hazardTypes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-500">
                 No hazard data available yet
               </div>
             )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;