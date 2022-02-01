#!/usr/bin/env ts-node

const DIGITS = Array(10)
  .fill(0)
  .map((_, i) => i);
const operators = ["+", "-", "*", "/"];

function range(end: number, start: number = 0, step: number = 1) {
  return Array(end - start)
    .fill(0)
    .map((_, i) => i * step + start);
}

/**
 * Generate all valid equations using the numbers 0-9 and the operators /*+-
 * as long as they make 8 characters.
 *
 * One-to-three digit positive number: [0-9]{1,3}
 * Valid math operation: [\/\+\-\*]
 * Equals sign: [=]
 *
 * [0-9]{1,3} [\/\+\-\*] [0-9]{1,3} [\=] [0-9]{1,3}
 *
 * @param digitLen The number of squares to use
 */
export function buildCorpus() {
  const subies = buildSubtractionCorpus();
  const addies = buildAdditionCorpus();
  const multies = buildMultiplicationCorpus();
  const divies = buildDivisionCorpus();
  console.log(`${subies.length} subtraction equations`);
  console.log(`${addies.length} addition equations`);
  console.log(`${multies.length} multiplication equations`);
  console.log(`${divies.length} division equations`);
  return [divies, multies, subies, addies]
    .flat(1)
    .sort((a, b) => new Set(b).size - new Set(a).size);
}

/**
 * Build all valid subtraction equations where
 *  - the left operand is a one-to-three digit positive number
 *  - the right operand is a one-to-three digit positive number
 *  - the rhs is the sum of the operands
 *  - the equation is 8 characters long
 */
function buildAdditionCorpus(): string[] {
  const op = "+";
  const parameters: [number, number, number][] = [];
  // rhs can be between 0 and 999.
  for (let rhs = 0; rhs <= 999; rhs++) {
    // The left operand is no higher than the rhs to ensure positive rightOperand.
    for (let leftOperand = 0; leftOperand <= rhs; leftOperand++) {
      const rightOperand = rhs - leftOperand;
      if (rightOperand < 0) continue;

      parameters.push([leftOperand, rightOperand, rhs]);
    }
  }
  return parameters
    .map(
      ([leftOperand, rightOperand, rhs]) =>
        `${leftOperand}${op}${rightOperand}=${rhs}`
    )
    .filter((s) => s.length === 8);
}

/**
 * Build all valid subtraction equations where
 *  - the left operand is a one-to-three digit positive number
 *  - the right operand is a one-to-three digit positive number
 *  - the rhs is the difference of the operands
 *  - the rhs is positive or zero
 *  - the equation is 8 characters long
 */
function buildSubtractionCorpus(): string[] {
  const op = "-";
  const parameters: [number, number, number][] = [];
  // The left operand is between 0 and 999.
  for (let leftOperand = 0; leftOperand <= 999; leftOperand++) {
    // The rhs is no lower than the rhs to ensure positive rightOperand.
    for (let rhs = 0; rhs <= leftOperand; rhs++) {
      const rightOperand = leftOperand - rhs;
      if (rightOperand < 0) continue;

      parameters.push([leftOperand, rightOperand, rhs]);
    }
  }
  return parameters
    .map(
      ([leftOperand, rightOperand, rhs]) =>
        `${leftOperand}${op}${rightOperand}=${rhs}`
    )
    .filter((s) => s.length === 8);
}

/**
 * Build all valid multiplication equations where
 *  - the left operand is a one-to-three digit positive number
 *  - the right operand is a one-to-three digit positive number
 *  - the rhs is the product of the operands
 *  - the rhs is positive or zero
 *  - the equation is 8 characters long
 *
 * eg 9*8=72
 */
function buildMultiplicationCorpus(): string[] {
  const op = "*";
  const parameters: [number, number, number][] = [];
  // rhs is between 1 and 999, to avoid 0*0=0
  for (let rhs = 1; rhs <= 999; rhs++) {
    // Use each possible factor of the rhs to build the left operand.
    for (const leftOperand of factors(rhs)) {
      // for (let leftOperand = 1; leftOperand <= 999; leftOperand++) {
      const rightOperand = rhs / leftOperand;
      if (rightOperand < 0) continue;

      parameters.push([leftOperand, rightOperand, rhs]);
    }
  }
  return parameters
    .map(
      ([leftOperand, rightOperand, rhs]) =>
        `${leftOperand}${op}${rightOperand}=${rhs}`
    )
    .filter((s) => s.length === 8);
}

