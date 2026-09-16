function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite">
      <div className="spinner" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default Spinner
