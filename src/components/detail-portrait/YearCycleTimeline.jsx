const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']

export default function YearCycleTimeline({ title = 'Årssyklus', rows = [] }) {
  return (
    <table className="portrait-doc__table portrait-doc__year-cycle">
      <thead>
        <tr>
          <th>{title}</th>
          {MONTHS.map(m => <th key={m}>{m}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.label}>
            <th>{row.label}</th>
            {MONTHS.map(m => (
              <td
                key={m}
                className={row.activeMonths?.includes(m) ? 'year-cycle__active' : ''}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
