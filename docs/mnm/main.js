title = "M N M";

description = `
  [TAP] to \nhit blue notes
`;

characters = [
  `
   p
  p p
  pppp
  p p
  ppp
  `,
  `
   p
  ppp
   p
   p
  p p
  `,
  `
   p
  p
  p
  `,
  `
   p
    p
    p
  `,
  `
   pp
  pppp
  pppp
   pp
  `
];

const G = {
	WIDTH: 100,
  HEIGHT: 120,
  NOTE_SPEED: 0.6,
  NOTE_SPEED_MAX: 1.2,
  HIT_LENGTH: 6,
  RAVE_LENGTH: 50,
  HIT_COOLDOWN: 12
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "crt",
  isPlayingBgm: true,
  seed: 342,
  isReplayEnabled: true
};

/**
* Type defining notes (This helps for debugging)
* @typedef { object } Note - The note objects the player must hit
* @property { Vector } pos - The current position of the object
*/

/**
* @type  { Note [] }
*/
let notesPlayer;

/**
* @type  { Note [] }
*/
let notesOpponent;

/**
 * @typedef {{
 * pos: Vector,
 * }} Player
 */
/**
 * @type { Player }
 */
 let cursor;

let currentNoteSpeed;
let waveCount;
let hitCooldown;
let raveCooldown;
let scoreText;
let scorenum;
let hitting;
let lightPos1;
let lightPos2;

