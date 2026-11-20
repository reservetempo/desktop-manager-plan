'use strict';
/* Content for the page. Each item has: id, name, cat (category), tag (one line),
   about ([label, text] pairs), ex (diagrams: type, title, why = caption, d = drawing data), links. */

const CAPTION = 'Key point';

/* Colours used on every diagram: 1 Data, 2 hub and store, 3 Projects, 5 Ideas, 6 Content, 4 problem. */

const SRC = {
  fts5: ['SQLite full-text search (FTS5)', 'https://sqlite.org/fts5.html'],
  vec: ['sqlite-vec, vector search for SQLite', 'https://github.com/asg017/sqlite-vec'],
  sqliteUse: ['Appropriate uses for SQLite', 'https://sqlite.org/whentouse.html'],
  calibre: ['Calibre database interface', 'https://manual.calibre-ebook.com/db_api.html'],
  zotLocal: ['Zotero local API', 'https://www.zotero.org/support/dev/web_api/v3/local_api'],
  zotDb: ['Zotero: direct database access', 'https://www.zotero.org/support/dev/client_coding/direct_sqlite_database_access'],
  arxiv: ['arXiv API user manual', 'https://info.arxiv.org/help/api/user-manual.html'],
  openalex: ['OpenAlex developer documentation', 'https://developers.openalex.org'],
  remotion: ['Remotion documentation', 'https://www.remotion.dev/docs'],
  manim: ['Manim Community (GitHub)', 'https://github.com/ManimCommunity/manim'],
  obsidian: ['Obsidian: note properties', 'https://obsidian.md/help/properties'],
  skills: ['Claude Code skills', 'https://code.claude.com/docs/en/skills'],
  skillBest: ['Skill writing best practices', 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices'],
  eisen: ['The Eisenhower matrix (Asana)', 'https://asana.com/resources/eisenhower-matrix']
};

const ITEMS = [
  /* ---------------- The whole map ---------------- */
  {
    id: 'the-hub', name: 'The hub and its four branches', cat: 'The whole map',
    tag: 'One entry point sends each request to Ideas, Projects, Data or Content.',
    about: [
      ['What it is', 'The Desktop Manager is the hub, the one place where you start each request. It does not do the work itself. It sends each request to one of four branches: Ideas, Projects, Data and Content.'],
      ['Design choice', 'The sketch does not show where the data lives. This plan adds one shared store under all four branches. Then a paper in Data can feed an idea, a project and a page with no copies.']
    ],
    ex: [
      { type: 'block', title: 'The plan: a hub, four branches, one store', why: 'The hub only routes requests. All branches read and write the same store, so data moves between branches through the store.',
        d: { nodes: [['h', 170, 28, 'Desktop\nManager', 'step', 2, 92, 34],
          ['i', 42, 106, 'Ideas', 'step', 5, 66, 30], ['p', 126, 106, 'Projects', 'step', 3, 66, 30],
          ['d', 214, 106, 'Data', 'step', 1, 66, 30], ['c', 298, 106, 'Content', 'step', 6, 66, 30],
          ['s', 170, 186, 'Shared\nstore', 'step', 2, 100, 30]],
          edges: [['h', 'i', null, 'hv'], ['h', 'c', null, 'hv'], ['h', 'p', null, [[126, 45], [126, 90]]], ['h', 'd', null, [[214, 45], [214, 90]]],
            ['i', 's', null, 'vh'], ['c', 's', null, 'vh'], ['p', 's', null, [[126, 121], [126, 170]]], ['d', 's', null, [[214, 121], [214, 170]]]] } },
      { type: 'mind-map', title: 'The sketch as a mind map', why: 'Each branch of the sketch has two main parts. The mind map shows the topics, but not how data moves between them.',
        d: { center: 'Desktop\nManager', branches: [['Projects', ['Goals', 'Recent work']], ['Ideas', ['Input tracker', 'Skill list']], ['Data', ['Ebooks', 'Papers']], ['Content', ['Text', 'Page, video']]] } },
      { type: 'sequence', title: 'One request from start to end', why: 'You speak only to the hub. The branch skill does the work and saves the result in the store.',
        d: { actors: ['You', 'Hub', 'Branch skill', 'Store'], msgs: [[0, 1, 'Add this paper'], [1, 2, 'Send to Data'], [2, 3, 'Save record'], [3, 2, 'Record id', 1], [2, 0, 'Done: paper saved', 1]] } }
    ]
  },
  {
    id: 'main-flow', name: 'The main data flow', cat: 'The whole map',
    tag: 'Sources become ideas, ideas become projects, projects become content.',
    about: [
      ['What it is', 'Data in the system moves in one main direction. Sources (books and papers) give ideas. Good ideas become projects. Projects make content, and new content gives new ideas.'],
      ['Why it matters', 'If you know the direction of the flow, you know the build order. A branch at the start of the flow must exist before the branches that use its data.']
    ],
    ex: [
      { type: 'cycle', title: 'The loop that the system repeats', why: 'The flow has no end. Each finished page or video gives new questions, and these go back in as new inputs.',
        d: { items: ['Collect\nsources', 'Capture\nideas', 'Sort and\nweigh', 'Work on\nprojects', 'Make\ncontent'], center: 'One loop' } },
      { type: 'flowchart', title: 'Where does a new input go?', why: 'Two questions send each input to the correct branch. Everything that is not a source or a task starts as an idea.',
        d: { nodes: [['s', 70, 22, 'New input', 'start'], ['d1', 70, 80, 'Book or\npaper?', 'dec'], ['r1', 240, 80, 'Data library', 'step', 1, 100, 30],
          ['d2', 70, 148, 'Goal or\ndate?', 'dec'], ['r2', 240, 148, 'Projects', 'step', 3, 100, 30], ['r3', 70, 202, 'Ideas', 'end', 5, 80, 24]],
          edges: [['s', 'd1'], ['d1', 'r1', 'Yes'], ['d1', 'd2', 'No'], ['d2', 'r2', 'Yes'], ['d2', 'r3', 'No']] } },
      { type: 'swimlane', title: 'Who does each step', why: 'You start and finish the loop. Skills do the sorting and the drafts. The store only keeps records.',
        d: { lanes: ['You', 'Skills', 'Store'], cols: 5, steps: [[0, 0, 'Drop in\na note'], [1, 1, 'Sort\nand tag'], [2, 2, 'Save\nrecord'], [1, 3, 'Draft\ntext'], [0, 4, 'Check\nand post']] } }
    ]
  },

  /* ---------------- Idea pipeline ---------------- */
  {
    id: 'input-tracker', name: 'Input tracker: sort, weigh, clean up', cat: 'Idea pipeline',
    tag: 'Three steps turn a loose note into a scored idea record.',
    about: [
      ['What it is', 'The input tracker is a skill, a saved set of instructions that Claude follows. It takes each new note and does three steps from the sketch: sort, weigh importance, and clean up.'],
      ['Design choice', 'Clean up can be a database rule or a short debate. The debate asks you a few questions about the idea. It is slower, but it keeps only ideas that you can explain.']
    ],
    ex: [
      { type: 'flowchart', title: 'The steps for one new idea', why: 'The first check stops copies. Only a new idea goes on to sort, weigh and clean up.',
        d: { nodes: [['s', 170, 18, 'New idea', 'start'], ['d', 170, 68, 'Same as an\nold idea?', 'dec'], ['m', 50, 68, 'Merge with\nold idea', 'step', 5, 84, 32],
          ['so', 170, 124, 'Sort: add\ntags', 'step', 5], ['w', 170, 178, 'Weigh: give\na score', 'step', 5], ['c', 292, 178, 'Clean up', 'end', 3, 76, 26]],
          edges: [['s', 'd'], ['d', 'm', 'Yes'], ['d', 'so', 'No'], ['so', 'w'], ['w', 'c']] } },
      { type: 'state', title: 'The life of one idea record', why: 'The score decides if an idea stays. A kept idea goes to the archive when it is done or old, so it is never lost.',
        d: { states: [['n', 60, 60, 'New', 1], ['so', 190, 40, 'Sorted', 5], ['sc', 290, 110, 'Scored', 2], ['k', 190, 180, 'Kept', 3], ['a', 60, 170, 'Archived', 4]],
          trans: [['n', 'so', 'tag'], ['so', 'sc', 'weigh'], ['sc', 'k', 'high score'], ['sc', 'a', 'low score'], ['k', 'a', 'done or old']], init: [60, 20, 'n'] } },
      { type: 'sequence', title: 'Clean up as a short debate', why: 'The tracker asks before it saves. Your answers go into the record with the score.',
        d: { actors: ['You', 'Tracker', 'Store'], msgs: [[0, 1, 'New idea'], [1, 0, 'Three questions'], [0, 1, 'Answers'], [1, 2, 'Save with score'], [2, 1, 'Saved', 1]] } }
    ],
    links: [SRC.skills]
  },
  {
    id: 'weigh-importance', name: 'Weigh importance', cat: 'Idea pipeline',
    tag: 'Three ways to give an idea a score, and what each one costs.',
    about: [
      ['What it is', 'To weigh an idea is to give it a score, so the list has an order. The Eisenhower matrix is a common method: it puts each task on two scales, urgent and important.'],
      ['Design choice', 'A grid is quick but rough. A number score is easy for a skill to calculate. A debate is slow but shows why. You can use the grid first and keep the debate for the top ideas.']
    ],
    ex: [
      { type: 'quadrant', title: 'Example ideas on the urgent and important grid', why: 'Each area gives an action. Important ideas that are not urgent go into a plan, not into today.',
        d: { xl: 'Urgent', yl: 'Important', q: ['Plan it', 'Do now', 'Drop it', 'Do it fast'],
          pts: [[.32, .7, 'Video skill'], [.72, .66, 'Fix the index'], [.7, .32, 'Rename files'], [.3, .3, 'New logo']] } },
      { type: 'radar', title: 'Three ways to weigh ideas (my judgement, 0 to 5)', why: 'No method wins on all points. The debate is the only one that records why an idea is important.',
        d: { axes: ['Fast', 'Clear', 'Fair', 'Easy to\nautomate', 'Shows why'], max: 5,
          series: [{ name: 'Grid', vals: [5, 4, 3, 4, 2], c: 1 }, { name: 'Number', vals: [4, 3, 4, 5, 2], c: 2 }, { name: 'Debate', vals: [1, 4, 5, 2, 5], c: 5 }] } }
    ],
    links: [SRC.eisen]
  },
  {
    id: 'skill-organizer', name: 'Skill organizer', cat: 'Idea pipeline',
    tag: 'A list of every skill, grouped by the branch that owns it.',
    about: [
      ['What it is', 'A skill is a folder with a SKILL.md file, a text of instructions that Claude follows. The skill organizer keeps the list of skills, and the branch that owns each one.'],
      ['Why it matters', 'Claude always reads the name and the description of each skill. It reads the full text only when it uses the skill. So a clear description decides if the correct skill runs.']
    ],
    ex: [
      { type: 'tree', title: 'The skills from the sketch, by branch', why: 'Each skill has one owner. Content has the most skills, so it needs the clearest descriptions.',
        d: { root: ['Skills', [['Ideas', [['Input\ntracker']]], ['Projects', [['Goals']]], ['Data', [['Find and\nindex']]], ['Content', [['Page'], ['Graph'], ['Video']]]]] } },
      { type: 'pyramid', title: 'How much of a skill Claude reads', why: 'The short description is always loaded for all skills. The extra files load only when a step needs them.',
        d: { levels: ['Extra files', 'Main text', 'Name and description'], notes: ['Only if needed', 'When it runs', 'Always loaded'] } }
    ],
    links: [SRC.skills, SRC.skillBest]
  },

  /* ---------------- Data library ---------------- */
  {
    id: 'library-sources', name: 'Sources for ebooks and papers', cat: 'Data library',
    tag: 'Calibre, Zotero and the arXiv and OpenAlex services feed one library index.',
    about: [
      ['What it is', 'Calibre is an ebook manager. It keeps its list of books in one database file. Zotero is a manager for papers, and it has a local API, a way for programs on your computer to ask it for data. arXiv and OpenAlex are web services that list research papers.'],
      ['Limit', 'Both Calibre and Zotero say: read their database files only, and write through their own interface. Zotero locks its file while it runs. The arXiv API asks for one request each three seconds.']
    ],
    ex: [
      { type: 'block', title: 'Three sources, one library index', why: 'The index reads from each source. It never writes into the Calibre or Zotero files, so these stay safe.',
        d: { nodes: [['ca', 58, 40, 'Calibre\n(ebooks)', 'step', 1, 84, 32], ['zo', 58, 110, 'Zotero\n(papers)', 'step', 1, 84, 32], ['ax', 58, 180, 'arXiv and\nOpenAlex', 'step', 1, 84, 32],
          ['ix', 192, 110, 'Library\nindex', 'step', 2, 76, 36], ['sk', 296, 110, 'Skills', 'step', 6, 64, 30]],
          edges: [['ca', 'ix', 'read only', 'hv', [148, 32]], ['zo', 'ix', 'local API', null, [125, 102]], ['ax', 'ix', 'web API', 'hv', [148, 172]], ['ix', 'sk']] } },
      { type: 'sequence', title: 'Fetch new papers on one topic', why: 'The skill checks for copies before it saves. Only new papers go into the index.',
        d: { actors: ['Skill', 'arXiv API', 'Index'], msgs: [[0, 1, 'Search a topic'], [1, 0, 'Paper list', 1], [0, 2, 'Check for copies'], [2, 0, 'New ones', 1], [0, 2, 'Save new papers']] } },
      { type: 'heat-map', title: 'What each source gives (my judgement, 0 to 3)', why: 'No source gives everything. The local tools hold your files; the web services find new papers.',
        d: { c: 1, show: 1, lw: 58, rows: ['Calibre', 'Zotero', 'arXiv API', 'OpenAlex'], cols: ['Free', 'Local', 'Full text', 'Details', 'Writes'],
          vals: [[3, 3, 3, 2, 1], [3, 3, 2, 3, 2], [3, 0, 3, 2, 0], [2, 0, 1, 3, 0]] } }
    ],
    links: [SRC.calibre, SRC.zotLocal, SRC.zotDb, SRC.arxiv, SRC.openalex]
  },
  {
    id: 'index-search', name: 'Categorize and index', cat: 'Data library',
    tag: 'Word search finds exact names. Meaning search finds the same idea in other words.',
    about: [
      ['What it is', 'An index is a list that points from a word or an idea to the files that contain it. SQLite, a database in one file, has a word index called FTS5. An add-on called sqlite-vec adds a meaning index, which uses vectors (lists of numbers that stand for the meaning of a text).'],
      ['Design choice', 'Word search is simple and exact. Meaning search finds related texts, but it needs a model to make the vectors, and sqlite-vec is not yet at version 1. Start with words and add meaning later.']
    ],
    ex: [
      { type: 'flowchart', title: 'From a new file to a search', why: 'The text is split into small parts before it goes into the indexes. Both indexes then answer the same search.',
        d: { nodes: [['s', 52, 40, 'New file', 'start', 1, 76, 26], ['t', 162, 40, 'Get the\ntext', 'step', 1, 80, 32], ['sp', 280, 40, 'Split into\nparts', 'step', 1, 84, 32],
          ['w', 150, 150, 'Word\nindex', 'step', 2, 80, 32], ['m', 280, 150, 'Meaning\nindex', 'step', 5, 80, 32], ['q', 215, 202, 'Search', 'end', 3, 70, 24]],
          edges: [['s', 't'], ['t', 'sp'], ['sp', 'm'], ['sp', 'w', null, [[256, 56], [256, 100], [150, 100], [150, 133]]], ['w', 'q', null, 'vh'], ['m', 'q', null, 'vh']] } },
      { type: 'venn', title: 'What each search finds', why: 'The two searches overlap only in part. Names and codes need words; related ideas need meaning.',
        d: { sets: ['Word search', 'Meaning search'], only: ['Exact names\nCodes, ids', 'Same idea,\nother words'], both: 'Common\ntopics' } }
    ],
    links: [SRC.fts5, SRC.vec]
  },

  /* ---------------- Project tracking ---------------- */
  {
    id: 'projects-recent', name: 'Project organizer and recent work', cat: 'Project tracking',
    tag: 'Each project has a status, and the file dates show what you worked on last.',
    about: [
      ['What it is', 'The project organizer keeps one record for each project: its folder, its status and its goals. The "recently worked on" list needs no typing. It reads the dates when files changed.'],
      ['Design choice', 'You can set the status by hand, or let the file dates suggest it. For example, no change in 30 days can suggest "Paused". The suggestion is safer than an automatic change.']
    ],
    ex: [
      { type: 'state', title: 'The status of one project', why: 'A project can go between Active and Paused many times. Only Active projects show in the main list.',
        d: { states: [['i', 60, 60, 'Idea', 5], ['a', 190, 60, 'Active', 3], ['p', 190, 172, 'Paused', 2], ['d', 296, 60, 'Done', 1]],
          trans: [['i', 'a', 'start'], ['a', 'p', 'pause', 6], ['p', 'a', 'resume', 6], ['a', 'd', 'finish']], init: [60, 20, 'i'] } },
      { type: 'flowchart', title: 'How the "recent work" list is made', why: 'The list comes from data that the computer already keeps. You do not log anything.',
        d: { nodes: [['a', 170, 22, 'Read the file\nchange dates', 'step', 3, 120, 32], ['b', 170, 78, 'Group by\nproject folder', 'step', 3, 120, 32],
          ['c', 170, 134, 'Sort, newest\nfirst', 'step', 3, 120, 32], ['e', 170, 192, 'Show the top 5', 'end', 3, 120, 26]],
          edges: [['a', 'b'], ['b', 'c'], ['c', 'e']] } }
    ]
  },
  {
    id: 'goals-metrics', name: 'Goals and metrics', cat: 'Project tracking',
    tag: 'A skill that logs work and compares it with a target each week.',
    about: [
      ['What it is', 'A metric is a number that you measure again and again, for example the hours on a project each week. The goals skill keeps a target for each metric and logs the real value.'],
      ['Limit', 'A metric that is easy to count is not always the one that matters. Choose one or two metrics for each project, and change them at the review if they do not help.']
    ],
    ex: [
      { type: 'cycle', title: 'The goal loop', why: 'The review is the step that matters. Without it, the log is only a list of numbers.',
        d: { items: ['Set a\ngoal', 'Log\nwork', 'Weekly\nreview', 'Adjust\nthe goal'], center: 'Goal loop' } },
      { type: 'line', title: 'Hours on one project each week (example values)', why: 'The dashed line is the target. The line shows the trend, which one week alone does not show.',
        d: { x: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], series: [{ name: 'Hours', vals: [3, 5, 4, 6, 7, 5, 8, 9], c: 3 }], max: 10, step: 2, limit: [6, 'Target'] } }
    ]
  },

  /* ---------------- Content pipeline ---------------- */
  {
    id: 'text-base', name: 'The text base', cat: 'Content pipeline',
    tag: 'One to two pages with sources and diagrams. Every other output starts here.',
    about: [
      ['What it is', 'The text base is the first output of the content branch: one to two pages, with many references, diagrams and sources. The page skill, the graph skill and the video skill all start from it.'],
      ['Why it matters', 'If each fact is checked one time in the text base, the page and the video get correct facts with no extra work. A mistake in the text base goes into every output.']
    ],
    ex: [
      { type: 'flowchart', title: 'Write a text base', why: 'The loop sends you back to the library until each claim has a source.',
        d: { nodes: [['q', 110, 20, 'A question', 'start'], ['f', 110, 66, 'Find sources\n(Data library)', 'step', 1, 120, 32], ['w', 110, 114, 'Write one\nto two pages', 'step', 6, 120, 32],
          ['d', 110, 168, 'Each claim\nhas a source?', 'dec', 2, 104, 44], ['e', 270, 168, 'Text base', 'end', 6, 90, 26]],
          edges: [['q', 'f'], ['f', 'w'], ['w', 'd'], ['d', 'e', 'Yes'], ['d', 'f', 'No', [[58, 168], [24, 168], [24, 66], [49, 66]], [36, 160]]] } },
      { type: 'tree', title: 'One text base, three outputs', why: 'Each output adds its own parts. The facts come only from the text base.',
        d: { root: ['Text base', [['Page', [['Links'], ['Diagrams']]], ['Graph', [['Nodes and\nlinks']]], ['Video', [['Motion'], ['Audio']]]]] } }
    ]
  },
  {
    id: 'outputs', name: 'Page, graph and video', cat: 'Content pipeline',
    tag: 'Three skills turn the text base into a web page, a graph or a video.',
    about: [
      ['What it is', 'The page skill makes a web page with links. The graph skill makes a knowledge graph, a map of the ideas and their links. The video skill adds motion and audio. Remotion (videos made with web code) and Manim (math animation in Python) are two tools for this skill.'],
      ['Design choice', 'Remotion is good for text, charts and web styles. Manim is good for math shapes. Remotion is free for one person but has a fee for larger companies.']
    ],
    ex: [
      { type: 'radar', title: 'Two video tools (my judgement, 0 to 5)', why: 'The shapes are almost opposite. Choose by the content: charts and text, or math shapes.',
        d: { axes: ['Math', 'Web\nstyles', 'Charts', 'Free for\nyou', 'Live\npreview'], max: 5,
          series: [{ name: 'Remotion', vals: [2, 5, 4, 5, 5], c: 6 }, { name: 'Manim', vals: [5, 1, 3, 5, 3], c: 5 }] } },
      { type: 'swimlane', title: 'Who does what for one video', why: 'You choose the text and check the result. The skill and the tool do the steps between.',
        d: { lanes: ['You', 'Video skill', 'Tool'], cols: 4, steps: [[0, 0, 'Choose\ntext'], [1, 1, 'Script,\nscenes'], [2, 2, 'Draw\nframes'], [0, 3, 'Check\nvideo']] } }
    ],
    links: [SRC.remotion, SRC.manim]
  },

  /* ---------------- Shared data model ---------------- */
  {
    id: 'record-types', name: 'Four record types', cat: 'Shared data model',
    tag: 'Source, idea, project and output, and the links between them.',
    about: [
      ['What it is', 'A record is one entry in the store, for example one paper. The plan needs four types of record: source, idea, project and output. The links between them carry the data flow.'],
      ['Why it matters', 'With links, you can ask which papers a video used. Without them, each branch keeps its own copy, and the copies go out of date.']
    ],
    ex: [
      { type: 'er', title: 'The records and their links', why: 'N means "many". One idea can cite many sources, and one source can feed many ideas.',
        d: { ents: [[60, 46, 'Source', ['id', 'title', 'file'], 1], [280, 46, 'Idea', ['id', 'text', 'score'], 5], [280, 172, 'Project', ['id', 'folder', 'status'], 3], [60, 172, 'Output', ['id', 'kind', 'link'], 6]],
          rels: [[1, 0, 'N', 'M', 'cites'], [1, 2, 'N', '1', 'feeds'], [2, 3, '1', 'N', 'makes'], [3, 0, 'N', 'M', 'cites']] } },
      { type: 'tree', title: 'Where the files can live', why: 'One top folder holds all branches. The store is one file next to the folders that it points to.',
        d: { mono: 1, root: ['manager/', [['library/', [['books/'], ['papers/']]], ['ideas/'], ['projects/'], ['content/'], ['store.db']]] } }
    ]
  },
  {
    id: 'storage-options', name: 'One database, plain files, or both', cat: 'Shared data model',
    tag: 'The main design decision: where the true copy of each record lives.',
    about: [
      ['What it is', 'There are three options. One SQLite file holds all records. Or each record is a Markdown file (plain text) with properties at the top, as Obsidian does. Or the files are the true copy and SQLite is only an index.'],
      ['Design choice', 'The third option is the most work to build. It keeps records easy to read and to edit by hand, and it still gives fast search. If the index breaks, you build it again from the files.']
    ],
    ex: [
      { type: 'radar', title: 'Three storage options (my judgement, 0 to 5)', why: 'Files plus an index is strong on most points. Its weak point is the work to build it.',
        d: { axes: ['Readable', 'Fast\nsearch', 'Safe\nedits', 'Easy\nbackup', 'Easy to\nbuild'], max: 5,
          series: [{ name: 'One SQLite file', vals: [1, 5, 4, 5, 4], c: 2 }, { name: 'Markdown files', vals: [5, 2, 3, 4, 5], c: 6 }, { name: 'Files + index', vals: [5, 5, 4, 4, 2], c: 3 }] } },
      { type: 'venn', title: 'What SQLite and Markdown files each give', why: 'The two options share the most important point: all data stays on your computer.',
        d: { sets: ['SQLite file', 'Markdown files'], only: ['Fast queries\nOne file', 'Any editor\nEasy to read'], both: 'Local,\nno server' } },
      { type: 'block', title: 'The third option: files plus an index', why: 'Data goes in one direction only. The index is a copy that a script makes from the files.',
        d: { nodes: [['md', 62, 60, 'Markdown\nnotes', 'step', 5, 84, 32], ['pdf', 62, 160, 'Books and\npapers', 'step', 1, 84, 32],
          ['ix', 178, 110, 'Indexer', 'step', 2, 72, 30], ['db', 290, 110, 'SQLite\nindex', 'step', 2, 76, 32]],
          edges: [['md', 'ix', null, 'hv'], ['pdf', 'ix', null, 'hv'], ['ix', 'db']] } }
    ],
    links: [SRC.obsidian, SRC.sqliteUse]
  },

  /* ---------------- Build order ---------------- */
  {
    id: 'build-phases', name: 'Build in layers', cat: 'Build order',
    tag: 'Build the store first, then the branches that fill it, then the ones that use it.',
    about: [
      ['What it is', 'Each branch uses data from the branch before it in the flow. So the build order follows the flow: the store, then the data library, then ideas and projects, then content.'],
      ['Common error', 'It is easy to start with the video skill, because it is the most fun. But with no library and no text base, it has no facts to show.']
    ],
    ex: [
      { type: 'pyramid', title: 'Each layer needs the layer below', why: 'Content is at the top because it uses all the other layers.',
        d: { levels: ['Content', 'Ideas, projects', 'Data library', 'Shared store'], notes: ['Uses all below', 'Use the data', 'Fills the store', 'Build first'] } },
      { type: 'gantt', title: 'An example plan of eight weeks', why: 'The phases overlap a little. Each one starts when the one before it can give real data.',
        d: { units: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], tasks: [['Shared store', 0, 1, 2], ['Data library', 1, 3, 1], ['Input tracker', 2, 4, 5], ['Projects', 3, 5, 3], ['Text skill', 4, 6, 6], ['Page and video', 6, 8, 6]] } }
    ]
  },
  {
    id: 'first-slice', name: 'The first full path', cat: 'Build order',
    tag: 'Test one path through all branches before you make any branch large.',
    about: [
      ['What it is', 'A first full path is a small test that goes through all the branches one time: one paper, one idea, one short text. Each part can be very simple.'],
      ['Why it matters', 'The test shows the problems between the branches early, for example a missing link from an idea to its source. These problems are the hardest to fix later.']
    ],
    ex: [
      { type: 'sequence', title: 'One paper to one text', why: 'Each branch speaks to the next through records, not through copies of files.',
        d: { actors: ['You', 'Data', 'Ideas', 'Content'], msgs: [[0, 1, 'Add a paper'], [0, 2, 'Note an idea'], [2, 1, 'Link the paper'], [0, 3, 'Write text'], [3, 1, 'Get sources'], [1, 3, 'Sources', 1]] } },
      { type: 'flowchart', title: 'Is the first path done?', why: 'Two checks are enough. If the text cannot find its source, the links in the store are wrong.',
        d: { nodes: [['s', 80, 24, 'Run the path', 'start', 3, 96, 26], ['d1', 80, 88, 'Text cites\nthe paper?', 'dec'], ['f1', 250, 88, 'Fix the links', 'step', 4, 100, 30],
          ['d2', 80, 158, 'Hub found the\nbranch?', 'dec', 2, 108, 44], ['f2', 250, 158, 'Fix routing', 'step', 4, 100, 30], ['e', 80, 206, 'Done', 'end', 3, 70, 22]],
          edges: [['s', 'd1'], ['d1', 'f1', 'No'], ['d1', 'd2', 'Yes'], ['d2', 'f2', 'No'], ['d2', 'e', 'Yes']] } }
    ]
  },

  /* ---------------- Risks and open questions ---------------- */
  {
    id: 'risks', name: 'What can go wrong', cat: 'Risks and open questions',
    tag: 'The main risk is not a crash. It is a system that you stop using.',
    about: [
      ['What it is', 'Most personal systems fail slowly. The index goes out of date, the idea list gets too long, or there are too many skills to remember.'],
      ['Example', 'Zotero locks its database while it runs, and the Calibre database format can change between versions. A skill that reads these files directly can stop with no warning.']
    ],
    ex: [
      { type: 'fishbone', title: 'Possible causes: the system is not used', why: 'Only half the causes are technical. The habits branch needs a weekly review, not code.',
        d: { effect: 'System\nnot used', cats: [['Data', ['Old index', 'Copies']], ['Skills', ['Too many', 'Overlap']], ['Tools', ['Locked files', 'New formats']], ['Habits', ['No review', 'Ideas pile up']]] } },
      { type: 'quadrant', title: 'Risks by chance and harm (my judgement)', why: 'An old index is likely and harmful, so act on it first: rebuild it on a schedule.',
        d: { xl: 'Chance', yl: 'Harm', q: ['Watch', 'Act now', 'Accept', 'Reduce'], pts: [[.7, .68, 'Old index'], [.32, .66, 'Lost data'], [.82, .3, 'Too many skills'], [.22, .3, 'Tool change']] } }
    ],
    links: [SRC.zotDb, SRC.calibre]
  },
  {
    id: 'open-questions', name: 'Decisions to make first', cat: 'Risks and open questions',
    tag: 'Two answers decide most of the design.',
    about: [
      ['What it is', 'Two questions decide the shape of the store. Do you edit records by hand? Do you need search by meaning? Answer them before you build the first branch.'],
      ['Why it matters', 'These choices are hard to change later. All branches read and write the store, so a change to the store changes every skill.']
    ],
    ex: [
      { type: 'flowchart', title: 'Two questions that choose the store', why: 'If you edit records by hand, keep files as the true copy. Add meaning search only if word search fails you.',
        d: { nodes: [['d1', 170, 30, 'Edit records\nby hand?', 'dec', 2, 108, 44], ['a', 50, 30, 'One SQLite\nfile', 'step', 2, 80, 32], ['b', 290, 30, 'Files and\nan index', 'step', 3, 80, 32],
          ['d2', 170, 112, 'Search by\nmeaning?', 'dec', 2, 108, 44], ['c', 70, 192, 'Words only', 'end', 1, 90, 26], ['e', 270, 192, 'Add vectors', 'end', 5, 90, 26]],
          edges: [['d1', 'a', 'No'], ['d1', 'b', 'Yes'], ['a', 'd2', null, 'vh'], ['b', 'd2', null, 'vh'], ['d2', 'c', 'No', 'vh', [150, 182]], ['d2', 'e', 'Yes', 'vh', [192, 182]]] } },
      { type: 'heat-map', title: 'How much each decision changes each branch (my judgement, 0 to 3)', why: 'The store type changes every branch, so decide it first. The debate step changes only Ideas.',
        d: { c: 2, show: 1, lw: 78, rows: ['Store type', 'Meaning search', 'Debate step'], cols: ['Ideas', 'Projects', 'Data', 'Content'],
          vals: [[3, 3, 3, 3], [1, 0, 3, 2], [3, 1, 0, 0]] } }
    ],
    links: [SRC.fts5, SRC.vec]
  }
];
