import { Link } from 'react-router-dom'

function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `button button-${variant} button-${size} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
