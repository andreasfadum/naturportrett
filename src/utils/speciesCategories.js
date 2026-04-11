/**
 * Mapper iNaturalist iconic_taxon_name og GBIF kingdom → norsk kategorinavn
 */
export const CATEGORY_LABELS = {
  // iNaturalist
  Aves: 'Fugl',
  Plantae: 'Plante',
  Mammalia: 'Pattedyr',
  Insecta: 'Insekt',
  Reptilia: 'Reptil',
  Amphibia: 'Amfibium',
  Actinopterygii: 'Fisk',
  Arachnida: 'Edderkoppdyr',
  Fungi: 'Sopp',
  Mollusca: 'Bløtdyr',
  Animalia: 'Dyr',
  // GBIF kingdoms
  ANIMALIA: 'Dyr',
  PLANTAE: 'Plante',
  FUNGI: 'Sopp',
  CHROMISTA: 'Protist',
  BACTERIA: 'Bakterie',
}

export const CATEGORY_CSS = {
  Fugl: 'fugl',
  Plante: 'plante',
  Pattedyr: 'pattedyr',
  Insekt: 'insekt',
  Sopp: 'sopp',
}

export const FILTER_OPTIONS = [
  { value: 'alle', label: 'Alle' },
  { value: 'Fugl', label: 'Fugler' },
  { value: 'Plante', label: 'Planter' },
  { value: 'Pattedyr', label: 'Pattedyr' },
  { value: 'Insekt', label: 'Insekter' },
  { value: 'Sopp', label: 'Sopp' },
  { value: 'annet', label: 'Andre' },
]

export function getCategory(iconicTaxonName, kingdom) {
  return (
    CATEGORY_LABELS[iconicTaxonName] ||
    CATEGORY_LABELS[kingdom] ||
    CATEGORY_LABELS[(kingdom || '').toUpperCase()] ||
    'Annet'
  )
}

export function getCategoryCss(category) {
  return CATEGORY_CSS[category] || 'annet'
}
