/**
 * Viser Claude-svaret som formatert tekst.
 * Bruker enkel Markdown-parsing (ingen ekstern lib nødvendig).
 */
export default function RecommendationPanel({ text, isStreaming }) {
  if (!text) return null

  return (
    <div className="recommendation-panel">
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
      />
      {isStreaming && (
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 16,
            background: 'var(--oslo-morkebla)',
            marginLeft: 2,
            verticalAlign: 'middle',
            animation: 'blink 1s step-end infinite',
          }}
        />
      )}
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  )
}

function renderMarkdown(text) {
  return text
    // Overskrifter
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Fet skrift
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Kursiv
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Punktliste
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Numrert liste
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Linjeskift → avsnitt
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.)/gm, '<p>$&')
    .replace(/<p>(<[hul])/g, '$1')
    // Rydde opp
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
}
