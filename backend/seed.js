/**
 * Seed the database with sample quiz data
 */
const { sequelize, Quiz, Question } = require('./models');

const sampleQuizzes = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of core JavaScript concepts including closures, hoisting, and prototypes.',
    questions: [
      {
        question_text: 'What is the output of: typeof null?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correct_option: 2,
        order_num: 1,
        time_limit: 10,
      },
      {
        question_text: 'Which method converts a JSON string to a JavaScript object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'],
        correct_option: 1,
        order_num: 2,
        time_limit: 10,
      },
      {
        question_text: 'What does the "===" operator check?',
        options: ['Value only', 'Type only', 'Value and type', 'Reference'],
        correct_option: 2,
        order_num: 3,
        time_limit: 10,
      },
      {
        question_text: 'Which keyword declares a block-scoped variable?',
        options: ['var', 'let', 'global', 'define'],
        correct_option: 1,
        order_num: 4,
        time_limit: 10,
      },
      {
        question_text: 'What is a closure in JavaScript?',
        options: [
          'A function inside a loop',
          'A function that has access to its outer scope',
          'A function that is immediately invoked',
          'A built-in method',
        ],
        correct_option: 1,
        order_num: 5,
        time_limit: 10,
      },
      {
        question_text: 'What will "console.log(1 + "2" + 3)" output?',
        options: ['6', '"123"', '"33"', '"15"'],
        correct_option: 1,
        order_num: 6,
        time_limit: 10,
      },
      {
        question_text: 'Which array method returns a new array without modifying the original?',
        options: ['push()', 'splice()', 'map()', 'sort()'],
        correct_option: 2,
        order_num: 7,
        time_limit: 10,
      },
      {
        question_text: 'What does "Promise.all()" do?',
        options: [
          'Runs promises one by one',
          'Resolves when all promises resolve',
          'Resolves when first promise resolves',
          'Cancels all promises',
        ],
        correct_option: 1,
        order_num: 8,
        time_limit: 10,
      },
      {
        question_text: 'What is the default value of an uninitialized variable in JavaScript?',
        options: ['null', '0', 'undefined', 'NaN'],
        correct_option: 2,
        order_num: 9,
        time_limit: 10,
      },
      {
        question_text: 'Which ES6 feature allows importing modules?',
        options: ['require()', 'import', 'include', 'load'],
        correct_option: 1,
        order_num: 10,
        time_limit: 10,
      },
    ],
  },
  {
    title: 'React Mastery',
    description: 'Challenge yourself with questions about React hooks, state management, and component lifecycle.',
    questions: [
      {
        question_text: 'What hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correct_option: 1,
        order_num: 1,
        time_limit: 10,
      },
      {
        question_text: 'What does JSX stand for?',
        options: [
          'JavaScript XML',
          'JavaScript Extension',
          'Java Syntax Extension',
          'JSON XML',
        ],
        correct_option: 0,
        order_num: 2,
        time_limit: 10,
      },
      {
        question_text: 'Which method is NOT part of the React component lifecycle?',
        options: [
          'componentDidMount',
          'componentWillUpdate',
          'componentDidLoad',
          'componentWillUnmount',
        ],
        correct_option: 2,
        order_num: 3,
        time_limit: 10,
      },
      {
        question_text: 'What is the purpose of the "key" prop in React lists?',
        options: [
          'Styling elements',
          'Uniquely identifying elements for reconciliation',
          'Adding event handlers',
          'Setting default values',
        ],
        correct_option: 1,
        order_num: 4,
        time_limit: 10,
      },
      {
        question_text: 'Which hook replaces Redux for simple state management?',
        options: ['useState', 'useEffect', 'useReducer + useContext', 'useMemo'],
        correct_option: 2,
        order_num: 5,
        time_limit: 10,
      },
      {
        question_text: 'What does React.memo() do?',
        options: [
          'Creates a memo',
          'Memoizes component to prevent unnecessary re-renders',
          'Stores data in memory',
          'Logs component updates',
        ],
        correct_option: 1,
        order_num: 6,
        time_limit: 10,
      },
      {
        question_text: 'What is the Virtual DOM?',
        options: [
          'The actual browser DOM',
          'A lightweight copy of the real DOM in memory',
          'A CSS framework',
          'A testing tool',
        ],
        correct_option: 1,
        order_num: 7,
        time_limit: 10,
      },
      {
        question_text: 'What is the correct way to update state in React?',
        options: [
          'this.state.value = newValue',
          'setState({ value: newValue })',
          'state = newValue',
          'updateState(newValue)',
        ],
        correct_option: 1,
        order_num: 8,
        time_limit: 10,
      },
    ],
  },
  {
    title: 'General Knowledge',
    description: 'A fun mix of general knowledge questions covering science, history, geography, and more.',
    questions: [
      {
        question_text: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correct_option: 2,
        order_num: 1,
        time_limit: 10,
      },
      {
        question_text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correct_option: 1,
        order_num: 2,
        time_limit: 10,
      },
      {
        question_text: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'],
        correct_option: 2,
        order_num: 3,
        time_limit: 10,
      },
      {
        question_text: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correct_option: 3,
        order_num: 4,
        time_limit: 10,
      },
      {
        question_text: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correct_option: 2,
        order_num: 5,
        time_limit: 10,
      },
      {
        question_text: 'What is the speed of light approximately?',
        options: [
          '300,000 km/s',
          '150,000 km/s',
          '500,000 km/s',
          '1,000,000 km/s',
        ],
        correct_option: 0,
        order_num: 6,
        time_limit: 10,
      },
      {
        question_text: 'Which element has the atomic number 1?',
        options: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'],
        correct_option: 2,
        order_num: 7,
        time_limit: 10,
      },
      {
        question_text: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correct_option: 2,
        order_num: 8,
        time_limit: 10,
      },
    ],
  },
];

