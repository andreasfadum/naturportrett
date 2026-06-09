// Bygger API-URL relativt til app-ens base path (f.eks. '/workshop_01/').
// I dev: BASE_URL = '/workshop_01/'  → api('/submit') = '/workshop_01/api/submit'
// I prod: samme — Express monterer routes på samme path.
export function api(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/api${path}`
}
