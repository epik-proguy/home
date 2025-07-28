
// canvas setup
const canvas = document.getElementById('canvas');
canvas.focus();
const ctx = canvas.getContext('2d');

let selected_tile_text = document.getElementById("selectedTile")

let editor_div = document.getElementById("editor_div")
let wall_button = document.getElementById("wall")
let eraser_button = document.getElementById("eraser")
let wire_button = document.getElementById("wire")
let switch_button = document.getElementById("switch")
let inverter_button = document.getElementById("inverter")
let lamp_button = document.getElementById("lamp")
let delay_button = document.getElementById("delay")


editor_div.style.visibility = "hidden";

var window_width = window.innerWidth - 15;
var window_height = window.innerHeight - 20;
canvas.width = window_width;
canvas.height = window_height;
canvas.style.background = "white";

const tile_size = 50;
let grid_width = 300;      //Math.floor(window_width / tile_size)
let grid_height = 50;      //Math.floor(window_height / tile_size)

const GRAVITY = 0.15;
let player_friction = 0.95;
let player_speed = 0.2;
let player_width = 40;
let player_height = 45;
const JUMP_HOLD_MAX = 8; // how long jump can be held (in frames)
const JUMP_FORCE = 0.6;  // how strong jump is per frame held
const editor_speed = 3;
const CAM_glide = 20;
const player_reset_y = 100;

let player_x = (grid_width*tile_size) / 2;
let player_y = 0;
let CAM_X = player_x;
let CAM_Y = player_y;
let editor_mode = false;
let selected_tile = 1;
let selected_tile_name = "wall";
let selected_rotation = 90;
let player_vx = 0;
let player_vy = 0;
let k_w = 0;
let k_a = 0;
let k_s = 0;
let k_d = 0;
let player_gravity = 0;
let is_on_ground = false;
let is_jumping = false;
let jump_time = 0;
let mouse_down = false;
let mouse_x = 0;
let mouse_y = 0;


wall_button.addEventListener('click', function() {
    selected_tile = 1; selected_tile_name = "wall";
});

eraser_button.addEventListener('click', function() {
    selected_tile = 0; selected_tile_name = "eraser";
});

wire_button.addEventListener('click', function() {
    selected_tile = 2; selected_tile_name = "wire";
});

switch_button.addEventListener('click', function() {
    selected_tile = 3; selected_tile_name = "switch";
});

inverter_button.addEventListener('click', function() {
    selected_tile = 4; selected_tile_name = "inverter";
});

lamp_button.addEventListener('click', function() {
    selected_tile = 5; selected_tile_name = "lamp";
});

delay_button.addEventListener('click', function() {
    selected_tile = 6; selected_tile_name = "delay";
});

function randInt(min, max) {
  min = Math.ceil(min); // ensure min is an integer
  max = Math.floor(max); // ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


grid = []
for (let px = 0; px <= grid_width; px++) {
    grid.push([])
    for (let py = 0; py <= grid_height; py++) {
        
        tile = new Tile(0, px, py)
        if (py < 10) {
            grid[px].push(tile)
        } else { 
            tile.type = 1
            tile.update()
            grid[px].push(tile)
        }
    }
}


function drawTile(tile, x, y, transparency) {
    ctx.globalAlpha = transparency;
    ctx.fillStyle = tile.color
    ctx.fillRect(x, y, tile_size, tile_size)
                
    if (tile.hasOwnProperty("image")) {
        let temp = tile.image
    
        var x = world_x + (tile_size/2);
        var y = world_y + (tile_size/2);
        var width = tile_size;
        var height = tile_size;
        
        let angle;
        if (tile.type != 6) {
            angle = (tile.rotation - 90) * (Math.PI / 180)
        } else {
            angle = Math.PI
        }

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(temp, -width / 2, -height / 2, width, height);
        ctx.rotate(-angle);
        ctx.translate(-x, -y);
        ctx.globalAlpha = 1;
        //ctx.drawImage(temp, world_x, world_y, tile_size, tile_size)
    }
}

function render_grid() {
    for (let px = 0; px <= grid_width; px++) {
        for (let py = 0; py <= grid_height; py++) {
            tile = grid[px][py]

            x = tile.x
            y = tile.y
            world_x = Math.floor(x * tile_size - CAM_X)
            world_y = Math.floor(y * tile_size - CAM_Y)
            
            if (world_x + tile_size > 0 && world_x < window_width && world_y + tile_size > 0 && world_y < window_height) {
                drawTile(tile, world_x, world_y, 1);

            }
        }
    }       
}

function player() {
    
    //player_gravity += GRAVITY
    
    // apply gravity and movement
    player_vy += GRAVITY
    
    ctx.globalAlpha = 0.5; // set transparency to 50% if in editor mode

    if (!editor_mode) {
        ctx.globalAlpha = 1; // back to normal if not
        
        player_vx += k_d * player_speed
        player_vx -= k_a * player_speed
    
        if (is_on_ground && k_w == 1 && !is_jumping) {
            player_vy -= 2
            is_jumping = true;
            jump_time = 0;
        }

        if (is_jumping) {
            if (k_w === 1 && jump_time < JUMP_HOLD_MAX) {
                player_vy -= JUMP_FORCE;
                jump_time++;
            } else {
                is_jumping = false;
            }
        }
    }

    // apply horizontal movement first
    player_x += player_vx
    resolve_collision_x()

    // then vertical movement
    player_y += player_vy // + player_gravity
    resolve_collision_y()

    // friction
    player_vx *= player_friction
    //player_vy *= player_friction

    // render player
    ctx.fillStyle = "blue"
    ctx.fillRect(player_x - CAM_X, player_y - CAM_Y, player_width, player_height)
    ctx.globalAlpha = 1;
}

function is_tile_in_bounds(x, y) {
    if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) {
        return false; // treat out-of-bounds as empty
    } else {
        return true; // is in bounds
    }
};


