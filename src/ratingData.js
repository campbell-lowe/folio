import { surveySections } from './data.js';

const surveyResults = {};

export function seedDemoRatings(ratingSeeds) {
  Object.entries(ratingSeeds).forEach(([bookId, seed]) => {
    if (surveyResults[bookId]) return;
    surveyResults[bookId] = Array.from({ length: seed.count }, (_, index) => {
      const spiceShift = index % 4 === 0 ? 1 : 0;
      const cleanShift = index % 5 === 0 ? 1 : 0;
      return {
        spice: seed.spice.map((value) => Math.max(0, Math.min(4, value + spiceShift))),
        cleanliness: seed.cleanliness.map((value) => Math.max(0, Math.min(4, value + cleanShift))),
      };
    });
  });
}

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
  let results = surveyResults[bookId] || [];
  const isPlaceholder = results.length === 0;
  if (isPlaceholder) {
    const hash = [...bookId].reduce(
      (total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0,
      0,
    );
    const spiceLevel = hash % 4;
    const cleanlinessLevel = 4 - (Math.floor(hash / 4) % 5);
    const count = 12 + (hash % 19);
    results = Array.from({ length: count }, (_, index) => ({
      spice: [
        Math.max(0, Math.min(4, spiceLevel + (index % 3 === 0 ? 1 : index % 5 === 0 ? -1 : 0))),
        Math.max(0, Math.min(4, spiceLevel + (index % 4 === 0 ? 1 : 0))),
        index % 3 === 0 ? 2 : 1,
      ],
      cleanliness: Array.from({ length: 6 }, (__, position) =>
        Math.max(0, Math.min(4, cleanlinessLevel + (
          (index + position) % 7 === 0 ? -1
            : (index + position) % 9 === 0 ? 1
              : 0
        ))),
      ),
    }));
  }
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
    isPlaceholder,
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
