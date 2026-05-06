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
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