function is_tile_solid(x, y) {
    if (!is_tile_in_bounds(x, y)) {
        return false;
    }
    return grid[x][y].is_collideable;
};



function get_grid_pos(x, y) {
    return [Math.floor(x/tile_size), Math.floor(y/tile_size)]
};


function resolve_collision_x() {
    const offset = 0.1;

    let left_top = get_grid_pos(player_x, player_y + offset);
    let left_bottom = get_grid_pos(player_x, player_y + player_height - offset);

    let right_top = get_grid_pos(player_x + player_width, player_y + offset);
    let right_bottom = get_grid_pos(player_x + player_width, player_y + player_height - offset);

    // Left wall collision
    if (is_tile_solid(left_top[0], left_top[1]) || is_tile_solid(left_bottom[0], left_bottom[1])) {
        let tile_world_x = (left_top[0] + 1) * tile_size;
        player_x = tile_world_x;
        player_vx = 0;
    }

    // Right wall collision
    if (is_tile_solid(right_top[0], right_top[1]) || is_tile_solid(right_bottom[0], right_bottom[1])) {
        let tile_world_x = right_top[0] * tile_size;
        player_x = tile_world_x - player_width;
        player_vx = 0;
    }
};


function resolve_collision_y() {
    is_on_ground = false
    const offset = 0.1;

    let top_left = get_grid_pos(player_x + offset, player_y);
    let top_right = get_grid_pos(player_x + player_width - offset, player_y);

    let bottom_left = get_grid_pos(player_x + offset, player_y + player_height);
    let bottom_right = get_grid_pos(player_x + player_width - offset, player_y + player_height);

    // Ceiling collision
    if (is_tile_solid(top_left[0], top_left[1]) || is_tile_solid(top_right[0], top_right[1])) {
        let tile_world_y = (top_left[1] + 1) * tile_size;
        player_y = tile_world_y;
        player_vy = 0;
    }

    // Ground collision
    if (is_tile_solid(bottom_left[0], bottom_left[1]) || is_tile_solid(bottom_right[0], bottom_right[1])) {
        let tile_world_y = bottom_left[1] * tile_size;
        player_y = tile_world_y - player_height;
        player_vy = 0;
        is_on_ground = true
    }
};
    



document.addEventListener('keydown', function(event) {
        // get all four directional inputs
        switch (event.key) {
            case "w":
            case " ":
            case "ArrowUp":
                //console.log("w_down")
                k_w = 1
                break;
            case "a":
            case "ArrowLeft":
                //console.log("a_down")
                k_a = 1
                break;
            case "s":
            case "ArrowDown":
                //console.log("s_down")
                k_s = 1
                break;
            case "d":
            case "ArrowRight":
                //console.log("d_down")
                k_d = 1
                break;
        }

        // prevent default browser actions for certain keys (e.g., arrow keys scrolling)
        event.preventDefault();
});

