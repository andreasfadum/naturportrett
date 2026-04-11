import { VERSION_DATE } from '../../version.js'

export default function DevBanner() {
  return (
    <div style={{
      backgroundColor: '#2C2C2C',
      color: '#F9C66B',
      textAlign: 'center',
      padding: '6px 16px',
      fontSize: '0.8rem',
      fontFamily: 'var(--font)',
      letterSpacing: '0.02em',
    }}>
      Testversjon under utvikling — sist oppdatert {VERSION_DATE}
    </div>
  )
}
