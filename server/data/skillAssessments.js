// Skill assessment catalogue. Correct answers and coding rubrics stay server-side.
// Each level has its own pool; the server randomly selects a small subset per attempt.

const base = {
  Python: {
    Beginner: [
      { id: 'py-b1', type: 'mcq', question: 'Which symbol starts a Python comment?', options: ['//', '#', '<!--', '--'], answer: 1 },
      { id: 'py-b2', type: 'mcq', question: 'Which type stores an ordered collection that can change?', options: ['tuple', 'list', 'str', 'int'], answer: 1 },
      { id: 'py-b3', type: 'mcq', question: 'Which keyword creates a loop over items?', options: ['for', 'loop', 'repeat', 'iterate'], answer: 0 },
      { id: 'py-b4', type: 'mcq', question: 'What does len([1, 2, 3]) return?', options: ['2', '3', '4', 'None'], answer: 1 },
      { id: 'py-b5', type: 'mcq', question: 'Which keyword defines a function?', options: ['func', 'def', 'function', 'method'], answer: 1 },
      { id: 'py-b6', type: 'mcq', question: 'Which value represents no value?', options: ['None', 'empty', 'null', 'void'], answer: 0 },
      { id: 'py-b7', type: 'mcq', question: 'Which syntax creates a dictionary?', options: ['[]', '()', '{}', '<>'], answer: 2 },
      { id: 'py-b8', type: 'mcq', question: 'Which operator performs floor division?', options: ['/', '//', '%', '**'], answer: 1 }
    ],
    Intermediate: [
      { id: 'py-i1', type: 'mcq', question: 'Which data type is immutable?', options: ['list', 'set', 'tuple', 'dict'], answer: 2 },
      { id: 'py-i2', type: 'mcq', question: 'What is the result of 3 // 2?', options: ['1', '1.5', '2', '0'], answer: 0 },
      { id: 'py-i3', type: 'mcq', question: 'Which construct handles exceptions?', options: ['try/except', 'if/error', 'catch/throw only', 'handle'], answer: 0 },
      { id: 'py-i4', type: 'mcq', question: 'Which is commonly used to create an isolated Python environment?', options: ['venv', 'npm', 'gradle', 'cargo'], answer: 0 },
      { id: 'py-i5', type: 'mcq', question: 'What does a list comprehension produce?', options: ['A new list', 'A tuple only', 'A class', 'A module'], answer: 0 },
      { id: 'py-i6', type: 'mcq', question: 'What does `*args` collect?', options: ['Keyword arguments', 'Positional arguments', 'Imports', 'Exceptions'], answer: 1 },
      { id: 'py-i7', type: 'mcq', question: 'Which data structure removes duplicate values?', options: ['list', 'tuple', 'set', 'string'], answer: 2 },
      { id: 'py-i8', type: 'mcq', question: 'What is a generator commonly used for?', options: ['Lazy iteration', 'CSS styling', 'Database schema creation', 'Compiling Java'], answer: 0 }
    ],
    Advanced: [
      { id: 'py-a1', type: 'mcq', question: 'Which mechanism lets a function retain access to variables from its enclosing scope?', options: ['Closure', 'Inheritance', 'Casting', 'Serialization'], answer: 0 },
      { id: 'py-a2', type: 'mcq', question: 'What does `yield` turn a function into?', options: ['A generator function', 'A class method only', 'A thread', 'A decorator'], answer: 0 },
      { id: 'py-a3', type: 'mcq', question: 'Which statement about shallow copies is correct?', options: ['Nested objects may still be shared', 'Everything is recursively copied', 'They only work on tuples', 'They always serialize data'], answer: 0 },
      { id: 'py-a4', type: 'mcq', question: 'Which approach is generally appropriate for CPU-bound parallel work in Python?', options: ['Multiprocessing', 'Only one event loop', 'CSS workers', 'SQL triggers'], answer: 0 },
      { id: 'py-a5', type: 'mcq', question: 'What is the primary purpose of a context manager?', options: ['Manage setup and cleanup around a block', 'Create HTTP routes only', 'Define a database table', 'Encrypt every variable'], answer: 0 },
      { id: 'py-a6', type: 'mcq', question: 'What does `functools.lru_cache` provide?', options: ['Memoization/caching of function results', 'Thread creation', 'Input validation only', 'Package installation'], answer: 0 },
      { id: 'py-a7', type: 'mcq', question: 'Which exception should usually be raised for an invalid argument value?', options: ['ValueError', 'KeyboardInterrupt', 'SystemExit', 'StopIteration'], answer: 0 },
      { id: 'py-a8', type: 'mcq', question: 'What does an async function return when called?', options: ['A coroutine object', 'A thread immediately', 'A database cursor', 'A generator only'], answer: 0 }
    ],
    coding: {
      Beginner: { id: 'py-cb', type: 'coding', prompt: 'Write Python code that returns the sum of a list of numbers.', starter: 'def solve(nums):\n    # return the sum\n    pass', rubric: 'sum_list' },
      Intermediate: { id: 'py-ci', type: 'coding', prompt: 'Write Python code that returns the first duplicate value in a list, or None if there is no duplicate.', starter: 'def solve(nums):\n    # return first duplicate\n    pass', rubric: 'first_duplicate' },
      Advanced: { id: 'py-ca', type: 'coding', prompt: 'Write Python code that returns the length of the longest substring without repeating characters.', starter: 'def solve(s):\n    # return longest unique substring length\n    pass', rubric: 'longest_unique' }
    }
  },
  JavaScript: {
    Beginner: [
      { id: 'js-b1', type: 'mcq', question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'global', 'define'], answer: 1 },
      { id: 'js-b2', type: 'mcq', question: 'Which method adds an item to the end of an array?', options: ['push', 'pop', 'shift', 'map'], answer: 0 },
      { id: 'js-b3', type: 'mcq', question: 'Which value represents an intentional absence of a value?', options: ['null', 'NaN', 'false', '0'], answer: 0 },
      { id: 'js-b4', type: 'mcq', question: 'Which symbol starts a single-line comment?', options: ['#', '//', '--', '<>'], answer: 1 },
      { id: 'js-b5', type: 'mcq', question: 'Which method converts JSON text to a JavaScript value?', options: ['JSON.parse', 'JSON.read', 'JSON.open', 'JSON.decodeText'], answer: 0 },
      { id: 'js-b6', type: 'mcq', question: 'Which keyword creates a constant binding?', options: ['const', 'fixed', 'static', 'final'], answer: 0 },
      { id: 'js-b7', type: 'mcq', question: 'Which operator performs strict equality?', options: ['=', '==', '===', '=>'], answer: 2 },
      { id: 'js-b8', type: 'mcq', question: 'Which value is a Boolean?', options: ['true', '"true"', '1', 'yes'], answer: 0 }
    ],
    Intermediate: [
      { id: 'js-i1', type: 'mcq', question: 'What does === compare?', options: ['Only type', 'Only value', 'Value and type', 'References only'], answer: 2 },
      { id: 'js-i2', type: 'mcq', question: 'Which method creates a new array by transforming items?', options: ['map', 'push', 'sort', 'join'], answer: 0 },
      { id: 'js-i3', type: 'mcq', question: 'Which API is commonly used for asynchronous HTTP requests?', options: ['fetch', 'print', 'scan', 'render'], answer: 0 },
      { id: 'js-i4', type: 'mcq', question: 'Which feature lets a function remember variables from its outer scope?', options: ['closure', 'hoisting only', 'prototype', 'destructuring'], answer: 0 },
      { id: 'js-i5', type: 'mcq', question: 'What does Promise.all primarily do?', options: ['Waits for multiple promises', 'Cancels promises', 'Converts promises to callbacks', 'Makes code synchronous'], answer: 0 },
      { id: 'js-i6', type: 'mcq', question: 'Which method removes the last array item?', options: ['pop', 'push', 'slice', 'shift'], answer: 0 },
      { id: 'js-i7', type: 'mcq', question: 'What does destructuring allow?', options: ['Extract values from arrays/objects', 'Compile CSS', 'Create SQL tables', 'Encrypt strings'], answer: 0 },
      { id: 'js-i8', type: 'mcq', question: 'What is an async function useful for?', options: ['Working with asynchronous operations using await', 'Changing HTML only', 'Defining CSS variables', 'Creating database indexes'], answer: 0 }
    ],
    Advanced: [
      { id: 'js-a1', type: 'mcq', question: 'What does the event loop coordinate?', options: ['Asynchronous callbacks and the call stack', 'Database schema migrations only', 'CSS compilation', 'Memory allocation only'], answer: 0 },
      { id: 'js-a2', type: 'mcq', question: 'What is a closure?', options: ['A function with access to its lexical environment', 'A closed browser tab', 'A DOM node', 'A Promise state'], answer: 0 },
      { id: 'js-a3', type: 'mcq', question: 'Which statement about `const` is correct?', options: ['The binding cannot be reassigned', 'The object is always deeply immutable', 'It is function-scoped only', 'It disables garbage collection'], answer: 0 },
      { id: 'js-a4', type: 'mcq', question: 'What does debouncing usually do?', options: ['Delays execution until rapid events settle', 'Runs every event twice', 'Caches every DOM node', 'Creates a worker thread'], answer: 0 },
      { id: 'js-a5', type: 'mcq', question: 'Which structure is commonly used for key-value lookup?', options: ['Map', 'StackTrace', 'Promise', 'EventTarget'], answer: 0 },
      { id: 'js-a6', type: 'mcq', question: 'What does optional chaining `?.` help prevent?', options: ['Errors when accessing through nullish values', 'Network failures', 'Syntax highlighting', 'Bundle splitting'], answer: 0 },
      { id: 'js-a7', type: 'mcq', question: 'What does `Array.prototype.reduce` typically produce?', options: ['A single accumulated result', 'Only a boolean', 'A Promise always', 'A DOM element'], answer: 0 },
      { id: 'js-a8', type: 'mcq', question: 'What is a common use of Web Workers?', options: ['Move CPU-heavy work off the main UI thread', 'Style React components', 'Create SQL schemas', 'Serve static files'], answer: 0 }
    ],
    coding: {
      Beginner: { id: 'js-cb', type: 'coding', prompt: 'Write JavaScript code that returns the sum of a numeric array.', starter: 'function solve(nums) {\n  // return the sum\n}', rubric: 'sum_list' },
      Intermediate: { id: 'js-ci', type: 'coding', prompt: 'Write JavaScript code that returns the first duplicate value in an array, or null if none exists.', starter: 'function solve(nums) {\n  // return first duplicate\n}', rubric: 'first_duplicate' },
      Advanced: { id: 'js-ca', type: 'coding', prompt: 'Write JavaScript code that returns the length of the longest substring without repeating characters.', starter: 'function solve(s) {\n  // return longest unique substring length\n}', rubric: 'longest_unique' }
    }
  },
  SQL: {
    Beginner: [
      { id: 'sql-b1', type: 'mcq', question: 'Which command retrieves rows?', options: ['SELECT', 'PUSH', 'GETROW', 'READTABLE'], answer: 0 },
      { id: 'sql-b2', type: 'mcq', question: 'Which clause filters rows?', options: ['WHERE', 'ORDER', 'GROUP', 'HAVING only'], answer: 0 },
      { id: 'sql-b3', type: 'mcq', question: 'Which clause sorts results?', options: ['ORDER BY', 'SORT BY', 'ARRANGE', 'SEQUENCE'], answer: 0 },
      { id: 'sql-b4', type: 'mcq', question: 'Which aggregate counts rows?', options: ['COUNT', 'ROWS', 'NUMBER', 'SIZE'], answer: 0 },
      { id: 'sql-b5', type: 'mcq', question: 'Which command adds a new row?', options: ['INSERT', 'APPENDROW', 'ADD', 'PUSH'], answer: 0 },
      { id: 'sql-b6', type: 'mcq', question: 'Which command changes existing rows?', options: ['UPDATE', 'ALTER ROW', 'CHANGE', 'EDIT'], answer: 0 },
      { id: 'sql-b7', type: 'mcq', question: 'Which command removes rows?', options: ['DELETE', 'REMOVE', 'DROP ROW', 'CLEAR'], answer: 0 },
      { id: 'sql-b8', type: 'mcq', question: 'Which keyword limits returned rows in common SQL dialects?', options: ['LIMIT', 'CAP', 'MAXROWS', 'TAKE'], answer: 0 }
    ],
    Intermediate: [
      { id: 'sql-i1', type: 'mcq', question: 'Which join keeps matching rows from both tables?', options: ['INNER JOIN', 'LEFT ONLY', 'RIGHT ONLY', 'OUTER FILTER'], answer: 0 },
      { id: 'sql-i2', type: 'mcq', question: 'Which clause groups rows before aggregation?', options: ['GROUP BY', 'ORDER BY', 'WHERE', 'LIMIT'], answer: 0 },
      { id: 'sql-i3', type: 'mcq', question: 'Which clause filters groups after aggregation?', options: ['HAVING', 'WHERE', 'GROUP', 'FILTER ROWS'], answer: 0 },
      { id: 'sql-i4', type: 'mcq', question: 'What does a primary key identify?', options: ['A row uniquely', 'A database server', 'A query plan', 'A table column type only'], answer: 0 },
      { id: 'sql-i5', type: 'mcq', question: 'What is normalization intended to reduce?', options: ['Unnecessary data redundancy', 'Query syntax', 'Indexes', 'Transactions'], answer: 0 },
      { id: 'sql-i6', type: 'mcq', question: 'Which operation combines rows from related tables?', options: ['JOIN', 'MERGE TEXT', 'LINK', 'ATTACH'], answer: 0 },
      { id: 'sql-i7', type: 'mcq', question: 'Which index generally helps equality lookups?', options: ['B-tree index', 'HTML index', 'CSS index', 'Binary file only'], answer: 0 },
      { id: 'sql-i8', type: 'mcq', question: 'What does a transaction provide?', options: ['A controlled unit of database changes', 'A frontend route', 'A CSS rule', 'A password manager'], answer: 0 }
    ],
    Advanced: [
      { id: 'sql-a1', type: 'mcq', question: 'What does an ACID transaction property guarantee about a committed transaction?', options: ['Durability', 'Automatic UI rendering', 'CSS isolation', 'Infinite rollback history'], answer: 0 },
      { id: 'sql-a2', type: 'mcq', question: 'What is a window function useful for?', options: ['Calculating across related rows without collapsing them', 'Creating tables only', 'Deleting duplicates automatically', 'Connecting to HTTP'], answer: 0 },
      { id: 'sql-a3', type: 'mcq', question: 'What is a composite index?', options: ['An index over multiple columns', 'An index on multiple databases only', 'A table with two primary keys', 'A view'], answer: 0 },
      { id: 'sql-a4', type: 'mcq', question: 'What can cause a deadlock?', options: ['Transactions waiting on locks held by each other', 'A missing SELECT', 'A slow CSS file', 'A null column alone'], answer: 0 },
      { id: 'sql-a5', type: 'mcq', question: 'Why inspect an execution plan?', options: ['To understand how the database plans to execute a query', 'To format SQL', 'To encrypt rows', 'To create user accounts'], answer: 0 },
      { id: 'sql-a6', type: 'mcq', question: 'What is a covering index?', options: ['An index containing data needed by a query', 'An index that encrypts the table', 'A backup copy', 'A foreign key'], answer: 0 },
      { id: 'sql-a7', type: 'mcq', question: 'What is a common risk of an unselective WHERE condition on a huge table?', options: ['A large scan and slower query', 'Automatic normalization', 'Guaranteed deadlock', 'Schema deletion'], answer: 0 },
      { id: 'sql-a8', type: 'mcq', question: 'Which isolation issue allows a transaction to read uncommitted data?', options: ['Dirty read', 'Deadlock', 'Lost schema', 'Phantom index'], answer: 0 }
    ],
    coding: {
      Beginner: { id: 'sql-cb', type: 'coding', prompt: 'Write SQL to return all students whose score is at least 70 from a table named students.', starter: 'SELECT ... FROM students\n-- add the filter', rubric: 'sql_filter' },
      Intermediate: { id: 'sql-ci', type: 'coding', prompt: 'Write SQL to count students in each department from students(department).', starter: 'SELECT ... FROM students\n-- group by department', rubric: 'sql_group_count' },
      Advanced: { id: 'sql-ca', type: 'coding', prompt: 'Write SQL to return each department and its average score, keeping only departments with an average of at least 70.', starter: 'SELECT ... FROM students\n-- aggregate and filter groups', rubric: 'sql_having_avg' }
    }
  }
};

