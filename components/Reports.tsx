import React, { useState } from 'react';
import { FileText, Download, Eye, ChevronLeft, Printer, Search, HardHat, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportsProps {
  history: AnalysisResult[];
}

const Reports: React.FC<ReportsProps> = ({ history }) => {
  const [selectedReport, setSelectedReport] = useState<AnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(h => 
    h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.complianceStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.hazards.some(haz => haz.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handlePrint = () => {
    window.print();
  };

  if (selectedReport) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right printable-content bg-white md:bg-transparent">
        {/* Navigation / Actions (Hidden in Print) */}
        <div className="flex justify-between items-center no-print">
          <button 
            onClick={() => setSelectedReport(null)}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Reports
          </button>
          <div className="flex space-x-3">
             <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Report Container */}
        <div className="bg-white text-slate-900 p-8 md:p-12 rounded-xl shadow-xl max-w-4xl mx-auto border border-slate-200">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <HardHat className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">SiteGuard AI</h1>
                <p className="text-slate-500 font-medium">Automated Safety Inspection Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Report ID</p>
              <p className="font-mono text-sm font-bold">{selectedReport.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-slate-500 mt-2">Date Generated</p>
              <p className="font-medium">{new Date(selectedReport.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-lg border-2 ${
               selectedReport.safetyScore > 80 ? 'border-green-100 bg-green-50' : 
               selectedReport.safetyScore > 50 ? 'border-amber-100 bg-amber-50' : 'border-red-100 bg-red-50'
            }`}>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-1">Safety Score</p>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-bold ${
                   selectedReport.safetyScore > 80 ? 'text-green-600' : 
                   selectedReport.safetyScore > 50 ? 'text-amber-600' : 'text-red-600'
                }`}>{selectedReport.safetyScore}</span>
                <span className="text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-1">Compliance Status</p>
              <p className={`text-xl font-bold ${
                 selectedReport.complianceStatus === 'Compliant' ? 'text-green-600' :
                 selectedReport.complianceStatus === 'Minor Violations' ? 'text-amber-600' : 'text-red-600'
              }`}>{selectedReport.complianceStatus}</p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-1">Site Progress</p>
              <p className="text-xl font-bold text-blue-600">{selectedReport.progressEstimate}% <span className="text-sm font-normal text-slate-500">Estimated</span></p>
            </div>
          </div>

          {/* Evidence Image */}
          {selectedReport.imageUrl && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Visual Evidence
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={selectedReport.imageUrl} 
                  alt="Site Evidence" 
                  className="w-full h-auto max-h-[500px] object-contain mx-auto"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hazards List */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Identified Hazards
              </h3>
              <ul className="space-y-3">
                {selectedReport.hazards.length > 0 ? selectedReport.hazards.map((hazard, i) => (
                  <li key={i} className="flex items-start bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-slate-800 text-sm">{hazard}</span>
                  </li>
                )) : (
                  <li className="text-slate-500 italic">No specific hazards detected.</li>
                )}
              </ul>
            </div>

            {/* Recommendations List */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                Remedial Actions
              </h3>
              <ul className="space-y-3">
                {selectedReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-slate-800 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-500 text-sm flex justify-between items-center">
            <span>Generated by SiteGuard AI</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white">Inspection Reports</h2>
           <p className="text-slate-400">View and export safety documentation</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="p-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Score</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Hazards</th>
                  <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-white">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                        <span className="text-slate-500 text-xs">{new Date(report.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        report.complianceStatus === 'Compliant' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        report.complianceStatus === 'Minor Violations' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {report.complianceStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              report.safetyScore > 80 ? 'bg-green-500' : 
                              report.safetyScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${report.safetyScore}%` }}
                          />
                        </div>
                        <span className="text-white font-medium">{report.safetyScore}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {report.hazards.length} detected
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="text-amber-500 hover:text-amber-400 text-sm font-medium hover:underline flex items-center justify-end ml-auto"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full inline-flex mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg">No reports available</p>
            <p className="text-sm">Run an analysis in the Site Scanner to generate reports.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;