import Button from '../../ui/Button'

function CtaBand({ title, body, to, actionLabel, variant = 'rose' }) {
  return (
    <div className={`cta-band ${variant === 'green' ? 'cta-green' : ''}`}>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <Button to={to} variant="ghost">
        {actionLabel}
      </Button>
    </div>
  )
}

export default CtaBand
