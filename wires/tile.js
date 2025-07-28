// type 0 is air
// type 1 is wall
// type 2 is wire
// type 3 is switch
// type 4 is inverter
// type 5 is lamp
// type 6 is delay


class Tile {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.update()
    }

    update() {
        switch (this.type) {
            case 0:
                this.is_collideable = false
                this.color = "#ffffffff"
                break;
            case 1:
                this.is_collideable = true
                this.color = "#000000ff"
                break;
            case 2:
                this.is_collideable = false
                this.color = "#bb0202ff"
                this.image = new Image
                this.image.src = "images/arrow.png"
                this.rotation = 90;
                this.is_powered = false
                break;

            case 3:
                this.is_collideable = true
                this.color = "#906500ff"
                this.is_powered = false
                break;
            case 4:
                this.is_collideable = false
                this.color = "#00269aff"
                this.image = new Image
                this.image.src = "images/arrow.png"
                this.rotation = 90;
                this.is_powered = false
                break;
            case 5:
                this.is_collideable = true
                this.color = "#535353ff"
                this.image = new Image
                this.image.src = "images/empty.png"
                this.is_powered = false;
                break;
            case 6:
                this.is_collideable = false
                this.color = "#2e6030ff"
                this.image = new Image
                this.image.src = "images/hourglass.png"
                this.is_powered = false;
                this.time = 0;
                this.future_state = false;
                this.cooldown = 30;
                break;
        }
    }
}
