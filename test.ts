const isVolumeCandidate = (n: number): boolean => n % 7 === 0;
const isSliceCandidate = (n: number): boolean => n >= 5;
const isSizeCandidate = (n: number): boolean => n >= 3;

type Coordinates = [number, number, number];

const candidateSizes = [1, 2, 3, 4, 5, 6, 7].filter(isSizeCandidate);

const generateDimensions = (): Array<Coordinates> => {
  let dims: Array<Coordinates> = []

  for (const x of candidateSizes) {
    for (const y of candidateSizes) {
      if (y > x) { continue }
      if (!isSliceCandidate(x * y)) { continue }

      for (const z of candidateSizes) {
        if (z > y) { continue }
        const dim = [x, y, z]
        if (!isVolumeCandidate(x * y * z)) { continue }
        if (!isSliceCandidate(x * z)) { continue }
        if (!isSliceCandidate(y * z)) { continue }

        dims.push([x, y, z]);
      }
    }
  }

  return dims
}

const requiredPieces = ([x, y, z]: Coordinates): number => Math.floor((x * y * z) / 7)

console.log('Candidates are:')
console.table(generateDimensions().map(d => [...d, requiredPieces(d)]))

const possibleCenterCoordinates = ([xSize, ySize, zSize]: Coordinates): Array<Coordinates> => {
  let candidates: Array<Coordinates> = []

  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      for (let z = 0; z < zSize; z++) {
        candidates.push([x, y, z])
      }
    }
  }

  return candidates
}

const coordinatesForCenter = ([x, y, z]: Coordinates, [xSize, ySize, zSize]: Coordinates): Array<Coordinates> =>
([[x, y, z + 1], [x, y + 1, z], [x - 1, y, z], [x, y, z], [x + 1, y, z], [x, y - 1, z], [x, y, z - 1]]
  .map(([x, y, z]) => ([(x + xSize) % xSize, (y + ySize) % ySize, (z + zSize) % zSize])))

const possiblePieceCoordinates = (size: Coordinates): Array<Array<Coordinates>> =>
  possibleCenterCoordinates(size).map(center => coordinatesForCenter(center, size))

console.log('possiblePieceCoordinates([7, 3, 3]):')
console.table(possiblePieceCoordinates([7, 3, 3]))

const coordinatesToSet = (coordinates: Array<Coordinates>): Set<string> => new Set(coordinates.map(c => JSON.stringify(c)))

//console.log('possiblePieceCoordinates([7, 3, 3]).map(coordinatesToSet):')
//console.log(possiblePieceCoordinates([7, 3, 3]).map(coordinatesToSet))

const emptyIntersection = (a: Set<string>, b: Set<string>): boolean => {
  for (const candidate of a.values()) {
    if (b.has(candidate)) {
      return false
    }
  }
  return true
};

function* chooseNCollisionFreeSets(allSets: Array<Set<string>>, n: number): Generator<Array<Set<string>>, [], unknown> {
  if (n < 1) { return [] }
  if (n === 1) {
    for (const s of allSets.values()) {
      yield [s];
    }
  } else {
    for (const candidate of allSets.values()) {
      const remainingSets = allSets.filter(s => emptyIntersection(candidate, s))

      for (const otherSets of chooseNCollisionFreeSets(remainingSets, n - 1)) {
        yield [candidate, ...otherSets]
      }
    }
  }

  return [];
}

const solve_1 = () => { // Slow; we could extract factor 2, but it's miserable.
  for (const dimension of generateDimensions()) {
    const n = requiredPieces(dimension)
    const candidates = possiblePieceCoordinates(dimension).map(coordinatesToSet)
    console.log(`Examining ${JSON.stringify(dimension)} with ${candidates.length} candidates for ${n} pieces:`)

    const solutions = Array.from(chooseNCollisionFreeSets(candidates, n))
    console.log('solutions:')
    console.log(solutions)
    if (solutions.length > 0) {
      console.log('stopping the search')
      break;
    }
  }
}

type Clause = Array<Number>

const implies = (a: number, b: number): Clause => [a, -b];

const exactlyOne = (...as: Array<number>): Array<Clause> => {
  // No matrix hack; we do it naively for simplicity
  const clauses: Array<Clause> = []

  for (const a of as) {
    for (const b of as.filter(b => b !== a)) {
      clauses.push(implies(a, b))
    }
  }

  return clauses;
}

type Encoding = { cnf: Array<Clause>, varCount: number, getString: (literal: number) => string }

const satEncodeSize = (size: Coordinates): Encoding => {
  const centers = possibleCenterCoordinates(size)
  const centersToNumber: Record<string, number> = Object.fromEntries(centers.map((center, index) => [center, index + 1]))
  const numbersToCenter: Record<number, string> = Object.fromEntries(Object.entries(centersToNumber).map(([center, index]) => [index, center]))

  const namesByCenter: Record<string, Array<string>> = Object.fromEntries(
    centers.map(center => [
      JSON.stringify(center),
      coordinatesForCenter(center, size).map(c => JSON.stringify(c))
    ])
  )

  let centersByField: Record<string, Array<string>> = {}
  Object.entries(namesByCenter).forEach(([center, fields]) => {
    for (const field of fields) {
      const previousCenters = centersByField[field] ?? []
      const nextCenters = previousCenters.includes(center) ? previousCenters : [...previousCenters, center]
      centersByField[field] = nextCenters
    }
  })

  // Each field needs to belong to exactly one center:
  let cnf: Array<Clause> = []
  Object.values(centersByField).forEach(
    (centers) => cnf.push(
      ...exactlyOne(
        ...centers.map(center => centersToNumber[center])
      )
    )
  );

  return { cnf, varCount: centers.length, getString: (literal) => { return numbersToCenter[Math.abs(literal)] } }
}

console.log('satEncodeSize([7, 3, 3]):')
console.log(satEncodeSize([7, 3, 3]))
