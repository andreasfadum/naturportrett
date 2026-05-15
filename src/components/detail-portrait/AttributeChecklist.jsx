export default function AttributeChecklist({ items }) {
  return (
    <div className="portrait-doc__attributes">
      {items.map((item, i) => (
        <div key={i} className="portrait-doc__attribute-row">
          <span className="portrait-doc__attribute-label">{item.label}</span>
          <span className={`portrait-doc__attribute-mark ${item.value ? 'is-yes' : 'is-no'}`}>
            {item.value ? 'X' : '÷'}
          </span>
        </div>
      ))}
    </div>
  )
}