// Additional questions added to reach 10-15 questions per quiz
sampleQuizzes[0].questions.push(
  { question_text: 'What does "this" refer to in a regular function?', options: ['The function itself', 'The global object (window)', 'undefined', 'null'], correct_option: 1, order_num: 11, time_limit: 10 },
  { question_text: 'Which operator is used to unpack an array?', options: ['&&', '...', '??', '!!'], correct_option: 1, order_num: 12, time_limit: 10 },
  { question_text: 'How do you create an empty object?', options: ['[]', '()', '{}', '<>'], correct_option: 2, order_num: 13, time_limit: 10 },
  { question_text: 'What is NaN?', options: ['Not a Number', 'New and Null', 'Negative and Null', 'Not a Node'], correct_option: 0, order_num: 14, time_limit: 10 },
  { question_text: 'Which function stops a setInterval?', options: ['stopInterval', 'clearInterval', 'clearTimer', 'pauseInterval'], correct_option: 1, order_num: 15, time_limit: 10 }
);

sampleQuizzes[1].questions.push(
  { question_text: 'What is used to pass data to components?', options: ['States', 'Props', 'Context', 'Redux'], correct_option: 1, order_num: 9, time_limit: 10 },
  { question_text: 'Can React run without JSX?', options: ['Yes', 'No', 'Only in development', 'Only in production'], correct_option: 0, order_num: 10, time_limit: 10 },
  { question_text: 'What hook is used to get DOM references?', options: ['useRef', 'useEffect', 'useDOM', 'useState'], correct_option: 0, order_num: 11, time_limit: 10 },
  { question_text: 'React uses a ________ DOM.', options: ['Real', 'Shadow', 'Virtual', 'Native'], correct_option: 2, order_num: 12, time_limit: 10 },
  { question_text: 'Which component type uses hooks?', options: ['Class Components', 'Function Components', 'HOCs', 'Pure Components'], correct_option: 1, order_num: 13, time_limit: 10 }
);

sampleQuizzes[2].questions.push(
  { question_text: 'What is the largest mammal?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'], correct_option: 1, order_num: 9, time_limit: 10 },
  { question_text: 'Which country invented tea?', options: ['India', 'China', 'Japan', 'England'], correct_option: 1, order_num: 10, time_limit: 10 },
  { question_text: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct_option: 2, order_num: 11, time_limit: 10 },
  { question_text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], correct_option: 1, order_num: 12, time_limit: 10 },
  { question_text: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], correct_option: 2, order_num: 13, time_limit: 10 }
);

async function seed() {
  try {
    // Sync database (force: true drops existing tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    for (const quizData of sampleQuizzes) {
      const quiz = await Quiz.create({
        title: quizData.title,
        description: quizData.description,
      });

      for (const q of quizData.questions) {
        await Question.create({
          quiz_id: quiz.id,
          ...q,
        });
      }

      console.log(`📝 Seeded quiz: ${quizData.title} (${quizData.questions.length} questions)`);
    }

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
}

// Check if run directly (e.g. from terminal)
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seed, sampleQuizzes };
