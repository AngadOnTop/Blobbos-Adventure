import kaplay from "kaplay";
import "kaplay/global";

kaplay({
  width: 1280,
  height: 720,
  background: [255, 255, 255],
  scale: 1,
  letterbox: true,
});

setGravity(1600);
let score = 0;

// UI - Score Text at top middle
const scoreLabel = add([
  text(`Score: ${score}`, { size: 24 }),
  pos(640, 16),
  anchor("center"),
  fixed(),
  z(100),
  color(0, 0, 0),
]);

// Sprites
await loadSprite("smiley", "/sprites/evenBetterSheet.png", {
  sliceX: 13,
  sliceY: 1,
  anims: {
    idle: { from: 0, to: 3, speed: 8, loop: true },
    jump: { from: 4, to: 6, speed: 8, loop: false },
    right: { from: 11, to: 11 },
    left: { from: 12, to: 12 },
  },
});
loadSprite("spike", "/sprites/smallSpike.png");
loadSprite("longSpike", "/sprites/longSpike.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("ground", "/sprites/ground.png");

loadSound("jump", "/sounds/jump.wav");
loadSound("collectingCoin", "/sounds/coin.wav");
loadSound("hit", "/sounds/hit.wav");

// Ground
for (let i = 0; i < 10; i++) {
  add([
    sprite("ground"),
    scale(4),
    outline(2),
    pos(200 + i * 64, 672),
    area(),
    body({ isStatic: true }),
  ]);
}

// Ceiling
add([
  rect(5000, 48),
  pos(-1000, 0),
  area(),
  color(0, 0, 255),
  body({ isStatic: true }),
]);

// Enemies
add([
  sprite("spike"),
  area(),
  body({ isStatic: true }),
  pos(400, 640),
  outline(2),
  "smallSpike",
  scale(4),
]);

add([
  sprite("longSpike"),
  area(),
  body({ isStatic: true }),
  outline(2),
  "longSpike",
  scale(4),
  pos(450, 612),
]);

// Coin
function spawnCoin() {
  const y = 624;
  const coin = add([
    sprite("coin"),
    area(),
    body({ isStatic: true }),
    "coin",
    scale(3),
    pos(rand(200, 800), y),
  ]);

  let goingUp = true;

  // Tween coin up and down in a loop
  coin.onUpdate(() => {
    const offset = goingUp ? -15 : 15;
    tween(
      coin.pos.y,
      coin.pos.y + offset,
      0.8,
      (val) => coin.pos.y = val,
      easings.linear
    ).then(() => goingUp = !goingUp);
  });

  return coin;
}

let coin = spawnCoin()

let blob
const SPEED = 300

function spawnBlob() {
  blob = add([
    sprite("smiley", { anim: "idle" }),
    pos(200, 500),
    scale(4),
    area(),
    body(),
    health(100, 100),
    "player",
    rotate(),
  ]);

  const hpBarBg = blob.add([
    rect(40, 6),
    color(255, 0, 0),
    pos(-14, -20),
    z(1),
  ]);

  const hpBar = blob.add([
    rect(40, 6),
    color(0, 255, 0),
    pos(-14, -20),
    z(2),
  ]);

  const hpText = blob.add([
    text(`${blob.hp()}/${blob.maxHP()}`, { size: 5 }),
    color(0, 0, 0),
    pos(5, -16),
    anchor("center"),
    z(3),
  ]);

  blob.onUpdate(() => {
    const ratio = blob.hp() / blob.maxHP();
    hpBar.width = 40 * ratio;
    hpText.text = `${Math.max(blob.hp(), 0)}/${blob.maxHP()}`;
  });

  onKeyPress(["space", "w"], () => {
    if (blob && blob.isGrounded()) {
      blob.jump();
      blob.play("jump");
      play("jump");
    }
  });

  blob.onAnimEnd(() => {
    blob.play("idle");
  });

  blob.onCollide("smallSpike", () => {
    blob.hurt(5);
    play("hit");
  });

  blob.onCollide("longSpike", () => {
    blob.hurt(10);
    play("hit");
  });

  blob.onCollide("coin", (c) => {
    destroy(c);
    score += 1;
    scoreLabel.text = `Score: ${score}`;
    play("collectingCoin");
    coin = spawnCoin();
  });

  blob.onDeath(() => {
    destroy(blob);
    blob = null;
  });
}

spawnBlob();

onKeyDown("d", () => {
  if (blob) {
    blob.play("right");
    blob.move(SPEED, 0);
  }
});

onKeyDown("a", () => {
  if (blob) {
    blob.play("left");
    blob.move(-SPEED, 0);
  }
});

onUpdate(() => {
  if (!blob) return;

  if (blob.pos.y > 1000 || blob.pos.y < 0) {
    destroy(blob);
    blob = null;
    spawnBlob();
    return;
  }

  setCamPos(blob.pos);
});

const respawnBtn = add([
  text("Respawn", { size: 32 }),
  pos(640, 300),
  anchor("center"),
  area(),
  color(0, 0, 0),
]);

respawnBtn.onClick(() => {
  if (!blob) {
    spawnBlob();
  }
});