document.addEventListener('keyup', function(event) {
    switch (event.key) {
    case "w":
    case " ":
    case "ArrowUp":
        //console.log("w_up")
        k_w = 0
        break;
    case "a":
    case "ArrowLeft":
        //console.log("a_up")
        k_a = 0
        break;
    case "s":
    case "ArrowDown":
        //console.log("s_up")
        k_s = 0
        break;
    case "d":
    case "ArrowRight":
        //console.log("d_up")
        k_d = 0
        break;
    
    case "e":
        if (editor_mode) {
            editor_mode = false
        } else {
            editor_mode = true
        }
        break;
    
    case "r":
        if (editor_mode) {

            if (selected_rotation == 90) {
                selected_rotation = 180;
                
            } else if (selected_rotation == 180) {
                selected_rotation = -90;
                
            } else if (selected_rotation == -90) {
                selected_rotation = 0;
                
            } else if (selected_rotation == 0) {
                selected_rotation = 90;
            }
            //console.log(selected_rotation)
        }
    }
});

canvas.addEventListener('mousedown', function(event) {
    if (event.button == 0) {
        mouse_down = true;
    }
});

canvas.addEventListener('mouseup', function(event) {
    let select_x = get_grid_pos(mouse_x + CAM_X, mouse_y + CAM_Y)[0];
    let select_y = get_grid_pos(mouse_x + CAM_X, mouse_y + CAM_Y)[1];
    let target = grid[select_x][select_y]

    if (target.type == 3 && !editor_mode) {
        
        if (target.is_powered) {
            target.is_powered = false;
            target.color = "#906500ff"
        } else {
            target.is_powered = true;
            target.color = "#ffb300ff"
        }
    }
    
    if (event.button == 0) {
        mouse_down = false;
    }
});

canvas.addEventListener('mousemove', function getMousePos(event) {
    const rect = canvas.getBoundingClientRect(); // get canvas position and size
    mouse_x = event.clientX - rect.left; // calculate X relative to canvas
    mouse_y = event.clientY - rect.top; // calculate Y relative to canvas
        
});


function editor_place() {
    if (editor_mode) {
        
        let mouse_tile_pos = get_grid_pos(mouse_x + CAM_X, mouse_y + CAM_Y)
        x = mouse_tile_pos[0]
        y = mouse_tile_pos[1]
        world_x = Math.floor(x * tile_size - CAM_X)
        world_y = Math.floor(y * tile_size - CAM_Y)
        
        if (is_tile_in_bounds(mouse_tile_pos[0], mouse_tile_pos[1])) {
            let ghost = new Tile(selected_tile, mouse_tile_pos[0], mouse_tile_pos[1])
            ghost.update()
            ghost.rotation = selected_rotation;

            drawTile(ghost, world_x, world_y, 0.5);
            
            if (mouse_down) {   
                
                tile = grid[mouse_tile_pos[0]][mouse_tile_pos[1]]
                let new_tile = new Tile(selected_tile, tile.x, tile.y)
                new_tile.rotation = selected_rotation;
                grid[mouse_tile_pos[0]][mouse_tile_pos[1]] = new_tile;
        }
    }
}
};
 
function reset_player_check() {
    if (get_grid_pos(player_x, player_y)[1] > player_reset_y) {
        player_x = (grid_width*tile_size) / 2;
        player_y = 0;
        player_vy = -7;
        CAM_X = player_x - (window_width/2);
        CAM_Y = player_y - (window_height/2);
    }
};


