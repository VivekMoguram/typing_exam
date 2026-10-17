import { useEffect, useState } from 'react';
import { metricsToCSV, downloadFile } from "../utils/calculations";
import { loadLastResult } from "../utils/storage";
import { Download, Copy, RotateCcw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResultDashboard({ metrics, duration, onRetry, onReset }) {
  const [copied, setCopied] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    setLastResult(loadLastResult());
  }, []);

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Performance Logic
  const isQualified = metrics.accuracy >= 95 && metrics.netWPM >= 40;
  const performance =
    isQualified ? { label: 'Distinction (Grade A)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '🏆' } :
    metrics.accuracy >= 90 ? { label: 'Qualified (Grade B)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: '✅' } :
    metrics.accuracy >= 80 ? { label: 'Average (Grade C)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '⚖️' } :
    { label: 'Needs Practice', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '✍️' };

  function handleCopy() {
    const text = `--- HIGH COURT TYPING REPORT ---
Date: ${timestamp}
Speed: ${metrics.netWPM} WPM (Net)
Accuracy: ${metrics.accuracy}%
Total Errors: ${metrics.errorHits}
Result: ${performance.label}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const handleDownloadCSV = () => {
    const csv = metricsToCSV(metrics, duration, timestamp);
    downloadFile(csv, `typing_report_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Result Card */}
      <div className={`relative overflow-hidden border-2 rounded-2xl p-8 shadow-sm ${performance.bg}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FileText size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-stone-500 uppercase tracking-widest font-black text-xs">Official Assessment</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-4xl">{performance.icon}</span>
              <p className={`text-4xl font-black tracking-tight ${performance.color}`}>
                {performance.label}
              </p>
            </div>
            <p className="mt-4 text-stone-600 font-medium">
              Completed a {duration} minute legal transcription test on <span className="text-stone-900">{timestamp}</span>.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white shadow-inner text-center min-w-[140px]">
            <p className="text-xs font-bold text-stone-400 uppercase">Final Score</p>
            <p className={`text-5xl font-mono font-black ${performance.color}`}>{metrics.netWPM}</p>
            <p className="text-xs font-bold text-stone-500 mt-1">NET WPM</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Gross Speed', val: metrics.grossWPM, unit: 'WPM', desc: 'Total typing speed' },
          { label: 'Accuracy', val: metrics.accuracy, unit: '%', desc: 'Precision factor' },
          { label: 'Total Errors', val: metrics.errorHits, unit: 'Hits', desc: 'Incorrect keys' },
          { label: 'Net Strokes', val: metrics.netStrokes, unit: 'Chars', desc: 'Correct characters' },
          { label: 'Gross Strokes', val: metrics.grossStrokes, unit: 'Chars', desc: 'Total keys pressed' },
          { label: 'Time Used', val: duration, unit: 'Mins', desc: 'Test duration' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm hover:border-amber-400 transition-colors group">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-amber-600">{s.label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-mono font-bold text-stone-900">{s.val}</span>
              <span className="text-sm font-bold text-stone-400">{s.unit}</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-2 italic">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Detailed Error Analysis */}
      {metrics.errorList.length > 0 && (
        <div className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
            <h3 className="font-black text-stone-800 text-sm uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" /> Error Log (Top 50)
            </h3>
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {metrics.errorList.length} Mistakes
            </span>
          </div>
          <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar bg-stone-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.errorList.slice(0, 50).map((err, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 font-mono text-sm shadow-sm">
                  <span className="text-stone-400 text-xs">Pos: #{err.position}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-50 text-red-500 line-through px-2 py-1 rounded border border-red-100 italic">
                      {err.typed === ' ' ? '␣' : err.typed}
                    </span>
                    <span className="text-stone-300">→</span>
                    <span className="bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded border border-emerald-100">
                      {err.expected === ' ' ? '␣' : err.expected}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button onClick={onRetry} className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg">
          <RotateCcw size={20} /> Retry Text
        </button>
        <button onClick={onReset} className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 bg-white border-2 border-stone-900 text-stone-900 rounded-xl font-bold hover:bg-stone-50 transition-all active:scale-95 shadow-sm">
          <FileText size={20} /> New Paragraph
        </button>
        <div className="w-full flex gap-3">
          <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-300 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors text-sm">
            {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy Results'}
          </button>
          <button onClick={handleDownloadCSV} className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-300 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors text-sm">
            <Download size={18} /> Download CSV
          </button>
        </div>
      </div>

      {/* Previous Session Reference */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs font-medium text-stone-500">
          <span>Previous Best: <strong className="text-stone-900">{lastResult.netWPM} WPM</strong></span>
          <span>Last Test: {lastResult.timestamp}</span>
        </div>
      )}
    </div>
  );
}