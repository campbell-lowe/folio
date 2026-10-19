import {
  contentWarnings,
  books,
  surveySections,
} from '../data.js';
import { useFolio } from '../useFolio.js';
import { getContentRatings, compileSurvey, sectionAnswers } from '../ratingData.js';
import { BookCover } from '../components/BookCover.jsx';
import { Button, PageTitle, TopBar } from '../components/Shared.jsx';

const spiceDescriptions = [
  'No explicit content (kissing allowed)',
  'Mild sensuality or suggestive content',
  'Some on-page content, limited detail',
  'Explicit scenes, moderate detail',
  'Frequent or highly detailed explicit scenes',
  'Very frequent or graphic sexual content',
];
const cleanlinessDescriptions = [
  'Extremely mature overall',
  'Extensive mature content',
  'Frequent strong language or significant violence',
  'Some profanity, violence or mature content',
  'Mostly clean, occasional mild content',
  'Very clean',
];

function scoreLabel(value) {
  return value == null ? '–' : value.toFixed(1);
}

function ScoreStars({ value, emoji }) {
  if (value == null) return <span className="muted">Not rated yet</span>;
  const count = Math.round(value);
  return (
    <span className="score-stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {emoji.repeat(count)}
      <span className="faded-stars">{emoji.repeat(5 - count)}</span>
    </span>
  );
}

