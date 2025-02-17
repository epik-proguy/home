let points = []
let constraints = []
const sub_steps = 2

function setup() {
  createCanvas(400, 400);
  points.push(new Point(20, 20, 1, true))
  points.push(new Point(40, 20, 1, true))
  points.push(new Point(40, 40, 1, true))
  points.push(new Point(20, 40, 1, true))
  constraints.push(new Constraint(points[0], points[1], 1))
  constraints.push(new Constraint(points[1], points[2], 1))
  constraints.push(new Constraint(points[2], points[3], 1))
  constraints.push(new Constraint(points[3], points[0], 1))
  constraints.push(new Constraint(points[0], points[2], 1))
  constraints.push(new Constraint(points[1], points[3], 1))
  
  points.push(new Point(20, 60, 1, true))
  points.push(new Point(20, 80, 1, true))
  points.push(new Point(20, 100, 1, false))
  constraints.push(new Constraint(points[0], points[4], 1))
  constraints.push(new Constraint(points[4], points[5], 1))
  constraints.push(new Constraint(points[5], points[6], 1))
  
  


}

function main() {
  for (let p of points) {
    p.update()
  }
  
  for (let i = 0; i <= sub_steps; i++) {
    for (let p of points) {
      p.edges()
    }
  
    for (let c of constraints) {
      c.update()
    }
  }

  for (let p of points) {
      p.render()
    }
  
  for (let c of constraints) {
    c.render()
  }
}

function draw() {
  background(220);
  main()
  
  if (mouseIsPressed) {
    points[6].pos.set(mouseX, mouseY);
    points[6].prev_pos.set(mouseX, mouseY)
  }
}
