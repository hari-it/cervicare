function ProgressBar({ value, max = 100, label }) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label ? <p className="sr-only">{label}</p> : null}
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
