import { useEffect, useRef } from 'react'
import { buildCharMap } from '../utils/calculations'

export default function TypingArea({ targetText, typedText, onChange, phase }) {
  const inputRef = useRef(null)
  const characters = buildCharMap(targetText, typedText)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <section className="h-full min-h-0 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-700">
          Practice Passage
        </h2>
        <span className="text-xs font-medium text-stone-400">
          {phase === 'running' ? 'Session in progress' : 'Type the passage below to begin'}
        </span>
      </div>

      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5 font-mono text-lg leading-9 text-stone-800"
        aria-label="Text to type"
      >
        <p className="whitespace-pre-wrap">
          {characters.map(({ char, status }, index) => (
            <span
              key={index}
              className={
                status === 'correct'
                  ? 'char-correct'
                  : status === 'incorrect'
                    ? 'char-incorrect'
                    : status === 'current'
                      ? 'char-current'
                      : ''
              }
            >
              {char}
            </span>
          ))}
        </p>
      </div>

      <div className="border-t border-stone-100 p-4">
        <label htmlFor="typing-input" className="sr-only">
          Type the passage here
        </label>
        <textarea
          ref={inputRef}
          id="typing-input"
          value={typedText}
          onChange={event => onChange(event.target.value)}
          placeholder="Start typing here..."
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          className="custom-scrollbar block w-full resize-none rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-sm leading-6 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
    </section>
  )
}
