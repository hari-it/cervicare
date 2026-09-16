function SourcesList({ items = [] }) {
  return (
    <ol className="sources-list">
      {items.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title}
          </a>
        </li>
      ))}
    </ol>
  )
}

export default SourcesList
