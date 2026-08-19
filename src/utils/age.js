// Calendar-accurate age calculation. Using setMonth() arithmetic (rather than
// dividing days by 30.44) so month boundaries line up with real month lengths.

export function getAgeInDays(birthDate, today = new Date()) {
  const start = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((end - start) / 86400000)
}

export function getAgeBreakdown(birthDateStr, today = new Date()) {
  const birth = new Date(birthDateStr)
  const totalDays = getAgeInDays(birth, today)

  let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  const anchor = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate())
  anchor.setMonth(anchor.getMonth() + months)
  if (anchor > today) {
    months -= 1
    anchor.setMonth(anchor.getMonth() - 1)
  }
  const extraDays = getAgeInDays(anchor, today)
  const weeks = Math.floor(totalDays / 7)

  return { totalDays, months, extraDays, weeks, isFuture: totalDays < 0 }
}

export function formatAgeLabel({ totalDays, months, extraDays, weeks, isFuture }) {
  if (isFuture) return 'Due soon'
  if (totalDays < 7) return totalDays === 0 ? 'Born today' : totalDays === 1 ? '1 day old' : `${totalDays} days old`
  if (months < 1) return weeks === 1 ? '1 week old' : `${weeks} weeks old`

  const monthPart = months === 1 ? '1 month' : `${months} months`
  const extraWeeks = Math.floor(extraDays / 7)
  if (extraWeeks === 0) return `${monthPart} old`
  const weekPart = extraWeeks === 1 ? '1 week' : `${extraWeeks} weeks`
  return `${monthPart}, ${weekPart} old`
}

export function findStageForMonths(stages, months) {
  if (months < 0) return null
  return stages.find((stage) => months >= stage.minMonths && months < stage.maxMonths) ?? null
}
