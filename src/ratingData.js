import { surveySections } from './data.js';

const seededRandom = (initialSeed) => {
  let seed = initialSeed;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
};

const clampScore = (value) => Math.max(0, Math.min(4, Math.round(value)));

const createSurveySamples = (count, base, spread, random) =>
  Array.from({ length: count }, () => {
    const jitter = () => (random() + random() + random() - 1.5) * spread;
    const explicitness =
      random() < 0.2 ? clampScore(base[2] + (random() < 0.5 ? -2 : 2)) : base[2];

    return {
      spice:
        count >= 100 && random() < 0.03
          ? null
          : [clampScore(base[0] + jitter()), clampScore(base[1] + jitter()), explicitness],
      cleanliness:
        count >= 100 && random() < 0.06
          ? null
          : base.slice(3).map((score) => clampScore(score + jitter())),
    };
  });

const random = seededRandom(7);
const surveyResults = {
  wok: createSurveySamples(412, [0, 0, 0, 1, 1, 3, 2, 2, 2], 1, random),
  hc: createSurveySamples(284, [3, 3, 4, 2, 2, 3, 2, 3, 3], 1.4, random),
  sl: createSurveySamples(6, [1, 1, 2, 0, 1, 1, 0, 1, 1], 1, random),
  rp: createSurveySamples(97, [2, 2, 2, 1, 1, 0, 0, 1, 1], 1, random),
  gi: createSurveySamples(38, [2, 2, 2, 2, 2, 2, 1, 2, 2], 2.6, random),
  wb: createSurveySamples(150, [0, 0, 0, 0, 0, 0, 0, 0, 0], 0.6, random),
};

const sum = (values) => values.reduce((total, value) => total + value, 0);
const average = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
const histogram = (rows, score) => {
  const result = Array(6).fill(0);
  rows.forEach((row) => {
    const bucket = Math.max(0, Math.min(5, Math.round(score(row))));
    result[bucket] += 1;
  });
  return result;
};

export function addSurvey(bookId, survey) {
  surveyResults[bookId] ??= [];
  surveyResults[bookId].push(survey);
}

export function getContentRatings(bookId) {
  const results = surveyResults[bookId] || [];
  const spiceRows = results.filter((row) => row.spice);
  const cleanRows = results.filter((row) => row.cleanliness);
  const spiceScore = (row) =>
    1.25 * (0.5 * row.spice[0] + 0.3 * row.spice[1] + 0.2 * row.spice[2]);
  const cleanScore = (row) => 5 - (1.25 * sum(row.cleanliness)) / 6;
  const categories = [
    {
      title: 'Sexual content',
      count: spiceRows.length,
      score: average(spiceRows.map((row) => sum(row.spice) / 3)),
      labels: ['None', 'Mild', 'Moderate', 'Explicit', 'Very explicit'],
    },
    {
      title: 'Profanity',
      count: cleanRows.length,
      score: average(cleanRows.map((row) => (row.cleanliness[0] + row.cleanliness[1]) / 2)),
      labels: ['None', 'Low', 'Moderate', 'High', 'Very high'],
    },
    {
      title: 'Violence',
      count: cleanRows.length,
      score: average(cleanRows.map((row) => (row.cleanliness[2] + row.cleanliness[3]) / 2)),
      labels: ['None', 'Low', 'Moderate', 'High', 'Very high'],
    },
    {
      title: 'Other mature themes',
      count: cleanRows.length,
      score: average(cleanRows.map((row) => (row.cleanliness[4] + row.cleanliness[5]) / 2)),
      labels: ['None', 'Low', 'Moderate', 'High', 'Very high'],
    },
  ].map((category) => ({
    ...category,
    label:
      category.score === null
        ? null
        : category.labels[Math.min(4, Math.round(category.score))],
  }));

  return {
    spiceCount: spiceRows.length,
    cleanCount: cleanRows.length,
    spice: average(spiceRows.map(spiceScore)),
    cleanliness: average(cleanRows.map(cleanScore)),
    spiceHistogram: histogram(spiceRows, spiceScore),
    cleanHistogram: histogram(cleanRows, cleanScore),
    categories,
  };
}

export function getSurveyValue(question, selectedIndex) {
  return question.values ? question.values[selectedIndex] : selectedIndex;
}

export function sectionAnswers(section, answers) {
  return section.questions.every((question) => answers[question.key] !== undefined);
}

export function compileSurvey(answers) {
  const questions = surveySections.flatMap((section) => section.questions);
  const value = (key) => {
    const question = questions.find((item) => item.key === key);
    return getSurveyValue(question, answers[key]);
  };
  const has = (keys) => keys.every((key) => answers[key] !== undefined);

  return {
    spice: has(['E', 'F', 'P']) ? ['E', 'F', 'P'].map(value) : null,
    cleanliness: has(['pf', 'ps', 'vi', 'vg', 'tm', 'tf'])
      ? ['pf', 'ps', 'vi', 'vg', 'tm', 'tf'].map(value)
      : null,
  };
}
