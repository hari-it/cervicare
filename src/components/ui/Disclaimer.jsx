function Disclaimer({ children, variant = 'note' }) {
  return (
    <div className={`disclaimer ${variant === 'warning' ? 'disclaimer-warning' : ''}`} role="note">
      <strong>Important:</strong>
      <span>{children}</span>
    </div>
  )
}

export default Disclaimer
