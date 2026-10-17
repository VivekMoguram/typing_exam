const STORAGE_KEY = 'typing_exam_last_result'

export function saveResult(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Could not save to localStorage', e)
  }
}

export function loadLastResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function clearResult() {
  localStorage.removeItem(STORAGE_KEY)
}
