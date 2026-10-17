import { formatTime } from '../utils/calculations'

export default function MetricsBar({ timeLeft, duration, phase }) {
  // Logic to calculate progress bar percentage
  const totalSeconds = duration * 60;
  const progress = phase === 'running' || phase === 'finished'
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto mb-10 text-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center justify-center space-y-2">

        {/* Label for Exam Context */}
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-1">
          Exam Countdown
        </span>

        {/* High-Visibility Digital Timer */}
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-7xl font-mono font-black tabular-nums transition-colors duration-300 ${
            timeLeft <= 10 && phase === 'running'
              ? 'text-red-600 animate-pulse'
              : 'text-stone-900'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-64 bg-stone-200 rounded-full h-1.5 mt-4 overflow-hidden shadow-sm">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 10 && phase === 'running' ? 'bg-red-500' : 'bg-stone-900'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Indicator (Subtle) */}
        <div className="pt-2">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
            phase === 'running'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-stone-200 bg-stone-100 text-stone-500'
          }`}>
            {phase === 'idle' ? 'STANDBY' : phase === 'running' ? 'LIVE SESSION' : 'TIME EXPIRED'}
          </span>
        </div>
      </div>
    </div>
  )
}