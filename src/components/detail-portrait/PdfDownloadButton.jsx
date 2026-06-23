import { useT } from '../../i18n/index.jsx'

export default function PdfDownloadButton({ label }) {
  const t = useT()
  return (
    <button
      type="button"
      className="btn btn--secondary no-print"
      onClick={() => window.print()}
    >
      📄 {label || t('knapp.last-ned-pdf')}
    </button>
  )
}
