// npx zx ./build.js
// https://github.com/google/zx

const fileName = (generateTarget) =>
  `pluscube_${`0${generateTarget}`.slice(-2)}.stl`

const generate = (generateTarget, smallCube) =>
  $`openscad -D smallCube=${smallCube} -D generateTarget=${generateTarget} -o ${fileName(generateTarget)} pluscube.scad`

for (let i = 0; i < 27; i++) {
  generate(i, 3);
}