function update() {
    // Before the game starts
    if (!ticks) {
      notesPlayer = [];
      notesOpponent = [];
      currentNoteSpeed = 0;
      waveCount = 0;
      hitCooldown = G.HIT_LENGTH;
      raveCooldown = G.RAVE_LENGTH;
      scoreText = '0';
      scorenum = 0;
      hitting = false;
      lightPos1 = 0;
      lightPos2 = 0;

        // Cursor
        cursor = {
          pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5)
        };
  }

  //Title
  color("light_black")
  text("Monday", 5, 10);
  text("Night", 35, 16);
  text("Movin'", 65, 22);

  //Score
  scoreText = scorenum.toString();
  text(scoreText, 45, 40);
  const barNum = 20 + (scorenum / 5)
  if(barNum < 20) color('light_red');
  else if(barNum > 50) color("light_green");
  else color("light_yellow");
  rect(0, 50, barNum, 6);
  if(scorenum <= -100) {
    end();
  }

  // Player
  color('blue')
  char('a', 80, 100)
  char('b', 79, 105)
  char('c', 77, 105)
  char('d', 81, 105)
  char('c', 78, 109)
  char('d', 80, 109)

  // Opponent
  color('green')
  char('a', 20, 100)
  char('b', 19, 105)
  char('c', 17, 105)
  char('d', 21, 105)
  char('c', 18, 109)
  char('d', 20, 109)

  // Stage
  color("light_cyan");
  rect(0, 111, G.WIDTH, 50);

  //Player control
  if(hitting){
    //Start cooldown
    hitCooldown--;
    // The note hit bar
    // Cursor
    color("light_purple");
    rect(cursor.pos, 2, 2);
    cursor.pos = vec(input.pos.x, input.pos.y);
    //Resetting cooldown
    if(hitCooldown <= 0) {
      hitCooldown = G.HIT_LENGTH;
      hitting = false;
    }
  }
  if (input.isJustPressed && !hitting) {
    // Activate hit
    hitting = true;
  } else if (!hitting){
    // Cursor
    color("purple");
    rect(cursor.pos, 2, 2);
    cursor.pos = vec(input.pos.x, input.pos.y);
  }

  // Hit Bar
  if(waveCount % 2 === 1){ 
    // Opponent's Turn
    color("light_red");
    rect(6,85,25,5);
    rect(21,85,25,5);
    color("red");
    rect(6,84,10,7);
    rect(21,84,10,7);
    rect(36,84,10,7);
  } else { 
    color("light_red");
    const cursorIsTouchingMiddleLeft = rect(66,85,5,5).isColliding.rect.light_purple;
    const cursorIsTouchingRightLeft = rect(81,85,5,5).isColliding.rect.light_purple;
    color("red");
    const cursorIsTouchingLeft = rect(56,84,10,7).isColliding.rect.light_purple;
    const cursorIsTouchingMiddle = rect(71,84,10,7).isColliding.rect.light_purple;
    const cursorIsTouchingRight = rect(86,84,10,7).isColliding.rect.light_purple;
    color("yellow");
    if(cursorIsTouchingMiddleLeft){
      rect(56,85,25,5);
      scorenum -= 2;
    }
    if(cursorIsTouchingRightLeft){
      rect(71,85,25,5);
      scorenum -= 2;
    }
    if(cursorIsTouchingLeft){
      rect(56,84,10,7);
      scorenum -= 1;
    }
    if(cursorIsTouchingMiddle){
      rect(71,84,10,7);
      scorenum -= 1;
    }
    if(cursorIsTouchingRight){
      rect(86,84,10,7);
      scorenum -= 1;
    }
  }
  
  // Remove loop
  if(waveCount % 2 === 1){
    // Opponent's Turn
    remove(notesOpponent, (n) => {
      n.pos.y += currentNoteSpeed;
      color("green");
      const isCollidingWithNoteLine = char('e', n.pos).isColliding.rect.red;
      if(isCollidingWithNoteLine){
        color('light_green');
        particle(n.pos);
        play("laser");
        // Subtract some score unless player is about to loose
        if(scorenum > -80) scorenum -= 5;
      }
      return (isCollidingWithNoteLine);
    })
    if(notesOpponent.length === 0) waveCount++;
  } else {
    // Player's turn
    remove(notesPlayer, (n) => {
      n.pos.y += currentNoteSpeed;
      color("blue");
      const isCollidingWithNoteLine = char('e', n.pos).isColliding.rect.yellow;
      // If you hit the note
      if(isCollidingWithNoteLine){
        color("light_blue");
        particle(n.pos);
        play("select");
        // Add some score
        scorenum += 15;
      }
      // if you miss the note
      if(n.pos.y > 109){
        color("red");
        particle(n.pos);
        // Subtract some score
        scorenum -= 15;
      }
      return (isCollidingWithNoteLine || n.pos.y > 109);
    })
  }

  // Note spawning
  if(notesPlayer.length === 0 && notesOpponent.length === 0){
    if(currentNoteSpeed < G.NOTE_SPEED_MAX) currentNoteSpeed = G.NOTE_SPEED * difficulty;
    var prevNoteY = 0;
    var prevNoteYPattern = 0;
    var prevNoteX = 0;
    for(let i = 0; i < 6 + waveCount; i++){
      // Player
      var tempY = rndi(1,10)
      var tempX = rndi(1,10)
      // Y pos
      var posY = 0;
      if(7 < prevNoteYPattern && prevNoteYPattern <= 9) tempY = 1;
      if(tempY <= 4) { // Normal Note
        posY = -(prevNoteY += 25);
      } else if(tempY <= 7) { // Close Note
        posY = -(prevNoteY += 15);
      } else if(tempY <= 9) { // Double Note
        posY = -(prevNoteY);
      }
      prevNoteYPattern = tempY; // This is to prevent tripple notes
      // X pos
      var posX = 0;
      if(7 < tempY && tempY <= 9){ // If its a double note
        if(prevNoteX == 10) { // Middle
          posX += 25;
          prevNoteX = posX;
        } else { // Right
          posX += 40;
          prevNoteX = posX;
        }
      } else { // If its a normal note
        if(tempX <= 3) { // Left
          posX += 10;
          prevNoteX = posX;
        } else if(tempX <= 6) { // Middle
          posX += 25;
          prevNoteX = posX;
        } else if(tempX <= 9) { // Right
          posX += 40;
          prevNoteX = posX;
        }
      }
      //Load Notes
      notesOpponent.push({ pos: vec(posX, posY)});
      notesPlayer.push({ pos: vec(posX + G.WIDTH/2, posY)});
    }
    waveCount++;
    addScore(1);
  }
}