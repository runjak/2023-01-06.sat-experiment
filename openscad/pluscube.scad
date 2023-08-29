smallCube = 1;
bigCube = 7 * smallCube;
toothPadding = 0.9; // making teeth smaller by a factor
holePadding = 1.1; // making holes larger by a factor

module hole() {
  h = holePadding * smallCube;
  d = (smallCube - h) / 2;

  translate([d, d, d])
  cube([h, h, h]);
}

module yTooth() {
  t = toothPadding * smallCube;
  d = (smallCube - t) / 2;

  translate([d, 0, d])
  cube([t, smallCube, t]);
}

module xTooth() {
  t = toothPadding * smallCube;
  d = (smallCube - t) / 2;

  translate([0, d, d])
  cube([smallCube, t, t]);
}

module zTooth() {
  t = toothPadding * smallCube;
  d = (smallCube - t) / 2;

  translate([d, d, 0])
  cube([t, t, smallCube]);
}

module plusCube(front = false, back = false, left = false, right = false, top = false, bottom = false) {
  // translate([-bigCube/2, -bigCube/2, -bigCube/2])
  
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

    if( front){
      translate([0, -1, 6]) yTooth();
      translate([2, -1, 5]) yTooth();
      translate([4, -1, 4]) yTooth();
      translate([6, -1, 3]) yTooth();
      translate([1, -1, 2]) yTooth();
      translate([3, -1, 1]) yTooth();
      translate([5, -1, 0]) yTooth();
    }

    if( back){
      translate([6, 7, 5]) yTooth();
      translate([5, 7, 2]) yTooth();
      translate([4, 7, 6]) yTooth();
      translate([3, 7, 3]) yTooth();
      translate([2, 7, 0]) yTooth();
      translate([1, 7, 4]) yTooth();
      translate([0, 7, 1]) yTooth();
    }

    if( left){
      translate([-1, 6, 1]) xTooth();
      translate([-1, 5, 3]) xTooth();
      translate([-1, 4, 5]) xTooth();
      translate([-1, 3, 0]) xTooth();
      translate([-1, 2, 2]) xTooth();
      translate([-1, 1, 4]) xTooth();
      translate([-1, 0, 6]) xTooth();
    }

    if( right){
      translate([7, 0, 3]) xTooth();
      translate([7, 1, 1]) xTooth();
      translate([7, 2, 6]) xTooth();
      translate([7, 3, 4]) xTooth();
      translate([7, 4, 2]) xTooth();
      translate([7, 5, 0]) xTooth();
      translate([7, 6, 5]) xTooth();
    }

    if( top){
      translate([0, 0, 7]) zTooth();
      translate([1, 5, 7]) zTooth();
      translate([2, 3, 7]) zTooth();
      translate([3, 1, 7]) zTooth();
      translate([4, 6, 7]) zTooth();
      translate([5, 4, 7]) zTooth();
      translate([6, 2, 7]) zTooth();
    }

    if( bottom){
      translate([0, 3, -1]) zTooth();
      translate([1, 1, -1]) zTooth();
      translate([2, 6, -1]) zTooth();
      translate([3, 4, -1]) zTooth();
      translate([4, 2, -1]) zTooth();
      translate([5, 0, -1]) zTooth();
      translate([6, 5, -1]) zTooth();
    }
  }
}

module demo() {
  plusCube(front=true, back=true, left=true, right=true, top=true, bottom=true);
}

module main() {
  shift = 2 * bigCube;

  for (z = [0:2]) {
    for (y = [0:2]) {
      for (x = [0:2]) {
        front = (y != 0);
        back = (y != 2);
        left = (x != 0);
        right = (x != 2);
        bottom = (z != 0);
        top = (z != 2);

        translate([x * shift, y * shift, z * shift]) plusCube(front, back, left, right, top, bottom);
      }
    }
  }
}

demo();
// Bmain();