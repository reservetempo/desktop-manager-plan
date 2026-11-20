'use strict';
/* Content for the page. The structure follows the hand-drawn mind map:
   four branches of the Desktop Manager (categories), each with its sub-goals (items).
   Categories are in the order that data flows: Data, Idea organizer, Project organizer, Content generation. */

const CAPTION = 'Key point';

/* The goal of each branch, shown under its heading. */
const CATS = {
  'Data': 'Collect the books and papers, and index them so that every other branch can use them.',
  'Idea organizer': 'Catch each new idea, then sort, weigh and clean up the list. Keep the list of skills here too.',
  'Project organizer': 'Keep each project, its goals and your recent work in one view.',
  'Content generation': 'Turn sources and ideas into a text, then turn the text into a page or a video.'
};

/* Colours on every diagram: 1 Data, 5 Ideas, 3 Projects, 6 Content, 2 shared parts. */

const SRC = {
  fts5: ['SQLite full-text search (FTS5)', 'https://sqlite.org/fts5.html'],
  vec: ['sqlite-vec, vector search for SQLite', 'https://github.com/asg017/sqlite-vec'],
  calibre: ['Calibre database interface', 'https://manual.calibre-ebook.com/db_api.html'],
  zotLocal: ['Zotero local API', 'https://www.zotero.org/support/dev/web_api/v3/local_api'],
  zotDb: ['Zotero: direct database access', 'https://www.zotero.org/support/dev/client_coding/direct_sqlite_database_access'],
  arxiv: ['arXiv API user manual', 'https://info.arxiv.org/help/api/user-manual.html'],
  openalex: ['OpenAlex developer documentation', 'https://developers.openalex.org'],
  remotion: ['Remotion documentation', 'https://www.remotion.dev/docs'],
  manim: ['Manim Community (GitHub)', 'https://github.com/ManimCommunity/manim'],
  skills: ['Claude Code skills', 'https://code.claude.com/docs/en/skills'],
  eisen: ['The Eisenhower matrix (Asana)', 'https://asana.com/resources/eisenhower-matrix']
};

