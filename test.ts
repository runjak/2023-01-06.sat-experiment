import { exec } from "node:child_process";
import { readFileSync } from "fs";
import { mkdtemp, writeFile } from "fs/promises";
import { takeWhile } from "lodash";
import path from "path";

const isVolumeCandidate = (n: number): boolean => n % 7 === 0;
const isSliceCandidate = (n: number): boolean => n >= 5;
const isSizeCandidate = (n: number): boolean => n >= 3;

type Coordinates = [number, number, number];

const candidateSizes = [1, 2, 3, 4, 5, 6, 7].filter(isSizeCandidate);

const generateDimensions = (): Array<Coordinates> => {
  let dims: Array<Coordinates> = [];

  for (const x of candidateSizes) {
    for (const y of candidateSizes) {
      if (y > x) {
        continue;
      }
      if (!isSliceCandidate(x * y)) {
        continue;
      }

      for (const z of candidateSizes) {
        if (z > y) {
          continue;
        }
        const dim = [x, y, z];
        if (!isVolumeCandidate(x * y * z)) {
          continue;
        }
        if (!isSliceCandidate(x * z)) {
          continue;
        }
        if (!isSliceCandidate(y * z)) {
          continue;
        }

        dims.push([x, y, z]);
      }
    }
  }

  return dims;
};

const requiredPieces = ([x, y, z]: Coordinates): number =>
  Math.floor((x * y * z) / 7);

//console.log("Candidates are:");
//console.table(generateDimensions().map((d) => [...d, requiredPieces(d)]));

const possibleCenterCoordinates = ([
  xSize,
  ySize,
  zSize,
]: Coordinates): Array<Coordinates> => {
  let candidates: Array<Coordinates> = [];

  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      for (let z = 0; z < zSize; z++) {
        candidates.push([x, y, z]);
      }
    }
  }

  return candidates;
};

const coordinatesForCenter = (
  [x, y, z]: Coordinates,
  [xSize, ySize, zSize]: Coordinates
): Array<Coordinates> =>
  [
    [x, y, z + 1],
    [x, y + 1, z],
    [x - 1, y, z],
    [x, y, z],
    [x + 1, y, z],
    [x, y - 1, z],
    [x, y, z - 1],
  ].map(([x, y, z]) => [
    (x + xSize) % xSize,
    (y + ySize) % ySize,
    (z + zSize) % zSize,
  ]);

const possiblePieceCoordinates = (
  size: Coordinates
): Array<Array<Coordinates>> =>
  possibleCenterCoordinates(size).map((center) =>
    coordinatesForCenter(center, size)
  );

console.log("possiblePieceCoordinates([7, 3, 3]):");
console.table(possiblePieceCoordinates([7, 3, 3]));

const coordinatesToSet = (coordinates: Array<Coordinates>): Set<string> =>
  new Set(coordinates.map((c) => JSON.stringify(c)));

//console.log('possiblePieceCoordinates([7, 3, 3]).map(coordinatesToSet):')
//console.log(possiblePieceCoordinates([7, 3, 3]).map(coordinatesToSet))

const emptyIntersection = (a: Set<string>, b: Set<string>): boolean => {
  for (const candidate of a.values()) {
    if (b.has(candidate)) {
      return false;
    }
  }
  return true;
};

function* chooseNCollisionFreeSets(
  allSets: Array<Set<string>>,
  n: number
): Generator<Array<Set<string>>, [], unknown> {
  if (n < 1) {
    return [];
  }
  if (n === 1) {
    for (const s of allSets.values()) {
      yield [s];
    }
  } else {
    for (const candidate of allSets.values()) {
      const remainingSets = allSets.filter((s) =>
        emptyIntersection(candidate, s)
      );

      for (const otherSets of chooseNCollisionFreeSets(remainingSets, n - 1)) {
        yield [candidate, ...otherSets];
      }
    }
  }

  return [];
}

const solve_1 = () => {
  // Slow; we could extract factor 2, but it's miserable.
  for (const dimension of generateDimensions()) {
    const n = requiredPieces(dimension);
    const candidates =
      possiblePieceCoordinates(dimension).map(coordinatesToSet);
    console.log(
      `Examining ${JSON.stringify(dimension)} with ${
        candidates.length
      } candidates for ${n} pieces:`
    );

    const solutions = Array.from(chooseNCollisionFreeSets(candidates, n));
    console.log("solutions:");
    console.log(solutions);
    if (solutions.length > 0) {
      console.log("stopping the search");
      break;
    }
  }
};

type Clause = Array<Number>;

const implies = (a: number, b: number): Clause => [-a, b];

const exactlyOne = (...as: Array<number>): Array<Clause> => {
  let clauses: Array<Clause> = [];

  // Adding all to check at least one:
  clauses.push(as);

  // Implications to generate at most one:
  // No matrix hack; we do it naively for simplicity
  for (const a of as) {
    for (const b of as.filter((b) => b !== a)) {
      clauses.push(implies(a, -b));
    }
  }

  return clauses;
};

type Encoding = {
  cnf: string;
  getString: (literal: number) => string;
};

