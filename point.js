const bounce_friction = 0
const air_resistance = 0.99
const gravity = 0.9


class Point {
  constructor(x, y, mass, can_move) {
    this.pos = createVector(x, y)
    this.prev_pos = createVector(x, y)
    this.can_move = can_move
    this.mass = mass
    this.r = 2
  }
  
  update() {
    if (this.can_move == true) {
    
    let vx = (this.pos.x - this.prev_pos.x) * air_resistance
    let vy = (this.pos.y - this.prev_pos.y) * air_resistance
    
    
    this.prev_pos.x = this.pos.x
    this.prev_pos.y = this.pos.y

    this.pos.x += vx
    this.pos.y += vy
    this.pos.y += gravity
    }
  }
  
  render() {
    strokeWeight(0);
    fill(255, 0, 0);
    ellipse(this.pos.x, this.pos.y, this.r*2)
  }
  
  edges() {
    if (this.pos.x + this.r > width) {
      
      this.prev_pos.x = (width - this.r) + (this.pos.x - this.prev_pos.x) * bounce_friction
      this.pos.x = width - this.r
    
    } else if (this.pos.x - this.r < 0) {
      
      this.prev_pos.x = this.r + (this.pos.x - this.prev_pos.x) * bounce_friction
      this.pos.x = this.r
    
    }
    
    
    if (this.pos.y + this.r > width) {
      
      this.prev_pos.y = (width - this.r) + (this.pos.y - this.prev_pos.y) * bounce_friction
      this.pos.y = width - this.r
    
    } else if (this.pos.y - this.r < 0) {
      
      this.prev_pos.y = this.r + (this.pos.y - this.prev_pos.y) * bounce_friction
      this.pos.y = this.r
    
    }
  }
}
