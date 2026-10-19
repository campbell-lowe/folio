export const books = [
  {
    id: 'wok',
    isbn: '9780765326355',
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    from: '#35557c',
    to: '#101c33',
    motif: 0,
    hook: 'Storms, ancient oaths and a world that rewards patience.',
  },
  {
    id: 'hc',
    title: 'The Hollow Crown',
    author: 'Mara Ellison',
    from: '#8a2f4f',
    to: '#33121f',
    motif: 1,
    hook: 'A throne, a fragile treaty, and a queen nobody underestimates twice.',
  },
  {
    id: 'sl',
    title: 'Salt & Starlight',
    author: 'Iris Vale',
    from: '#2f7a78',
    to: '#122f3c',
    motif: 2,
    hook: 'Sea-witch romance with salt-sharp prose.',
  },
  {
    id: 'rp',
    title: 'The Rosewater Pact',
    author: 'Elena Marsh',
    from: '#a24a65',
    to: '#4a1a33',
    motif: 1,
    hook: 'Two rival florists and one very unlikely truce.',
  },
  {
    id: 'ms',
    title: 'Moth Season',
    author: 'T. L. Okafor',
    from: '#8a6a3b',
    to: '#3f2b1a',
    motif: 0,
    hook: 'A quiet mystery in a town of moth keepers.',
  },
  {
    id: 'gi',
    title: 'A Garden of Ink',
    author: 'Noor Haddad',
    from: '#4f6b45',
    to: '#1f3326',
    motif: 2,
    hook: 'Tattoo artists and a map that rewrites itself.',
  },
  {
    id: 'cd',
    title: 'The Cartographer’s Daughter',
    author: 'Wren Aldous',
    from: '#6b4e8a',
    to: '#271a3d',
    motif: 1,
    hook: 'A mapmaker’s daughter and a coastline that keeps changing.',
  },
  {
    id: 'wb',
    title: 'Winterbloom',
    author: 'Hana Petrov',
    from: '#3a6f92',
    to: '#1a2f45',
    motif: 2,
    hook: 'Cozy found-family fantasy in a town where winter never leaves.',
  },
];

export const initialBookshelf = {
  wok: { status: 'reading', progress: 40, shelved: true },
  rp: { status: 'finished', rating: 5, shelved: true },
  gi: { status: 'finished', rating: 4, shelved: true },
  ms: { status: 'paused', progress: 20, shelved: true },
  sl: { status: 'want', shelved: false },
};

export const creators = [
  {
    name: 'pagesandplum',
    color: '#D9A6AD',
    books: [['hc', 'free']],
    title: 'Three reasons the court politics hooked me',
    group: 'following',
  },
  {
    name: 'inkedmargins',
    color: '#B7A1C9',
    books: [
      ['rp', 'free'],
      ['gi', 'spoilers'],
    ],
    title: 'Two slow-burn romances, compared',
    group: 'following',
  },
  {
    name: 'lunareads',
    color: '#A8B9A0',
    books: [['wok', 'free']],
    title: 'Why the worldbuilding keeps me reading',
    group: 'interest',
  },
  {
    name: 'iris.vale',
    color: '#C6A467',
    books: [['sl', 'free']],
    title: 'Author note: where the sea chapters began',
    group: 'interest',
    author: true,
  },
];

export const clubPosts = {
  free: [
    ['Reader reaction', '@pagesandplum', 'First impressions, no plot details.', 'Video'],
    ['Review · 4.5★', '@inkedmargins', 'Prose, pacing and who it’s for.', 'Review'],
    ['Worldbuilding talk', '24 replies', 'What stands out about the setting?', 'Chat'],
    ['Fan art: cover redraw', '@lunareads', 'Ink and watercolor.', 'Art'],
  ],
  spoilers: [
    ['Ending reactions', '@pagesandplum', 'Full spoilers for the finale.', 'Video'],
    ['Theory thread', '31 replies', 'What the last chapter really implies.', 'Chat'],
    ['Favorite scenes, ranked', '@inkedmargins', 'Spoilers throughout.', 'Review'],
  ],
};

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

export const contentWarnings = {
  wok: ['War violence', 'Grief and loss', 'Past abuse'],
  hc: ['Explicit scenes', 'Violence', 'Coercion'],
  sl: ['Mild peril'],
  rp: ['Open-door scenes', 'Family conflict'],
  gi: ['Body horror', 'Addiction'],
  wb: ['Mild peril'],
};

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
