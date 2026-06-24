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

// FILTER_OPTIONS: `value` er stabil intern ID (matcher mot species.category
// i filterlogikk). `labelKey` er i18n-nøkkel for visningstekst — SpeciesFilter
// renderer t(labelKey) basert på valgt språk.
export const FILTER_OPTIONS = [
  { value: 'alle', labelKey: 'filter.kategori.alle' },
  { value: 'Fugl', labelKey: 'filter.kategori.fugler' },
  { value: 'Plante', labelKey: 'filter.kategori.planter' },
  { value: 'Pattedyr', labelKey: 'filter.kategori.pattedyr' },
  { value: 'Insekt', labelKey: 'filter.kategori.insekter' },
  { value: 'Sopp', labelKey: 'filter.kategori.sopp' },
  { value: 'annet', labelKey: 'filter.kategori.andre' },
]

// BADGE_LABEL_KEYS: mapping fra norsk kategori-ID (verdien i species.category)
// til i18n-nøkkel for kategoribadge på artskort. Brukes i SpeciesCard.
export const BADGE_LABEL_KEYS = {
  Fugl: 'kategori.fugl',
  Plante: 'kategori.plante',
  Pattedyr: 'kategori.pattedyr',
  Insekt: 'kategori.insekt',
  Reptil: 'kategori.reptil',
  Amfibium: 'kategori.amfibium',
  Fisk: 'kategori.fisk',
  Edderkoppdyr: 'kategori.edderkoppdyr',
  Sopp: 'kategori.sopp',
  Bløtdyr: 'kategori.blotdyr',
  Dyr: 'kategori.dyr',
  Protist: 'kategori.protist',
  Bakterie: 'kategori.bakterie',
  Annet: 'kategori.annet',
}

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