function RatingScaleCard({ title, emoji, value, count, histogram, descriptions }) {
  const total = histogram.reduce((sum, bucket) => sum + bucket, 0);
  const max = Math.max(...histogram, 1);
  const mean = total
    ? histogram.reduce((sum, bucket, index) => sum + index * bucket, 0) / total
    : 0;
  const deviation = total
    ? Math.sqrt(histogram.reduce((sum, bucket, index) => sum + bucket * (index - mean) ** 2, 0) / total)
    : 0;

  return (
    <section className="card card-content rating-scale">
      <div className="rating-card-heading">
        <h3>{title}</h3>
        <b>{value == null ? 'Not rated yet' : `${value.toFixed(1)} / 5`}</b>
      </div>
      {value == null ? (
        <p className="muted">No reader surveys cover this scale yet.</p>
      ) : (
        <>
          <div className="rating-stars"><ScoreStars value={value} emoji={emoji} /></div>
          <p className="muted">
            Based on {count} reader survey{count === 1 ? '' : 's'}
          </p>
          {count >= 10 && (
            <p className="muted">{deviation > 1.2 ? 'Opinions are divided' : 'Readers mostly agree'}</p>
          )}
          <div className="histogram">
            {histogram.map((bucket, index) => (
              <div className="histogram-row" key={index}>
                <span>{index} {emoji}</span>
                <div className="progress-track">
                  <i style={{ width: `${(bucket / max) * 100}%` }} />
                </div>
                <span>{bucket} · {total ? Math.round((bucket / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
          <p className="muted small-text">Rows show how many surveys landed on each value.</p>
        </>
      )}
      <details>
        <summary>What the {title.toLowerCase()} scale means</summary>
        {descriptions.map((description, index) => (
          <div className="muted scale-description" key={description}>
            <b>{index}</b> · {description}
          </div>
        ))}
      </details>
    </section>
  );
}

export function ContentRatingChip({ bookId }) {
  const { actions } = useFolio();
  const ratings = getContentRatings(bookId);
  const rated = ratings.spiceCount || ratings.cleanCount;
  const label = rated
    ? `Spice ${scoreLabel(ratings.spice)} of 5 from ${ratings.spiceCount} surveys. Cleanliness ${scoreLabel(ratings.cleanliness)} of 5 from ${ratings.cleanCount} surveys. Open details`
    : 'Not rated yet. Open content ratings';

  return (
    <button
      type="button"
      className="rating-chip"
      aria-label={label}
      onClick={() => actions.openRatings(bookId)}
    >
      {rated ? (
        <>
          <span className="spice-chip">🌶️ {scoreLabel(ratings.spice)} <small>({ratings.spiceCount})</small></span>
          <span className="clean-chip">🍃 {scoreLabel(ratings.cleanliness)} <small>({ratings.cleanCount})</small></span>
        </>
      ) : 'Not rated yet'}
    </button>
  );
}

export function ContentRatingCard({ bookId }) {
  const { actions } = useFolio();
  const ratings = getContentRatings(bookId);
  const limitedData =
    (ratings.spiceCount > 0 && ratings.spiceCount < 10) ||
    (ratings.cleanCount > 0 && ratings.cleanCount < 10);

  return (
    <section className="card card-content community-ratings">
      <h3>Community content ratings</h3>
      {[
        ['Spice', ratings.spice, ratings.spiceCount, '🌶️'],
        ['Cleanliness', ratings.cleanliness, ratings.cleanCount, '🍃'],
      ].map(([label, score, count, emoji]) => (
        <div className="rating-summary-row" key={label}>
          <div>
            <b>{label}</b>
            <div>
              {score == null ? (
                <span className="muted">Not rated yet</span>
              ) : (
                <>
                  <ScoreStars value={score} emoji={emoji} /> <b>{score.toFixed(1)}/5</b>
                </>
              )}
            </div>
          </div>
          <span className="muted">
            {count ? `Based on ${count} reader survey${count === 1 ? '' : 's'}` : 'No surveys yet'}
          </span>
        </div>
      ))}
      {limitedData && <p className="muted">Limited data: fewer than 10 surveys, so this may change.</p>}
      <Button variant="small-outline" onClick={() => actions.openRatings(bookId)}>
        View breakdown
      </Button>
    </section>
  );
}

export function ContentRatingsScreen() {
  const { state, actions } = useFolio();
  const book = books.find((item) => item.id === state.currentBookId);
  const ratings = getContentRatings(book.id);
  const hasRatings = ratings.spiceCount || ratings.cleanCount;

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={actions.back}>‹ Back</Button>
        <b>Content ratings</b>
      </TopBar>
      <div className="book-row ratings-book-row">
        <BookCover book={book} size="xs" design={state.coverDesigns[book.id]} />
        <div className="book-row-info">
          <b className="serif">{book.title}</b>
          <span className="muted">{book.author}</span>
        </div>
      </div>
      <p className="muted page-note">
        Community-reported with mock prototype data. This is not an official or definitive rating.
      </p>
      {!hasRatings && (
        <div className="empty-state compact-empty">
          <h2>Not rated yet</h2>
          <p>No reader surveys yet. Be the first to add one.</p>
        </div>
      )}
      <RatingScaleCard
        title="Spice"
        emoji="🌶️"
        value={ratings.spice}
        count={ratings.spiceCount}
        histogram={ratings.spiceHistogram}
        descriptions={spiceDescriptions}
      />
      <RatingScaleCard
        title="Cleanliness"
        emoji="🍃"
        value={ratings.cleanliness}
        count={ratings.cleanCount}
        histogram={ratings.cleanHistogram}
        descriptions={cleanlinessDescriptions}
      />
      <section className="card card-content">
        <h3>Content breakdown</h3>
        {ratings.categories.map((category) => (
          <div className="category-rating" key={category.title}>
            <div>
              <b>{category.title}</b>: {category.label || 'No data'}
              <div className="progress-track">
                <i style={{ width: `${category.score == null ? 0 : (category.score / 4) * 100}%` }} />
              </div>
            </div>
            <span>{category.count} surveys</span>
          </div>
        ))}
        <h3 className="warning-title">Content warnings</h3>
        {contentWarnings[book.id] ? (
          state.bookshelf[book.id] ? (
            <div className="warning-tags">
              {contentWarnings[book.id].map((warning) => (
                <span className="tag" key={warning}>{warning}</span>
              ))}
            </div>
          ) : (
            <>
              <p className="muted">
                Specific warnings can reveal plot details, so they unlock when this book is on your bookshelf.
              </p>
              <Button variant="small" onClick={() => actions.openAddSheet(book.id)}>Add to my list</Button>
            </>
          )
        ) : <p className="muted">None reported yet.</p>}
      </section>
      <div className="page-actions">
        <Button onClick={() => actions.beginSurvey(book.id)}>Add your survey</Button>
      </div>
      <details className="calculation-details">
        <summary>How scores are calculated</summary>
        Each answer is scored 0 to 4. Spice = 1.25 × (0.5 × explicitness + 0.3 × frequency + 0.2 ×
        on-page level), from sexual-content answers only. Cleanliness = 5 − 1.25 × the average of the
        six profanity, violence and themes answers. The two scales never use each other’s answers.
      </details>
    </>
  );
}

export function SurveyScreen() {
  const { state, actions } = useFolio();
  const section = surveySections[state.surveyStep];
  const book = books.find((item) => item.id === state.surveyBookId);

  function continueSurvey(skip = false) {
    if (!skip && !sectionAnswers(section, state.surveyAnswers)) {
      actions.notify('Answer each question, or skip this section.');
      return;
    }
    if (state.surveyStep < surveySections.length - 1) {
      actions.setSurveyStep(state.surveyStep + 1);
      return;
    }
    const result = compileSurvey(state.surveyAnswers);
    if (!result.spice && !result.cleanliness) {
      actions.notify('Answer at least one full section to submit.');
      return;
    }
    actions.submitSurvey(result);
  }

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={() => actions.navigate('ratings')}>Cancel</Button>
        <b>Step {state.surveyStep + 1} of {surveySections.length}</b>
      </TopBar>
      <PageTitle>{section.title}</PageTitle>
      <p className="subtitle">
        {state.surveyStep
          ? 'Cleanliness needs profanity, violence and themes all answered.'
          : 'Optional. Spice uses only these answers.'}{' '}
        Skip anything you don’t remember.
      </p>
      {section.questions.map((question) => (
        <fieldset className="survey-question" key={question.key}>
          <legend>{question.prompt}</legend>
          <div className="survey-options">
            {question.options.map((option, index) => {
              const [label, detail] = option.split('|');
              const selected = state.surveyAnswers[question.key] === index;
              return (
                <button
                  type="button"
                  key={option}
                  className={`survey-option ${selected ? 'selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() =>
                    actions.setSurveyAnswers({
                      ...state.surveyAnswers,
                      [question.key]: index,
                    })
                  }
                >
                  <b>{selected ? '✓ ' : ''}{label}</b>
                  {detail && <span>{detail}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="page-actions">
        <Button onClick={() => continueSurvey(false)}>
          {state.surveyStep === surveySections.length - 1 ? 'Submit survey' : 'Next'}
        </Button>
        <Button variant="link" onClick={() => continueSurvey(true)}>Skip this section</Button>
        <span className="muted">Survey for {book.title}</span>
      </div>
    </>
  );
}