// Preserve the original catalogue skills while adding richer level metadata.
const genericPools = {
  React: {
    Beginner: [
      { id: 'react-b1', type: 'mcq', question: 'Which hook stores local component state?', options: ['useState', 'useRoute', 'useServer', 'useStyle'], answer: 0 },
      { id: 'react-b2', type: 'mcq', question: 'Props are primarily used to...', options: ['Pass data into components', 'Store database rows', 'Start a server', 'Compile CSS'], answer: 0 },
      { id: 'react-b3', type: 'mcq', question: 'Which hook performs side effects?', options: ['useEffect', 'useMemo', 'useCss', 'useValue'], answer: 0 },
      { id: 'react-b4', type: 'mcq', question: 'Which syntax is commonly used to render a list?', options: ['array.map()', 'array.renderOnly()', 'loop.jsx()', 'list.sql()'], answer: 0 },
      { id: 'react-b5', type: 'mcq', question: 'What does JSX let you write?', options: ['UI markup inside JavaScript', 'SQL inside CSS', 'Python inside HTML only', 'Docker files'], answer: 0 },
      { id: 'react-b6', type: 'mcq', question: 'Which prop helps React identify list items?', options: ['key', 'style', 'name only', 'route'], answer: 0 }
    ],
    Intermediate: [
      { id: 'react-i1', type: 'mcq', question: 'Which hook stores local component state?', options: ['useState', 'useRoute', 'useServer', 'useStyle'], answer: 0 },
      { id: 'react-i2', type: 'mcq', question: 'What should usually be used as a stable list item identifier?', options: ['key', 'className', 'style', 'ref'], answer: 0 },
      { id: 'react-i3', type: 'mcq', question: 'A controlled input gets its value from...', options: ['React state/props', 'Browser cache only', 'CSS', 'URL only'], answer: 0 },
      { id: 'react-i4', type: 'mcq', question: 'What does lifting state up mean?', options: ['Moving shared state to a common ancestor', 'Deleting state', 'Using only globals', 'Moving state to CSS'], answer: 0 },
      { id: 'react-i5', type: 'mcq', question: 'Why is an effect dependency array important?', options: ['It controls when the effect re-runs', 'It styles the component', 'It creates routes', 'It changes JSX'], answer: 0 },
      { id: 'react-i6', type: 'mcq', question: 'What is a common reason to memoize a component?', options: ['Avoid unnecessary re-renders in suitable cases', 'Guarantee faster network calls', 'Replace state', 'Create CSS'], answer: 0 }
    ],
    Advanced: [
      { id: 'react-a1', type: 'mcq', question: 'What problem can a stale closure in an effect cause?', options: ['It can read outdated state/props', 'It deletes the DOM', 'It disables JSX', 'It changes SQL'], answer: 0 },
      { id: 'react-a2', type: 'mcq', question: 'What is a good use for useMemo?', options: ['Memoize an expensive derived calculation when appropriate', 'Persist data to a server automatically', 'Replace all state', 'Create a route'], answer: 0 },
      { id: 'react-a3', type: 'mcq', question: 'What is code splitting intended to improve?', options: ['Initial bundle loading by loading code on demand', 'Database integrity', 'Password hashing', 'SQL joins'], answer: 0 },
      { id: 'react-a4', type: 'mcq', question: 'What is a context provider commonly used for?', options: ['Sharing values through a component subtree', 'Creating SQL indexes', 'Starting Docker', 'Hashing passwords'], answer: 0 },
      { id: 'react-a5', type: 'mcq', question: 'Why can unstable keys be problematic?', options: ['They can cause incorrect reconciliation/state association', 'They disable CSS', 'They block HTTP', 'They encrypt props'], answer: 0 },
      { id: 'react-a6', type: 'mcq', question: 'What is hydration in an SSR React app?', options: ['Attaching React behavior to server-rendered markup', 'Compressing images', 'Creating a database', 'Running SQL'], answer: 0 }
    ]
  },
  TypeScript: {
    Beginner: [
      { id: 'ts-b1', type: 'mcq', question: 'Which type represents text?', options: ['string', 'text', 'StringValue', 'char'], answer: 0 },
      { id: 'ts-b2', type: 'mcq', question: 'Which syntax declares a type alias?', options: ['type X = ...', 'alias X = ...', 'typedef X = ...', 'shape X = ...'], answer: 0 },
      { id: 'ts-b3', type: 'mcq', question: 'Which operator forms a union type?', options: ['|', '&', '||', 'union'], answer: 0 },
      { id: 'ts-b4', type: 'mcq', question: 'Which type is commonly used for true/false?', options: ['boolean', 'boolish', 'truth', 'flag'], answer: 0 },
      { id: 'ts-b5', type: 'mcq', question: 'Which file commonly contains TypeScript configuration?', options: ['tsconfig.json', 'types.json', 'typescript.config', 'ts.settings'], answer: 0 },
      { id: 'ts-b6', type: 'mcq', question: 'Which syntax describes an array of strings?', options: ['string[]', 'string()', '[string]', 'array<string> only'], answer: 0 }
    ],
    Intermediate: [
      { id: 'ts-i1', type: 'mcq', question: 'Which syntax declares a type alias?', options: ['type X = ...', 'alias X = ...', 'typedef X = ...', 'shape X = ...'], answer: 0 },
      { id: 'ts-i2', type: 'mcq', question: 'Which operator forms a union type?', options: ['|', '&', '||', 'union'], answer: 0 },
      { id: 'ts-i3', type: 'mcq', question: 'What does an interface primarily describe?', options: ['A structural contract', 'A database connection', 'A CSS rule', 'A runtime thread'], answer: 0 },
      { id: 'ts-i4', type: 'mcq', question: 'Which option enables strict type checking in tsconfig?', options: ['strict', 'safeTypes', 'checkAll', 'typed'], answer: 0 },
      { id: 'ts-i5', type: 'mcq', question: 'Which keyword can narrow a value by checking its type at runtime?', options: ['typeof', 'typeis', 'instance', 'checktype'], answer: 0 },
      { id: 'ts-i6', type: 'mcq', question: 'Which utility type makes all properties optional?', options: ['Partial', 'Optional', 'Loose', 'Maybe'], answer: 0 }
    ],
    Advanced: [
      { id: 'ts-a1', type: 'mcq', question: 'What does structural typing mean in TypeScript?', options: ['Compatibility is based mainly on shape', 'All classes must inherit', 'Only nominal IDs matter', 'Types exist at runtime unchanged'], answer: 0 },
      { id: 'ts-a2', type: 'mcq', question: 'What is a generic useful for?', options: ['Reusable type-safe code across types', 'Database joins', 'CSS generation', 'Password hashing'], answer: 0 },
      { id: 'ts-a3', type: 'mcq', question: 'What does `unknown` require before many operations?', options: ['Narrowing/type checking', 'A database connection', 'A JSX key', 'A Promise'], answer: 0 },
      { id: 'ts-a4', type: 'mcq', question: 'What is a discriminated union useful for?', options: ['Safe narrowing based on a shared discriminator', 'Creating SQL tables', 'Styling components', 'Running Docker'], answer: 0 },
      { id: 'ts-a5', type: 'mcq', question: 'What does `never` commonly represent?', options: ['Values that cannot occur/returning never', 'Any value', 'Nullable values', 'A string'], answer: 0 },
      { id: 'ts-a6', type: 'mcq', question: 'Why can `any` reduce type safety?', options: ['It disables many compile-time checks', 'It encrypts values', 'It prevents runtime errors', 'It makes types immutable'], answer: 0 }
    ]
  },
  Docker: {
    Beginner: [
      { id: 'docker-b1', type: 'mcq', question: 'What is a Docker image?', options: ['A template used to create containers', 'A running process only', 'A network cable', 'A database row'], answer: 0 },
      { id: 'docker-b2', type: 'mcq', question: 'Which file commonly defines image build steps?', options: ['Dockerfile', 'docker.txt', 'Containerfile.json', 'image.yaml'], answer: 0 },
      { id: 'docker-b3', type: 'mcq', question: 'Which command builds an image?', options: ['docker build', 'docker make', 'docker image-create', 'docker compile'], answer: 0 },
      { id: 'docker-b4', type: 'mcq', question: 'A container is best described as...', options: ['A running instance of an image', 'A source repository', 'A VM hypervisor', 'A DNS record'], answer: 0 },
      { id: 'docker-b5', type: 'mcq', question: 'Which command lists running containers?', options: ['docker ps', 'docker list-images', 'docker running', 'docker containers'], answer: 0 },
      { id: 'docker-b6', type: 'mcq', question: 'Which feature persists data outside a container lifecycle?', options: ['Volumes', 'Layers only', 'Tags', 'Labels'], answer: 0 }
    ],
    Intermediate: [
      { id: 'docker-i1', type: 'mcq', question: 'What isolates processes and filesystem views in containers?', options: ['Namespaces and related kernel isolation', 'Only CSS', 'DNS only', 'Git branches'], answer: 0 },
      { id: 'docker-i2', type: 'mcq', question: 'Which instruction creates a layer by running a command during build?', options: ['RUN', 'EXECUTE', 'CMDONLY', 'BUILD'], answer: 0 },
      { id: 'docker-i3', type: 'mcq', question: 'What is a multi-stage build useful for?', options: ['Keeping runtime images smaller', 'Adding more logs only', 'Creating SQL indexes', 'Encrypting source'], answer: 0 },
      { id: 'docker-i4', type: 'mcq', question: 'What does a Docker network allow?', options: ['Container-to-container communication', 'Image compilation only', 'Password storage', 'CPU overclocking'], answer: 0 },
      { id: 'docker-i5', type: 'mcq', question: 'What does `docker compose` primarily help define?', options: ['Multi-container application configuration', 'A programming language', 'A database engine', 'A browser extension'], answer: 0 },
      { id: 'docker-i6', type: 'mcq', question: 'Why should containers generally be treated as disposable?', options: ['Persistent state should be externalized', 'They cannot restart', 'They are always temporary files', 'They cannot use networks'], answer: 0 }
    ],
    Advanced: [
      { id: 'docker-a1', type: 'mcq', question: 'Why use a non-root user in a container?', options: ['To reduce the impact of a container compromise', 'To increase image size', 'To disable networking', 'To make builds slower'], answer: 0 },
      { id: 'docker-a2', type: 'mcq', question: 'What is an image layer cache primarily used for?', options: ['Speeding up repeated builds', 'Encrypting images', 'Running containers', 'Creating users'], answer: 0 },
      { id: 'docker-a3', type: 'mcq', question: 'What is a healthcheck useful for?', options: ['Reporting application health to orchestration/runtime tools', 'Building source code', 'Creating a volume', 'Hashing passwords'], answer: 0 },
      { id: 'docker-a4', type: 'mcq', question: 'Why pin image versions instead of relying on `latest`?', options: ['For more reproducible deployments', 'To enable CSS', 'To remove all vulnerabilities', 'To disable layers'], answer: 0 },
      { id: 'docker-a5', type: 'mcq', question: 'What is container resource limiting useful for?', options: ['Preventing one workload from consuming excessive host resources', 'Encrypting logs', 'Creating DNS', 'Changing Git history'], answer: 0 },
      { id: 'docker-a6', type: 'mcq', question: 'What is the purpose of a read-only root filesystem?', options: ['Reduce writable attack surface', 'Increase database size', 'Enable hot reload', 'Disable ports'], answer: 0 }
    ]
  }
};

for (const [skill, levels] of Object.entries(genericPools)) base[skill] = levels;

export const skillAssessmentBanks = base;

export const assessmentCatalog = Object.entries(skillAssessmentBanks).map(([skill, data]) => ({
  skill,
  levels: ['Beginner', 'Intermediate', 'Advanced'].map(level => ({
    level,
    questionCount: data[level].length + (data.coding?.[level] ? 1 : 0),
    passingScore: 70,
    durationMinutes: level === 'Advanced' ? 12 : 10,
    hasCoding: Boolean(data.coding?.[level])
  }))
}));
