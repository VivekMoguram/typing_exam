import { useState, useEffect, useRef, useCallback } from 'react'
import Header from './components/Header'
import TextSetup from './components/TextSetup'
import TypingArea from './components/TypingArea'
import MetricsBar from './components/MetricsBar'
import ResultDashboard from './components/ResultDashboard'
import { calculateMetrics } from './utils/calculations'
import { saveResult } from './utils/storage'

const PHASES = { SETUP: 'setup', IDLE: 'idle', RUNNING: 'running', FINISHED: 'finished' }

export default function App() {
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [targetText, setTargetText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [duration, setDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(300)
  const [metrics, setMetrics] = useState({ grossWPM: 0, netWPM: 0, accuracy: 100, errorHits: 0, errorList: [] })

  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const typedTextRef = useRef('')

  // Sync ref with state for the timer closure to prevent stale data
  useEffect(() => {
    typedTextRef.current = typedText
  }, [typedText])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const finishTest = useCallback((elapsed, typed) => {
    stopTimer()
    const m = calculateMetrics(targetText, typed, elapsed)
    setMetrics(m)
    setPhase(PHASES.FINISHED)
    saveResult({ ...m, duration, timestamp: new Date().toLocaleString('en-IN') })
  }, [targetText, duration, stopTimer])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = (duration * 60) - elapsed

      if (remaining <= 0) {
        setTimeLeft(0)
        finishTest(duration * 60, typedTextRef.current)
      } else {
        setTimeLeft(remaining)
        // Silently calculate live metrics for the final result
        setMetrics(calculateMetrics(targetText, typedTextRef.current, elapsed))
      }
    }, 1000)
  }, [duration, targetText, finishTest])

  const handleStart = (text, dur) => {
    setTargetText(text)
    setDuration(dur)
    setTimeLeft(dur * 60)
    setTypedText('')
    typedTextRef.current = ''
    setPhase(PHASES.IDLE)
  }

  const handleType = (newVal) => {
    if (phase === PHASES.IDLE) {
      setPhase(PHASES.RUNNING)
      startTimer()
    }

    setTypedText(newVal)

    // Auto-finish when text is completed
    if (newVal.length >= targetText.length && targetText.length > 0) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      finishTest(elapsed || 1, newVal)
    }
  }

  const handleRetry = () => {
    stopTimer()
    setTypedText('')
    typedTextRef.current = ''
    setTimeLeft(duration * 60)
    setPhase(PHASES.IDLE)
  }

  const handleReset = () => {
    stopTimer()
    setTypedText('')
    typedTextRef.current = ''
    setTargetText('')
    setPhase(PHASES.SETUP)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  return (
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden font-sans selection:bg-amber-200">
      <Header />

      <main className="flex-1 min-h-0 relative">
        {/* PHASE 1: SETUP (Scrollable for paragraph entry) */}
        {phase === PHASES.SETUP && (
          <div className="h-full overflow-y-auto p-8 flex items-center justify-center animate-in fade-in duration-500">
            <TextSetup onStart={handleStart} />
          </div>
        )}

        {/* PHASE 2: TEST MODE (Strict Locked Viewport) */}
        {(phase === PHASES.IDLE || phase === PHASES.RUNNING) && (
          <div className="h-full flex flex-col p-8 max-w-7xl mx-auto w-full gap-8 animate-in fade-in duration-700">
            <div className="flex-shrink-0">
              <MetricsBar timeLeft={timeLeft} phase={phase} duration={duration} />
            </div>

            <div className="flex-1 min-h-0">
              <TypingArea targetText={targetText} typedText={typedText} onChange={handleType} phase={phase} />
            </div>

            <div className="flex-shrink-0 text-center pb-2">
               <button
                 onClick={() => {
                   const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 1;
                   finishTest(elapsed, typedText);
                 }}
                 className="text-[11px] font-black text-stone-400 hover:text-red-600 uppercase tracking-[0.4em] transition-all border-b border-transparent hover:border-red-500 pb-1"
               >
                 Terminate & Calculate Results
               </button>
            </div>
          </div>
        )}

        {/* PHASE 3: RESULTS (Scrollable for error review) */}
        {phase === PHASES.FINISHED && (
          <div className="h-full overflow-y-auto p-10 custom-scrollbar animate-in slide-in-from-bottom-6 duration-700">
            <ResultDashboard
              metrics={metrics}
              duration={duration}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      <footer className="flex-shrink-0 bg-stone-900 py-3 text-center text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">
        High Court Typing Interface &mdash; Secure Exam Environment
      </footer>
    </div>
  )
}