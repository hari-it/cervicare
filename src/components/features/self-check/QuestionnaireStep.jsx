import Button from '../../ui/Button'

function QuestionnaireStep({ question, selected, onSelect, onPrev, onNext, isFirst, isLast, canContinue }) {
  return (
    <div>
      <h2>{question.prompt}</h2>
      <div className="question-options" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`option ${selected === option.value ? 'selected' : ''}`}
            onClick={() => onSelect(option.value)}
            aria-pressed={selected === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="step-nav">
        <Button variant="outline" onClick={onPrev} disabled={isFirst}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          {isLast ? 'See guidance' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default QuestionnaireStep