/**
 * Build all valid division equations where
 *  - the left operand is a one-to-three digit positive number
 *  - the right operand is a one-to-three digit positive number
 *  - the rhs is the division of the operands
 *  - the rhs is positive or zero
 *  - the equation is 8 characters long
 *
 * eg 9*8=72
 */
function buildDivisionCorpus(): string[] {
  const op = "/";
  const parameters: [number, number, number][] = [];
  // The left operand is between 1 and 999, to avoid 0/0=0
  for (let leftOperand = 1; leftOperand <= 999; leftOperand++) {
    // for (const leftOperand of factors(rhs)) {
    // Use each possible factor of the rhs to build the left operand.
    for (const rhs of factors(leftOperand)) {
      // for (let leftOperand = 1; leftOperand <= 999; leftOperand++) {
      const rightOperand = leftOperand / rhs;
      // WARNING: Right operand may not be 0 or negative.
      if (rightOperand <= 0) continue;

      const correctCharLen =
        `${leftOperand}${op}${rightOperand}=${rhs}`.length === 8;
      if (!correctCharLen) continue;

      parameters.push([leftOperand, rightOperand, rhs]);
    }
  }
  return parameters
    .map(
      ([leftOperand, rightOperand, rhs]) =>
        `${leftOperand}${op}${rightOperand}=${rhs}`
    )
    .filter((s) => s.length === 8);
}

// === Helpers ===

/**
 * Return all factors of a number n.
 */
function factors(n: number): number[] {
  return [...Array(n + 1).keys()].filter((i) => n % i === 0);
}

/**
 * Solves Nerdle in as few tries as possible.
 *
 * @example
 *  const solver = new NerdleSolver();
 *
 *  // User enters 'later', gets a score of [grey, grey, hit, misplaced, misplaced]:
 *  solver.score('later', 'eexii').getBestGuess();
 *  // =>
 *
 *  // Start again.
 *  solver.reset();
 *
 * @note Current average is just under 5 attempts across all test equations.
 *       While most are solved in 2 attempts, there are some where it gets stuck with similar equations.
 *
 * @note A class was chosen over a function because it's most efficent to mutate the corpus.
 */
export class NerdleSolver {
  corpus: string[];
  startingEquation?: string;
  guessesAndScores: [string, string][];
  logging: boolean;

  constructor(
    startingEquation: string | null = null,
    logging: boolean = false
  ) {
    this.logging = logging;
    const corpus = buildCorpus();
    this.reset(corpus);
    this.sort();
    this.startingEquation = startingEquation ?? this.getSolutions()[0] ?? null;
  }

  getBestGuess(): string | null {
    if (!this.guessesAndScores.length) return this.startingEquation;
    const solutions = this.getSolutions();
    return solutions[0] ?? null;
  }

  reset(corpus: string[] | null = null) {
    this.corpus = corpus ? corpus.slice() : buildCorpus();
    this.guessesAndScores = [];
    return this;
  }

  sort() {
    this.sortByCommonness();
    return this;
  }

  getSolutions() {
    this.sort();
    return this.corpus;
  }

  /**Score like 'x' for correct, 'e' for excluded, 'i' for included */
  score(guess: string, score: string) {
    if (guess.length !== 8) throw new Error("Guess must be 8 chars long");
    if (score.length !== 8) throw new Error("Score must be 8 chars long");
    const loweredScore = score.toLowerCase();

    const invalidScoreChars = score
      .split("")
      .filter((l) => l !== "x" && l !== "e" && l !== "i");
    if (invalidScoreChars.length)
      throw new Error(
        `Invalid score chars: ${invalidScoreChars.join(", ")}`
      );

    this.guessesAndScores.push([guess, loweredScore]);

    const guessAndScore: [string, string][] = zip(
      guess.split(""),
      loweredScore.split("")
    );

    const duplicateChars = new Set(
      guess
        .split("")
        .filter((char, index) => guess.slice(index + 1).includes(char))
    );

    // Remove misses.
    const misses: string[] = guessAndScore
      .filter(
        ([guessChar, scoreChar]) =>
          scoreChar === "e" && !duplicateChars.has(guessChar)
      )
      .map(([guessChar]) => guessChar);
    this.excludeChars(misses.join(""));

    guessAndScore.forEach(([guessChar, scoreChar], index) => {
      switch (scoreChar) {
        case "x":
          // Keep equations w/ hits.
          return this.keepWithCorrectChar(guessChar, index);
        case "i":
          // Keep equations w/ misplaced hits.
          return this.keepWithMisplacedChar(guessChar, index);
        case "e":
          // Remove equations w/ incorrect chars.
          return this.excludeWithChar(guessChar, index);
      }
    });

    this.sort();

    return this;
  }

