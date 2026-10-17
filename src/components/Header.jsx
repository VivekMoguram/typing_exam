export default function Header() {
  return (
    <header className="bg-stone-900 text-amber-50 px-6 py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">⚖ High Court Typing Exam</h1>
          <p className="text-stone-400 text-sm mt-0.5">Preparation & Practice Tool</p>
        </div>
        <div className="text-right text-xs text-stone-400">
          <p>English Stenography</p>
          <p>Practice Mode</p>
        </div>
      </div>
    </header>
  )
}
