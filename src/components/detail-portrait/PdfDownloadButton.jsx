export default function PdfDownloadButton({ label = 'Last ned som PDF' }) {
  return (
    <button
      type="button"
      className="btn btn--secondary no-print"
      onClick={() => window.print()}
    >
      📄 {label}
    </button>
  )
}
