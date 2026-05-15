import data from '../data/conservation-status.json'

function cleanScientificName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .join(' ')
}

export function getConservationStatus(scientificName) {
  const key = cleanScientificName(scientificName)
  if (!key) return null

  if (data.redlist[key]) {
    return {
      type: 'redlist',
      category: data.redlist[key].category,
      label: data.redlist[key].label,
    }
  }
  if (data.alien[key]) {
    return {
      type: 'alien',
      category: data.alien[key].category,
      label: data.alien[key].label,
    }
  }
  return null
}

export function isThreatenedRedlist(status) {
  return status?.type === 'redlist' && ['CR', 'EN', 'VU', 'NT'].includes(status.category)
}

export function isHighRiskAlien(status) {
  return status?.type === 'alien' && ['SE', 'HI'].includes(status.category)
}
