class Constraint {
  constructor(p1, p2, bounciness) {
    this.p1 = p1
    this.p2 = p2
    this.bounciness = bounciness
    let dx = this.p2.pos.x - this.p1.pos.x
    let dy = this.p2.pos.y - this.p1.pos.y
    let distance = sqrt(dx*dx + dy*dy)
    
    this.rest_length = distance
  }
  
  update() {
    
    let dx = this.p2.pos.x - this.p1.pos.x
    let dy = this.p2.pos.y - this.p1.pos.y
    let distance = sqrt(dx*dx + dy*dy)
    let difference = distance - this.rest_length
    let percent = difference / distance / (this.bounciness * 2)
    let ox = dx * percent
    let oy = dy * percent
    
    if (this.p1.can_move == true) {
      this.p1.pos.x += ox
      this.p1.pos.y += oy
    }
    if (this.p2.can_move == true) {
      this.p2.pos.x -= ox
      this.p2.pos.y -= oy

    
  }
}
  
  render() {
    strokeWeight(1);
    fill(0, 0, 0);
    line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
  }
}
