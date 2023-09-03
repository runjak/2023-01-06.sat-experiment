smallCube = 1;
bigCube = 7 * smallCube;
toothPadding = 0.9; // making teeth smaller by a factor
holePadding = 1.1; // making holes larger by a factor
generateTarget = 0; // 0..26
toScale = 1;

module hole() {
  h = holePadding * smallCube;
  d = (smallCube - h) / 2;

  translate([d, d, d])
  cube([h, h, h]);
}

function getPadding(x) = (x == 0 || x == 6) ? (toothPadding/2 + 0.5) : toothPadding;

function paddings(x, y, z) =
  let (
    isY = (y == -1 || y == 7) // front or back
  , isX = (x == -1 || x == 7) // left or right
  // isZ (z == -1 || z == 7) implicit bottom or top
  , yPadding = [getPadding(x), 1, getPadding(z)]
  , xPadding = [1, getPadding(y), getPadding(z)]
  , zPadding = [getPadding(x), getPadding(y), 1]
  )
  isY ? yPadding : (isX ? xPadding : zPadding);

function getShift(x) = let (
    fullShift = 1 - smallCube * toothPadding  
  , halfShift = fullShift / 2
  ) (x == 0) ? 0 : (halfShift);

function shifts(x,y,z) =
  let (
    isY = (y == -1 || y == 7) // front or back
  , isX = (x == -1 || x == 7) // left or right
  // isZ (z == -1 || z == 7) implicit bottom or top
  , yShift = [getShift(x), 0, getShift(z)]
  , xShift = [0, getShift(y), getShift(z)]
  , zShift = [getShift(x), getShift(y), 0]
  )
  isY ? yShift : (isX ? xShift : zShift);

module tooth(x, y, z) {
  ps = paddings(x,y,z);

  translate([x,y,z]) translate(shifts(x,y,z))  cube([smallCube * ps[0], smallCube * ps[1], smallCube * ps[2]]);
}

module plusCube(x, y, z) {
  front = (y != 0);
  back = (y != 2);
  left = (x != 0);
  right = (x != 2);
  bottom = (z != 0);
  top = (z != 2);

  scale(toScale)
  union() {
    difference() {
      cube([bigCube, bigCube, bigCube]);

      if (front) {
        translate([6, 0, 5]) hole();
        translate([5, 0, 2]) hole();
        translate([4, 0, 6]) hole();
        translate([3, 0, 3]) hole();
        translate([2, 0, 0]) hole();
        translate([1, 0, 4]) hole();
        translate([0, 0, 1]) hole();
      }

      if (back) {
        translate([0, 6, 6]) hole();
        translate([2, 6, 5]) hole();
        translate([4, 6, 4]) hole();
        translate([6, 6, 3]) hole();
        translate([1, 6, 2]) hole();
        translate([3, 6, 1]) hole();
        translate([5, 6, 0]) hole();
      }

      if (left) {
        translate([0, 0, 3]) hole();
        translate([0, 1, 1]) hole();
        translate([0, 2, 6]) hole();
        translate([0, 3, 4]) hole();
        translate([0, 4, 2]) hole();
        translate([0, 5, 0]) hole();
        translate([0, 6, 5]) hole();
      }

      if (right) {
        translate([6, 6, 1]) hole();
        translate([6, 5, 3]) hole();
        translate([6, 4, 5]) hole();
        translate([6, 3, 0]) hole();
        translate([6, 2, 2]) hole();
        translate([6, 1, 4]) hole();
        translate([6, 0, 6]) hole();
      }

      if (top) {
        translate([0, 3, 6]) hole();
        translate([1, 1, 6]) hole();
        translate([2, 6, 6]) hole();
        translate([3, 4, 6]) hole();
        translate([4, 2, 6]) hole();
        translate([5, 0, 6]) hole();
        translate([6, 5, 6]) hole();
      }

      if (bottom) {
        translate([0, 0, 0]) hole();
        translate([1, 5, 0]) hole();
        translate([2, 3, 0]) hole();
        translate([3, 1, 0]) hole();
        translate([4, 6, 0]) hole();
        translate([5, 4, 0]) hole();
        translate([6, 2, 0]) hole();
      }
    }

    if (front) {
      tooth(0, -1, 6);
      tooth(2, -1, 5);
      tooth(4, -1, 4);
      tooth(6, -1, 3);
      tooth(1, -1, 2);
      tooth(3, -1, 1);
      tooth(5, -1, 0);
    }

    if (back) {
      tooth(6, 7, 5);
      tooth(5, 7, 2);
      tooth(4, 7, 6);
      tooth(3, 7, 3);
      tooth(2, 7, 0);
      tooth(1, 7, 4);
      tooth(0, 7, 1);
    }

    if (left) {
      tooth(-1, 6, 1);
      tooth(-1, 5, 3);
      tooth(-1, 4, 5);
      tooth(-1, 3, 0);
      tooth(-1, 2, 2);
      tooth(-1, 1, 4);
      tooth(-1, 0, 6);
    }

    if (right) {
      tooth(7, 0, 3);
      tooth(7, 1, 1);
      tooth(7, 2, 6);
      tooth(7, 3, 4);
      tooth(7, 4, 2);
      tooth(7, 5, 0);
      tooth(7, 6, 5);
    }

    if (top) {
      tooth(0, 0, 7);
      tooth(1, 5, 7);
      tooth(2, 3, 7);
      tooth(3, 1, 7);
      tooth(4, 6, 7);
      tooth(5, 4, 7);
      tooth(6, 2, 7);
    }

    if (bottom) {
      tooth(0, 3, -1);
      tooth(1, 1, -1);
      tooth(2, 6, -1);
      tooth(3, 4, -1);
      tooth(4, 2, -1);
      tooth(5, 0, -1);
      tooth(6, 5, -1);
    }
  }
}

module demo() {
  plusCube(1,1,1);
}

module main() {
  shift = 2 * bigCube;

  for (z = [0:2]) {
    for (y = [0:2]) {
      for (x = [0:2]) {
        translate([x * shift, y * shift, z * shift]) plusCube(x,y,z);
      }
    }
  }
}

module generateParts() {
  // Dirty loop structure because apparently I can't modulo today o.O
  for (z = [0:2]) {
    for (y = [0:2]) {
      for (x = [0:2]) {
        targetCandidate = z * 9 + y * 3 + x;
        if (targetCandidate == generateTarget) {
          plusCube(x, y, z);
        }
      }
    }
  }
}

// demo();
// main();
generateParts();