  // /** Return an array of second guesses, which prefer to reduce overlap with prior guesses. */
  // getSecondGuess() {
  //   // Don't have a better guess to make if no prior guesses.
  //   if (this.guessesAndScores.length === 0) return this.corpus;

  //   const currentequations = this.corpus.slice();
  //   const [priorGuess, priorGuessScore] =
  //     this.guessesAndScores[this.guessesAndScores.length - 1];

  //   // Exclude inclusions as well as misses.
  //   const startingEquations = currentequations.filter((equation) =>
  //     equation
  //       .split("")
  //       .every(
  //         (Char, index) =>
  //           priorGuessScore[index] === "x" || Char !== priorGuess[index]
  //       )
  //   );
  //   const solver = new NerdleSolver();
  //   return solver.getSolutions();
  // }

  /** Remove equations that contain provided Chars. */
  excludeChars(charsToExclude: string) {
    const excludedChars = new Set(charsToExclude.split(""));
    const newCorpus = this.corpus.filter((equation) =>
      equation.split("").every((Char) => !excludedChars.has(Char))
    );
    this.logging &&
      console.log(
        `Dropped ${
          this.corpus.length - newCorpus.length
        } equations with excluded Chars.`
      );
    this.corpus = newCorpus;
    return this;
  }

  /** Keep only equations without the given Char at a specific index. */
  excludeWithChar(wrongChar: string, index: number) {
    const newCorpus = this.corpus.filter((equation) => equation[index] !== wrongChar);
    this.logging &&
      console.log(
        `Dropped ${
          this.corpus.length - newCorpus.length
        } equations with wrong Char.`
      );
    this.corpus = newCorpus;
    return this;
  }

  /** Keep only equations with given Char at a specific index. */
  keepWithCorrectChar(correctChar: string, index: number) {
    const newCorpus = this.corpus.filter(
      (equation) => equation[index] === correctChar
    );
    this.logging &&
      console.log(
        `Dropped ${
          this.corpus.length - newCorpus.length
        } equations with correct Char.`
      );
    this.corpus = newCorpus;
    return this;
  }

  /** Keep only equations with given Char at a place OTHER than the index. */
  keepWithMisplacedChar(misplacedChar: string, index: number) {
    const newCorpus = this.corpus.filter(
      (equation) =>
        equation[index] !== misplacedChar && equation.includes(misplacedChar)
    );
    this.logging &&
      console.log(
        `Dropped ${
          this.corpus.length - newCorpus.length
        } equations with misplaced Char.`
      );
    this.corpus = newCorpus;
    return this;
  }

  /** Returns charFrequency given current solution space. */
  charFrequency() {
    const charFreq: Record<string, number> = {};
    this.corpus.forEach((equation) => {
      equation.split("").forEach((char) => {
        if (!charFreq[char]) charFreq[char] = 1;
        charFreq[char]++;
      });
    });

    this.logging && console.log("Most frequent chars: ", this.bestChars());
    return charFreq;
  }

  bestChars() {
    const CharFreq = this.charFrequency();
    const bestChars = Object.entries(CharFreq)
      .sort(([, aFreq], [, bFreq]) => bFreq - aFreq)
      .map(([Char]) => Char)
      .join("");
    return bestChars;
  }

  /** Returns charFrequency of a given equation for the current solution space. */
  charFrequencyScore(equation: string) {
    const CharFreq = this.charFrequency();
    return equation.split("").reduce((acc, Char) => acc + CharFreq[Char], 0);
  }

