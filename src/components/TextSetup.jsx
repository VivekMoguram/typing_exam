import { useState, useEffect } from 'react'
import { SAMPLE_TEXTS } from '../utils/calculations'

function normalizeText(input) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\t/g, '    ')
}

function validateText(input) {
  if (!input || input.trim().length < 100) {
    return 'Enter at least 100 characters of text.'
  }

  const uniqueChars = new Set(input.replace(/\s/g, ''))
  if (uniqueChars.size < 10) {
    return 'Text looks invalid or repetitive.'
  }

  return ''
}

export default function TextSetup({ onStart }) {
  const [text, setText] = useState('')
  const [duration, setDuration] = useState(5)
  const [customDuration, setCustomDuration] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('lastSetup')
    if (saved) {
      const parsed = JSON.parse(saved)
      setText(parsed.text || '')
      setDuration(parsed.duration || 5)
    }
  }, [])

  function handleLoadSample() {
    const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length)
    setText(SAMPLE_TEXTS[idx])
    setError('')
  }

  function handleStart() {
    const normalized = normalizeText(text)

    const validationError = validateText(normalized)
    if (validationError) {
      setError(validationError)
      return
    }

    const finalDuration = customDuration
      ? Number(customDuration)
      : duration

    if (!finalDuration || finalDuration <= 0) {
      setError('Invalid duration.')
      return
    }

    localStorage.setItem(
      'lastSetup',
      JSON.stringify({ text: normalized, duration: finalDuration })
    )

    setError('')
    onStart(normalized, finalDuration)
  }

  const charCount = text.replace(/\s/g, '').length

  return (
    <div className="max-w-3xl mx-auto">
      {/* TEXT INPUT */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-base font-semibold text-stone-800">
            Practice Paragraph
          </label>
          <button
            onClick={handleLoadSample}
            className="text-sm px-4 py-1.5 border border-stone-400 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Load Sample Text
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => {
            setText(e.target.value)
            setError('')
          }}
          rows={8}
          placeholder="Paste your legal paragraph here..."
          className="w-full text-base border border-stone-300 rounded-lg p-4 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-stone-400 leading-relaxed text-stone-800"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}

        <p className="mt-2 text-xs text-stone-500">
          {text.length > 0
            ? `${charCount} characters (excluding spaces)`
            : 'No text loaded'}
        </p>
      </div>

      {/* DURATION */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
        <label className="text-base font-semibold text-stone-800 block mb-4">
          Test Duration
        </label>

        <div className="flex gap-3 mb-4">
          {[1, 5, 10].map(min => (
            <button
              key={min}
              onClick={() => {
                setDuration(min)
                setCustomDuration('')
              }}
              className={`flex-1 py-3 rounded-lg text-base font-semibold border-2 ${
                duration === min && !customDuration
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-300 text-stone-700'
              }`}
            >
              {min}m
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Custom minutes (optional)"
          value={customDuration}
          onChange={e => setCustomDuration(e.target.value)}
          className="w-full mb-6 p-3 border border-stone-300 rounded-lg"
        />

        <button
          onClick={handleStart}
          className="w-full py-4 bg-stone-900 text-white rounded-xl text-lg font-semibold hover:bg-stone-700"
        >
          Start Typing Test →
        </button>
      </div>
    </div>
  )
}