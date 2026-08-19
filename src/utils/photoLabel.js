import { stages } from '../data/stages'
import { getAgeBreakdown, formatAgeLabel } from './age'

export function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function sortKeyForPhoto(photo) {
  if (photo.mode === 'date') return getAgeBreakdown(photo._birthDate, new Date(photo.dateTaken)).totalDays
  const stage = stages.find((s) => s.id === photo.stageId)
  return (stage?.minMonths ?? 0) * 30.44
}

export function labelForPhoto(photo) {
  if (photo.mode === 'date') {
    const ageInfo = getAgeBreakdown(photo._birthDate, new Date(photo.dateTaken))
    return `${formatAgeLabel(ageInfo)} · ${formatFullDate(photo.dateTaken)}`
  }
  const stage = stages.find((s) => s.id === photo.stageId)
  return stage ? `${stage.ageLabel} · ${stage.name}` : 'Untagged'
}