  /** Sorts solutions by common-ness of its Chars amongst other solutions. */
  private sortByCommonness() {
    const CharFreq = this.charFrequency();

    const byFrequency = (a: string, b: string) => {
      // Prefer equations with non-repeating Chars.
      const aUniqs = new Set(a).size;
      const bUniqs = new Set(b).size;
      const differenceOfUniqueness = bUniqs - aUniqs;
      if (differenceOfUniqueness !== 0) return differenceOfUniqueness;

      // Prefer equations with more frequently-occuring Chars.
      const aFreq = a
        .split("")
        .reduce((acc, Char) => acc + CharFreq[Char], 0);
      const bFreq = b
        .split("")
        .reduce((acc, Char) => acc + CharFreq[Char], 0);
      return bFreq - aFreq;
    };
    this.corpus.sort(byFrequency);
    return this;
  }
}

// // === Testing ===

// /** Test the solver by running it through every equation in corpus */
// export function testSolver(
//   startingEquation: string | null = null,
//   logging: boolean = false
// ) {
//   const plays = solutions
//     .map((testequation) => playRound(testequation, startingEquation, logging))
//     .sort((a, b) => a.attempts - b.attempts);

//   const allAttempts = plays.map(({ attempts }) => attempts);
//   const averageAttempts = sum(allAttempts) / allAttempts.length;

//   const maxAttempts = Math.max(...allAttempts);
//   const minAttempts = Math.min(...allAttempts);

//   const worstAttempts = plays
//     .reverse()
//     .slice(0, 9)
//     .map(({ targetEquation }) => playRound(targetEquation, startingEquation, true));

//   return { averageAttempts, minAttempts, maxAttempts, worstAttempts };
// }

// /** Score the guess, given the targetEquation. */
export function scoreGuess(guess: string, targetEquation: string): string {
  return zip(guess.split(""), targetEquation.split(""))
    .map(([char, targetChar]) => {
      if (char === targetChar) return "x";
      if (targetEquation.includes(char)) return "i";
      return "e";
    })
    .join("");
}

/** Play a Nerdle until a solution is found. */
export function playRound(
  targetEquation: string,
  startingEquation: string | null = null,
  logging: boolean = false
): {
  attempts: number;
  firstGuess: string;
  targetEquation: string;
  scores: string[];
  guesses: string[];
} {
  let solver = new NerdleSolver(startingEquation);
  let attempts = 0;
  let guesses = [];
  let scores = [];
  let myGuess = solver.getBestGuess();
  let myScore = scoreGuess(myGuess, targetEquation);
  const firstGuess = myGuess;

  while (myScore !== "xxxxxxxx" && attempts < 100) {
    // prior guess
    const priorGuess = myGuess;
    // Determine best guess
    myGuess = solver.getBestGuess();
    guesses.push(myGuess);
    if (!myGuess)
      throw new Error(
        `No more guesses after ${priorGuess} for target ${targetEquation}`
      );
    // See the score for the guess.
    myScore = scoreGuess(myGuess, targetEquation);
    scores.push(myScore);
    // Enter this score into the system.
    solver.score(myGuess, myScore);
    attempts++;
  }
  logging && console.log(`Found ${targetEquation} in ${attempts} attempts.`);
  return { attempts, targetEquation, firstGuess, guesses, scores };
}

export function scoresInColors(scores: string[]) {
  return scores
    .map((score) => score.split("").map(myScoreToSquare).join(""))
    .join("\n");
}

function myScoreToSquare(scoreChar: "e" | "i" | "x") {
  switch (scoreChar) {
    case "e":
      return "⬛";
    case "i":
      return "🟨";
    case "x":
      return "🟩";
  }
}

// //  === Utilities ===

/** Utility to zip two lists. */
function zip<X = unknown, Y = unknown>(xs: X[], ys: Y[]): [X, Y][] {
  return xs.map((x, i) => [x, ys[i]]);
}

/** Sum a bunch of numbers */
function sum(nums: number[]): number {
  return nums.reduce((acc, num) => acc + num, 0);
}

// export function optimalStartingEquation() {
//   return solutions.map((startingEquation) => {
//     console.log(`Perf check, starting with ${startingEquation}`);
//     return testSolver(startingEquation, false);
//   });
// }
