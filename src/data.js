export const statusLabels = {
  reading: 'Reading',
  want: 'Want to read',
  finished: 'Finished',
  paused: 'Paused',
};

export const coverPalette = [
  '#D9A6AD',
  '#F2CFD3',
  '#B7A1C9',
  '#49334F',
  '#A8B9A0',
  '#3F5B45',
  '#C6A467',
  '#765749',
  '#8FB3C9',
  '#FAF5EF',
  '#E58C7A',
  '#1F2A44',
];

export const rainbowPalette = [
  '#E58C7A',
  '#C6A467',
  '#E6D27A',
  '#A8B9A0',
  '#8FB3C9',
  '#B7A1C9',
  '#D9A6AD',
];

export const surveySections = [
  {
    title: 'Sexual content',
    questions: [
      {
        key: 'E',
        prompt: 'How explicit are the sexual scenes?',
        options: [
          'None|Kissing at most',
          'Mild|Suggestive, fades to black',
          'Some|On the page, limited detail',
          'Moderate|Explicit, moderate detail',
          'Graphic|Highly detailed',
        ],
      },
      {
        key: 'F',
        prompt: 'How often does sexual content appear?',
        options: [
          'Never',
          'Rarely|One or two scenes',
          'Sometimes|A few scenes',
          'Often|Regular throughout',
          'Constantly|A major focus',
        ],
      },
      {
        key: 'P',
        prompt: 'Is it on the page or only implied?',
        values: [0, 2, 4],
        options: ['Neither|Not present', 'Implied only|Off the page', 'On the page|Shown directly'],
      },
    ],
  },
  {
    title: 'Profanity',
    questions: [
      {
        key: 'pf',
        prompt: 'How often is profanity used?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'],
      },
      {
        key: 'ps',
        prompt: 'How strong is the language?',
        options: [
          'None',
          'Mild|damn, hell',
          'Moderate|Common swearing',
          'Strong|Frequent f-words',
          'Extreme|Slurs or relentless',
        ],
      },
    ],
  },
  {
    title: 'Violence',
    questions: [
      {
        key: 'vi',
        prompt: 'How intense is the violence?',
        options: [
          'None',
          'Mild|Brief or off the page',
          'Moderate|Fights and injuries',
          'Intense|Frequent combat or death',
          'Brutal|Pervasive',
        ],
      },
      {
        key: 'vg',
        prompt: 'Is graphic violence or gore present?',
        options: [
          'No',
          'Rarely|Brief',
          'Sometimes|Several scenes',
          'Often|Regularly detailed',
          'Pervasive|Gore throughout',
        ],
      },
    ],
  },
  {
    title: 'Other mature themes',
    questions: [
      {
        key: 'tm',
        prompt: 'Are themes like abuse, addiction, suicide or trauma present?',
        options: [
          'None',
          'Light mention|Brief reference',
          'Present|Part of the story',
          'Prominent|A major focus',
          'Central|Defines the book',
        ],
      },
      {
        key: 'tf',
        prompt: 'How intensely are they portrayed?',
        options: [
          'Not present',
          'Gentle|Handled lightly',
          'Moderate',
          'Intense|Detailed and heavy',
          'Very intense',
        ],
      },
    ],
  },
];
