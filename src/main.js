import kaplay from "kaplay";
import "kaplay/global";

kaplay({
  width: 1280,
  height: 720,
  background: [0, 255, 0],
  scale: 1,
  letterbox: true,
});

//setting gravity
setGravity(1600);

//ground
const ground = add([
  rect(5000, 48),
  pos(-1000, 672),
  area(),
  color(0, 0, 255),
  body({ isStatic: true }),
]);

//ceiling
const ceiling = add([
  rect(5000, 48),
  pos(-1000, 0),
  area(),
  color(0, 0, 255),
  body({ isStatic: true }),
]);

//sprites
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
loadSprite("spike", "/sprites/smallSpike.png")
loadSprite("longSpike", "/sprites/longSpike.png")

//enemies
let spike = add([
  sprite("spike"),
  area(),
  body({ isStatic: true }),
  pos(400, 640),
  outline(2),
  "smallSpike",
  scale(4)
]);

// FORMULA = 720 - 48 - SPRITE.HEIGHT * SCALE FACTOR

let longSpike = add([
  sprite("longSpike"),
  area(),
  body({ isStatic: true }),
  outline(2),
  "longSpike",
  scale(4),
  pos(450, 612)
])

let blob;
const SPEED = 300;

function spawnBlob() {
  blob = add([
    sprite("smiley", { anim: "idle" }),
    pos(200, 500),
    scale(4),
    area(),
    body(),
    health(3),
    "player",
    rotate(),
  ]);

  const hpText = blob.add([
  text(`${blob.hp}/${blob.maxHP}`, { size: 5 }),
  pos(-40, -50),
  ]);

  blob.onUpdate(() => {
    hpText.text = `${blob.hp}/${blob.maxHP}`;
});



  onKeyPress(["space", "w"], () => {
    if (blob && blob.isGrounded()) {
      blob.jump();
      blob.play("jump");
    }
  });

  blob.onAnimEnd(() => {
    blob.play("idle");
  });

  blob.onCollide("smallSpike", () => {
    blob.hurt(1);
  });

  blob.onCollide("longSpike", () => {
    blob.hurt(3)
  })

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