const satEncodeSize = (size: Coordinates): Encoding => {
  const centers = possibleCenterCoordinates(size);
  const centersByStrings: Record<string, Coordinates> = Object.fromEntries(
    centers.map((center) => [JSON.stringify(center), center])
  );
  const centerStringsToNumber: Record<string, number> = Object.fromEntries(
    Object.keys(centersByStrings).map((center, index) => [center, index + 1])
  );
  const numbersToCenterString: Record<number, string> = Object.fromEntries(
    Object.entries(centerStringsToNumber).map(([center, index]) => [
      index,
      center,
    ])
  );

  const namesByCenter: Record<string, Array<string>> = Object.fromEntries(
    Object.entries(centersByStrings).map(([centerString, center]) => [
      centerString,
      coordinatesForCenter(center, size).map((c) => JSON.stringify(c)),
    ])
  );

  let centersByField: Record<string, Array<string>> = {};
  Object.entries(namesByCenter).forEach(([center, fields]) => {
    for (const field of fields) {
      const previousCenters = centersByField[field] ?? [];
      const nextCenters = previousCenters.includes(center)
        ? previousCenters
        : [...previousCenters, center];
      centersByField[field] = nextCenters;
    }
  });

  // Each field needs to belong to exactly one center:
  let clauses: Array<Clause> = [];
  Object.values(centersByField).forEach((centers) => {
    clauses.push(
      ...exactlyOne(...centers.map((center) => centerStringsToNumber[center]))
    );
  });

  const cnf = [
    `p cnf ${centers.length} ${clauses.length}`,
    ...clauses.map((clause) => clause.map((n) => String(n)).join(" ") + " 0"),
  ].join("\n");

  return {
    cnf,
    getString: (literal) => {
      return numbersToCenterString[Math.abs(literal)];
    },
  };
};

// console.log("satEncodeSize([7, 3, 3]):");
// console.log(satEncodeSize([7, 3, 3]));

const writeProblem = (size: Coordinates) => {
  const encoding = satEncodeSize(size);
  const fileName = `./${size.map((c) => String(c)).join("-")}.cnf`;
  writeFile(fileName, encoding.cnf);
};

// writeProblem([7, 3, 3]);

const writeProblems = () => {
  for (const size of generateDimensions()) {
    writeProblem(size);
  }
};
// writeProblems();

type Solution = Array<number>;

const parseSolutionsFromOutput = (output: string): Array<Solution> => {
  let solutions: Array<Array<number>> = [];

  let lines = output.split("\n").map((line) => line.trim());
  while (lines.length > 0) {
    const currentLine = lines.shift();

    if (currentLine === "s UNSATISFIABLE") {
      break;
    }

    if (currentLine === "s SATISFIABLE") {
      const varLines = takeWhile(lines, (line) => line.startsWith("v "));
      const solution = varLines.flatMap(
        (line): Array<number> =>
          line
            .split(" ")
            .filter((item) => item !== "v" && item !== "0")
            .map((item) => Number(item))
      );
      solutions.push(solution);
    }
  }

  return solutions;
};

const reportSolutions = (solutions: Array<Solution>) => {
  console.log(`Number of solutions: ${solutions.length}`);
  if (solutions.length > 0) {
    console.log("The first solution is:");
    const firstSolution = solutions.slice().shift();
    console.log(JSON.stringify(firstSolution));
    const positiveVariables = firstSolution?.filter((x) => x > 0);
    console.log(`Positive variables (${positiveVariables?.length ?? 0}) are:`);
    console.log(JSON.stringify(positiveVariables));
  } else {
    console.log("no solution was found.");
  }
};

const readSolutionsFromOutputFiles = () => {
  const outputFiles = [
    "./outputs/7-3-3.out",
    "./outputs/7-4-3.out",
    "./outputs/7-4-4.out",
    "./outputs/7-5-3.out",
    "./outputs/7-5-4.out",
    "./outputs/7-5-5.out",
    "./outputs/7-6-3.out",
    "./outputs/7-6-4.out",
    "./outputs/7-6-5.out",
    "./outputs/7-6-6.out",
    "./outputs/7-7-3.out",
    "./outputs/7-7-4.out",
    "./outputs/7-7-5.out",
    "./outputs/7-7-6.out",
    "./outputs/7-7-7.out",
    "./outputs/7-7-7.complete.out",
  ];

  for (const outputFile of outputFiles) {
    const output = String(readFileSync(outputFile));

    console.log(`parsed output for ${outputFile}:`);
    const solutions = parseSolutionsFromOutput(output);
    reportSolutions(solutions);
  }
};
// readSolutionsFromOutputFiles();

const solveCNF = async (
  cnf: string,
  exhaustive: boolean = false
): Promise<Array<Solution>> => {
  const testDir = await mkdtemp("/tmp/test-sat");
  const inputFile = path.join(testDir, "problem.cnf");
  console.log("writing file: " + inputFile);
  await writeFile(inputFile, cnf);

  const command = `picosat ${exhaustive ? "--all" : ""} ${inputFile}`;
  // const command = `picosat ${inputFile}`;

  const output = await new Promise<string>((resolve) => {
    exec(command, (error, stdOut) => {
      // Ignoring error because picoSat returns as exitCode the number of output lines.
      resolve(stdOut);
    });
  });

  return parseSolutionsFromOutput(output);
};

const stuff = async () => {
  const size = [7, 7, 7] as Coordinates;
  const encoding = satEncodeSize(size);

  const solutions = await solveCNF(encoding.cnf);
  reportSolutions(solutions);

  if (solutions.length < 1) {
    return;
  }

  const [solution] = solutions;
  const positiveVariables = solution.filter((v) => v > 0);
  const names = positiveVariables.map((v) => encoding.getString(v));

  console.log({ names });
};
stuff();
