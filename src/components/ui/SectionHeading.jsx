function SectionHeading({ title, subtitle, align = 'center' }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  )
}

export default SectionHeading