function is_tile_being_powered(px, py) {
    tile = grid[px][py];
    let tile_powered = false;
                
    if (!is_tile_in_bounds(px-1, py)) {
        return false;
    }
    let left = grid[px-1][py];
    
    if (!is_tile_in_bounds(px+1, py)) {
    return false;
    }
    let right = grid[px+1][py];
    
    if (!is_tile_in_bounds(px, py-1)) {
    return false;
    }
    let up = grid[px][py-1];
    
    if (!is_tile_in_bounds(px-1, py+1)) {
    return false;
    }
    let down = grid[px][py+1];
    


    if (tile.type == 6) {
        
        if ((left.rotation == 90 || (left.type == 3 || left.type == 6)) && left.is_powered && tile.rotation != -90) {
            tile_powered = true;
        } else if ((right.rotation == -90 || (right.type == 3 || right.type == 6)) && right.is_powered && tile.rotation != 90) {
            tile_powered = true;
        } else if ((up.rotation == 180 || (up.type == 3 || up.type == 6)) && up.is_powered && tile.rotation != 0) {
            tile_powered = true;
        } else if ((down.rotation == 0 || (down.type == 3 || down.type == 6)) && down.is_powered && tile.rotation != 180) {
           tile_powered = true;
}
    } else {

        if ((left.rotation == 90 || (left.type == 3 || left.type == 5 || left.type == 6)) && left.is_powered && tile.rotation != -90) {
            tile_powered = true;
        } else if ((right.rotation == -90 || (right.type == 3 || right.type == 5 || right.type == 6)) && right.is_powered && tile.rotation != 90) {
            tile_powered = true;
        } else if ((up.rotation == 180 || (up.type == 3 || up.type == 5 || up.type == 6)) && up.is_powered && tile.rotation != 0) {
            tile_powered = true;
        } else if ((down.rotation == 0 || (down.type == 3 || down.type == 5 || down.type == 6)) && down.is_powered && tile.rotation != 180) {
            tile_powered = true;
        }
    }
    
    
    return tile_powered;
}

function update_wires() {
    for (let px = 0; px <= grid_width; px++) {
        for (let py = 0; py <= grid_height; py++) {
            tile = grid[px][py]
            
            if (tile.type == 2) {

                if (is_tile_being_powered(px, py)) {
                    tile.is_powered = true;
                    tile.color = "#ff0000ff";
                } else {
                    tile.is_powered = false;
                    tile.color = "#bb0202ff";
                }
            } else if (tile.type == 4) {
                
                if (is_tile_being_powered(px, py)) {
                    tile.is_powered = false;
                    tile.color = "#00269aff";
                } else {
                    tile.is_powered = true;
                    tile.color = "#0040ffff";
                }
            } else if (tile.type == 5) {
            
                let left = grid[px-1][py];
                let right = grid[px+1][py];
                let up = grid[px][py-1];
                let down = grid[px][py+1];
                
                let left_check = (left.is_powered && left.type != 5 && (left.rotation == 90 || left.type == 3 || left.type == 6))
                let right_check = (right.is_powered && right.type != 5 && (right.rotation == -90 || right.type == 3 || right.type == 6))
                let up_check = (up.is_powered && up.type != 5 && (up.rotation == 180 || up.type == 3 || up.type == 6))
                let down_check = (down.is_powered && down.type != 5 && (down.rotation == 0 || down.type == 3 || down.type == 6))
                
                if (left_check || right_check || up_check || down_check) {
                    tile.is_powered = true;
                    tile.color = "#f0d000ff";
                    tile.image.src = "images/glow.png";
                } else {
                    tile.is_powered = false;
                    tile.color = "#535353ff";
                    tile.image.src = "images/empty.png";
                }
            }
        }
    }
}

function delay_logic() {
    for (let px = 0; px <= grid_width; px++) {
        for (let py = 0; py <= grid_height; py++) {
            tile = grid[px][py];
            
            if (tile.type == 6) {
                
                
                if (tile.is_powered) {
                    tile.color = "#02f00aff";
                } else {
                    tile.color = "#2e6030ff";
                }
                
                
                if (tile.future_state == tile.is_powered) {
                    if (is_tile_being_powered(px, py)) {
                        tile.future_state = true;
                        tile.time = tile.cooldown;
                    } else {
                        tile.future_state = false;
                        tile.time = tile.cooldown;
                    }
                }   
                
                
                if (tile.time < 1) {
                    tile.is_powered = tile.future_state;
                    tile.time = 0;
                } else {
                    tile.time -= 1;
                }
            }
        }
    }
}


function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (!editor_mode) {
        editor_div.style.visibility = "hidden";
        CAM_X += ((player_x - (window_width/2)) - CAM_X) / CAM_glide
        CAM_Y += ((player_y - (window_height/2)) - CAM_Y) / CAM_glide
    } else {
        editor_div.style.visibility = "visible";
        CAM_X += k_d * editor_speed
        CAM_X -= k_a * editor_speed
        CAM_Y += k_s * editor_speed
        CAM_Y -= k_w * editor_speed
        selected_tile_text.innerHTML = selected_tile_name
    }
    //editor_place()
    delay_logic()
    update_wires()
    render_grid()
    editor_place()
    player()
    reset_player_check()
    requestAnimationFrame(loop)
}

loop()