const ITEMS = [
  /* ---------------- Data ---------------- */
  {
    id: 'ebooks', name: 'Ebooks', cat: 'Data',
    tag: 'Your book library, read from Calibre into one index.',
    about: [
      ['What it is', 'Calibre is an ebook manager. It keeps the list of your books in one database file. The Desktop Manager reads that list and copies the details of each book into its own library index.'],
      ['Data flow', 'It gets the book list from Calibre, and it only reads it. Calibre says to make changes only through its own program. It gives books to the index, and the index gives them to the text skill.']
    ],
    ex: [
      { type: 'block', title: 'Where the book data goes', why: 'Data moves in one direction. The index never writes into the Calibre file, so your library stays safe.',
        d: { nodes: [['ca', 52, 110, 'Calibre\nlibrary', 'step', 1, 76, 34], ['ix', 180, 110, 'Library\nindex', 'step', 2, 80, 34], ['tx', 292, 110, 'Text\nskill', 'step', 6, 76, 34]],
          edges: [['ca', 'ix', 'read only', null, [115, 98]], ['ix', 'tx']] } }
    ],
    links: [SRC.calibre]
  },
  {
    id: 'papers', name: 'Papers', cat: 'Data',
    tag: 'Research papers from Zotero and from the arXiv and OpenAlex services.',
    about: [
      ['What it is', 'Zotero is a manager for papers on your computer. arXiv and OpenAlex are web services that list research papers. A skill, a saved set of instructions that Claude follows, asks them for new papers on a topic.'],
      ['Data flow', 'It gets papers from the web services, and from Zotero through its local API (a way for programs to ask Zotero for data). It gives new papers to the library index. The arXiv API asks for one request each three seconds.']
    ],
    ex: [
      { type: 'sequence', title: 'Fetch new papers on one topic', why: 'The skill checks for copies before it saves. Only new papers go into the index.',
        d: { actors: ['Skill', 'arXiv API', 'Index'], msgs: [[0, 1, 'Search a topic'], [1, 0, 'Paper list', 1], [0, 2, 'Check for copies'], [2, 0, 'New ones', 1], [0, 2, 'Save new papers']] } }
    ],
    links: [SRC.zotLocal, SRC.zotDb, SRC.arxiv, SRC.openalex]
  },
  {
    id: 'find-and-index', name: 'Find, categorize and index (skill)', cat: 'Data',
    tag: 'One skill finds books and papers, puts them in categories, and makes them searchable.',
    about: [
      ['What it is', 'An index is a list that points from a word to the files that contain it. SQLite, a database in one file, has a word index called FTS5. An add-on, sqlite-vec, can later add search by meaning.'],
      ['Data flow', 'It gets new files from Ebooks and Papers. It gives a search to all the other branches. Start with word search only, and add meaning search if word search does not find enough.']
    ],
    ex: [
      { type: 'flowchart', title: 'From a new file to a search', why: 'Each new file goes through the same steps. Then every branch can search it.',
        d: { nodes: [['s', 52, 40, 'New file', 'start', 1, 76, 26], ['t', 165, 40, 'Get the\ntext', 'step', 1, 80, 32], ['c', 285, 40, 'Add a\ncategory', 'step', 1, 84, 32],
          ['w', 285, 120, 'Word\nindex', 'step', 2, 84, 32], ['q', 285, 196, 'Search', 'end', 3, 76, 24]],
          edges: [['s', 't'], ['t', 'c'], ['c', 'w'], ['w', 'q']] } }
    ],
    links: [SRC.fts5, SRC.vec]
  },

  /* ---------------- Idea organizer ---------------- */
  {
    id: 'input-tracker', name: 'Input tracker (skill)', cat: 'Idea organizer',
    tag: 'Sort, weigh importance, clean up: three steps for each new idea.',
    about: [
      ['What it is', 'The input tracker is a skill that takes each new note. It sorts the note with tags, gives it a score for importance, and cleans up the list. Clean up asks you a few questions about the idea, and then saves it in the database.'],
      ['Data flow', 'It gets notes from you, and it can link a note to a book or paper in the index. It gives scored ideas to the Project organizer. To weigh importance, a simple method is the urgent and important grid (the Eisenhower matrix).']
    ],
    ex: [
      { type: 'flowchart', title: 'The steps for one new idea', why: 'The first check stops copies. Only a new idea goes on to sort, weigh and clean up.',
        d: { nodes: [['s', 170, 18, 'New idea', 'start'], ['d', 170, 68, 'Same as an\nold idea?', 'dec'], ['m', 50, 68, 'Merge with\nold idea', 'step', 5, 84, 32],
          ['so', 170, 124, 'Sort: add\ntags', 'step', 5], ['w', 170, 178, 'Weigh: give\na score', 'step', 5], ['c', 292, 178, 'Clean up', 'end', 3, 76, 26]],
          edges: [['s', 'd'], ['d', 'm', 'Yes'], ['d', 'so', 'No'], ['so', 'w'], ['w', 'c']] } }
    ],
    links: [SRC.eisen]
  },
  {
    id: 'skill-organizer', name: 'Skill organizer', cat: 'Idea organizer',
    tag: 'The list of all skills, and the branch that owns each one.',
    about: [
      ['What it is', 'A skill is a folder with a text of instructions that Claude follows. The skill organizer keeps the list of skills, with a short description of each one.'],
      ['Data flow', 'It gets a new entry each time you make a skill. It gives the hub the descriptions, so the hub can choose the correct skill for a request. Claude always reads these descriptions, so keep them clear.']
    ],
    ex: [
      { type: 'tree', title: 'The skills from the sketch, by branch', why: 'Each skill has one owner branch. Content generation has the most skills.',
        d: { root: ['Skills', [['Data', [['Find and\nindex']]], ['Ideas', [['Input\ntracker']]], ['Projects', [['Goals']]], ['Content', [['Page'], ['Graph'], ['Video']]]]] } }
    ],
    links: [SRC.skills]
  },

  /* ---------------- Project organizer ---------------- */
  {
    id: 'goals-metrics', name: 'Track goals and metrics (skill)', cat: 'Project organizer',
    tag: 'Set a goal for each project, log the work, and review it each week.',
    about: [
      ['What it is', 'A metric is a number that you measure again and again, for example the hours on a project each week. This skill keeps a target for each metric and logs the real value.'],
      ['Data flow', 'It gets ideas with a high score from the Idea organizer, and they become projects. It gives the goals and the progress to your weekly review. Choose one or two metrics for each project.']
    ],
    ex: [
      { type: 'cycle', title: 'The goal loop', why: 'The review is the step that matters. Without it, the log is only a list of numbers.',
        d: { items: ['Set a\ngoal', 'Log\nwork', 'Weekly\nreview', 'Adjust\nthe goal'], center: 'Goal loop' } }
    ]
  },
  {
    id: 'recently-worked-on', name: 'Recently worked on', cat: 'Project organizer',
    tag: 'A list of your latest work, made from the dates when files changed.',
    about: [
      ['What it is', 'This list shows the projects that you worked on last. You do not type anything. The computer already keeps the date when each file changed.'],
      ['Data flow', 'It gets the file dates from each project folder. It gives you a short list, so you can continue where you stopped.']
    ],
    ex: [
      { type: 'flowchart', title: 'How the list is made', why: 'The list comes from data that the computer already keeps. You do not log anything.',
        d: { nodes: [['a', 170, 22, 'Read the file\nchange dates', 'step', 3, 120, 32], ['b', 170, 78, 'Group by\nproject folder', 'step', 3, 120, 32],
          ['c', 170, 134, 'Sort, newest\nfirst', 'step', 3, 120, 32], ['e', 170, 192, 'Show the top 5', 'end', 3, 120, 26]],
          edges: [['a', 'b'], ['b', 'c'], ['c', 'e']] } }
    ]
  },

  /* ---------------- Content generation ---------------- */
  {
    id: 'text', name: 'Text', cat: 'Content generation',
    tag: 'One to two pages, with many references, diagrams and sources.',
    about: [
      ['What it is', 'The text is the base for all content. It is one to two pages, with many references, diagrams and sources. The page and the video both start from it.'],
      ['Data flow', 'It gets facts and sources from the Data branch, and the topic from an idea or a project. It gives the base to the page skill and to the video skill. Check each fact here one time, so every output is correct.']
    ],
    ex: [
      { type: 'flowchart', title: 'Write the text', why: 'The loop sends you back to the library until each claim has a source.',
        d: { nodes: [['q', 110, 20, 'A topic', 'start'], ['f', 110, 66, 'Find sources\n(Data)', 'step', 1, 120, 32], ['w', 110, 114, 'Write one\nto two pages', 'step', 6, 120, 32],
          ['d', 110, 168, 'Each claim\nhas a source?', 'dec', 2, 104, 44], ['e', 270, 168, 'Text', 'end', 6, 80, 26]],
          edges: [['q', 'f'], ['f', 'w'], ['w', 'd'], ['d', 'e', 'Yes'], ['d', 'f', 'No', [[58, 168], [24, 168], [24, 66], [49, 66]], [36, 160]]] } }
    ]
  },
  {
    id: 'page', name: 'Page (page skill)', cat: 'Content generation',
    tag: 'A web page with links, made from the text. The graph skill can add a map of ideas.',
    about: [
      ['What it is', 'The page skill turns the text into a web page with links to the sources. The graph skill makes a knowledge graph, a map of the ideas in the text and the links between them.'],
      ['Data flow', 'It gets the text, and it can also get a graph from the graph skill. It gives a published web page.']
    ],
    ex: [
      { type: 'block', title: 'What goes into a page', why: 'The text is the main input. The graph is an extra that shows how the ideas connect.',
        d: { nodes: [['t', 60, 60, 'Text', 'step', 6, 76, 30], ['g', 60, 160, 'Graph\nskill', 'step', 6, 76, 34], ['ps', 185, 110, 'Page\nskill', 'step', 6, 76, 34], ['wp', 292, 110, 'Web page\nwith links', 'step', 2, 84, 34]],
          edges: [['t', 'ps', null, 'hv'], ['g', 'ps', null, 'hv'], ['ps', 'wp']] } }
    ]
  },
  {
    id: 'video', name: 'Video (skill)', cat: 'Content generation',
    tag: 'A video with motion and audio, made from the text.',
    about: [
      ['What it is', 'The video skill turns the text into a video with motion and audio. Remotion makes videos with web code; it is good for text and charts. Manim makes math animations in Python.'],
      ['Data flow', 'It gets the text and its diagrams. It gives a video file. Remotion is free for one person but has a fee for larger companies.']
    ],
    ex: [
      { type: 'swimlane', title: 'Who does what for one video', why: 'You choose the text and check the result. The skill and the tool do the steps between.',
        d: { lanes: ['You', 'Video skill', 'Tool'], cols: 4, steps: [[0, 0, 'Choose\ntext'], [1, 1, 'Script,\nscenes'], [2, 2, 'Draw\nframes'], [0, 3, 'Check\nvideo']] } }
    ],
    links: [SRC.remotion, SRC.manim]
  }
];
