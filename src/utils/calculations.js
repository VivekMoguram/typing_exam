export const SAMPLE_TEXTS = [
  `The jurisdiction of the High Court extends to all cases of civil and criminal nature arising within the territorial limits of the State. The Court has the power to issue writs including habeas corpus, mandamus, prohibition, quo warranto and certiorari to any person or authority including the Government in appropriate cases. Every High Court shall have full power to determine all matters and questions whether of law or fact. The Chief Justice of the High Court is appointed by the President of India in consultation with the Chief Justice of India and the Governor of the State concerned. The salaries and allowances of the Judges of the High Court are charged to the Consolidated Fund of the State. No Judge of a High Court shall be removed from his office except by an order of the President passed after an address by each House of Parliament supported by a majority of the total membership of that House and by a majority of not less than two thirds of the members of that House present and voting has been presented to the President.`,
  
  `The Supreme Court of India is the apex court and the final court of appeal under the Constitution of India. The Supreme Court has original, appellate and advisory jurisdiction. The original jurisdiction extends to any dispute between the Government of India and one or more States, or between two or more States if and insofar as the dispute involves any question whether of law or fact on which the existence or extent of a legal right depends. In exercise of its wide discretionary power the Supreme Court may in its appellate jurisdiction interfere with finding of fact by a High Court and even with a finding of fact by a subordinate court if the finding is such that it shocks the conscience of the court. The Chief Justice of India is the head of the judiciary and the Supreme Court.`,

  `Article 21 of the Constitution of India states that no person shall be deprived of his life or personal liberty except according to procedure established by law. The right to life and personal liberty is the most fundamental of all fundamental rights guaranteed by the Constitution. This right has been given an expansive interpretation by the Supreme Court over the years. The right to live with human dignity, the right to livelihood, the right to health, the right to education and the right to a clean environment have all been read into Article 21. The procedure established by law must be just fair and reasonable and not arbitrary fanciful or oppressive. Due process of law is an essential component of Article 21 as interpreted by the Supreme Court of India in numerous landmark judgments delivered over the decades.`
]

export function calculateMetrics(targetText, typedText, elapsedSeconds) {
  const targetChars = targetText.split('')
  const typedChars = typedText.split('')
  const minutes = elapsedSeconds / 60

  let correctChars = 0
  let errorHits = 0
  const errorList = []

  for (let i = 0; i < typedChars.length; i++) {
    if (i < targetChars.length) {
      if (typedChars[i] === targetChars[i]) {
        correctChars++
      } else {
        errorHits++
        errorList.push({
          position: i + 1,
          expected: targetChars[i],
          typed: typedChars[i],
        })
      }
    } else {
      errorHits++
      errorList.push({
        position: i + 1,
        expected: '',
        typed: typedChars[i],
      })
    }
  }

  const grossStrokes = typedChars.length
  const netStrokes = correctChars
  const grossWPM = minutes > 0 ? Math.round(grossStrokes / 5 / minutes) : 0
  const netWPM = minutes > 0 ? Math.max(0, Math.round((correctChars - errorHits) / 5 / minutes)) : 0
  const accuracy = grossStrokes > 0 ? parseFloat(((correctChars / grossStrokes) * 100).toFixed(2)) : 100

  return {
    grossWPM,
    netWPM,
    accuracy,
    grossStrokes,
    netStrokes,
    errorHits,
    errorList,
    elapsedSeconds,
  }
}

export function buildCharMap(targetText, typedText) {
  const result = []
  for (let i = 0; i < targetText.length; i++) {
    if (i < typedText.length) {
      result.push({
        char: targetText[i],
        status: typedText[i] === targetText[i] ? 'correct' : 'incorrect',
        typed: typedText[i],
      })
    } else if (i === typedText.length) {
      result.push({ char: targetText[i], status: 'current', typed: null })
    } else {
      result.push({ char: targetText[i], status: 'pending', typed: null })
    }
  }
  return result
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function metricsToCSV(metrics, duration, timestamp) {
  const headers = ['Timestamp','Duration (min)','Gross WPM','Net WPM','Accuracy (%)','Gross Strokes','Net Strokes','Error Hits']
  const values = [
    timestamp,
    duration,
    metrics.grossWPM,
    metrics.netWPM,
    metrics.accuracy,
    metrics.grossStrokes,
    metrics.netStrokes,
    metrics.errorHits,
  ]
  return headers.join(',') + '\n' + values.join(',')
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
