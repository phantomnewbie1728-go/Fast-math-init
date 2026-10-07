import { Difficulty, GameMode, Question, SubMode } from '../types/math';

let questionCounter = 0;

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(
  mode: GameMode,
  subMode: SubMode | undefined,
  difficulty: Difficulty,
  lastQuestion?: Question | null
): Question {
  questionCounter++;
  let operand1 = 0;
  let operand2 = 0;
  let operator: '+' | '-' | '×' = '×';
  let correctAnswer = 0;

  for (let attempt = 0; attempt < 10; attempt++) {
    if (mode === 'tables') {
      operator = '×';
      if (difficulty === 'medium') {
        // Tables 2 through 12, multiplier 1 through 10
        operand1 = getRandomInt(2, 12);
        operand2 = getRandomInt(1, 10);
      } else {
        // Hard: Tables 11 through 20 (up to 10th table)
        // Weighted towards 13, 14, 16, 17, 18, 19, 20
        const hardTables = [12, 13, 14, 15, 16, 17, 18, 19, 20];
        operand1 = hardTables[getRandomInt(0, hardTables.length - 1)];
        operand2 = getRandomInt(2, 10);
      }
      correctAnswer = operand1 * operand2;
    } else if (mode === 'add_sub') {
      const activeOp = subMode || 'add';

      if (activeOp === 'add') {
        operator = '+';
        if (difficulty === 'medium') {
          // Standard single digit addition: 1-9 + 1-9
          operand1 = getRandomInt(1, 9);
          operand2 = getRandomInt(1, 9);
        } else {
          // Hard: High single digits with carries across 10 (e.g. 6+7, 8+9, 7+8)
          operand1 = getRandomInt(4, 9);
          operand2 = getRandomInt(5, 9);
        }
        correctAnswer = operand1 + operand2;
      } else {
        // Subtraction
        operator = '-';
        if (difficulty === 'medium') {
          // Single digit operands: a - b where a >= b
          operand1 = getRandomInt(2, 9);
          operand2 = getRandomInt(1, operand1);
          correctAnswer = operand1 - operand2;
        } else {
          // Hard: Teen minuends minus single digits yielding single digit (e.g. 15 - 8 = 7)
          const result = getRandomInt(2, 9);
          operand2 = getRandomInt(4, 9);
          operand1 = result + operand2; // operand1 will be 11..18
          correctAnswer = result;
        }
      }
    } else if (mode === 'two_by_two') {
      operator = '×';
      if (difficulty === 'medium') {
        // Accessible 2-digit multiplication: 11 to 25
        operand1 = getRandomInt(11, 25);
        operand2 = getRandomInt(11, 20);
      } else {
        // Hard: Tough 2-digit x 2-digit multiplication: 21 to 99
        operand1 = getRandomInt(18, 99);
        operand2 = getRandomInt(12, 89);
      }
      correctAnswer = operand1 * operand2;
    }

    // Avoid exact repetition of previous problem
    if (
      !lastQuestion ||
      lastQuestion.operand1 !== operand1 ||
      lastQuestion.operand2 !== operand2 ||
      lastQuestion.operator !== operator
    ) {
      break;
    }
  }

  const text = `${operand1} ${operator} ${operand2}`;

  return {
    id: `q_${Date.now()}_${questionCounter}`,
    operand1,
    operand2,
    operator,
    correctAnswer,
    text,
  };
}
