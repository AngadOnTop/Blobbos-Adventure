import kaplay from "kaplay";
import "kaplay/global";

kaplay({
  width: 1280,
  height: 720,
  background: [0, 255, 0],
  scale: 1,
  letterbox: true,
});

setGravity(1600);

const ground = add([
  rect(5000, 48),
  pos(-1000, 672),
  area(),
  color(0, 0, 255),
  body({ isStatic: true }),
]);

const ceiling = add([
  rect(5000, 48),
  pos(-1000, 0),
  area(),
  color(0, 0, 255),
  body({ isStatic: true }),
]);

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

onUpdate(() => {
  if (!blob) return;

  if (blob.pos.y > 1000 || blob.pos.y < 0) {
    destroy(blob);
    blob = null;
    spawnBlob();
    return;
  }

  setCamPos(blob.pos);

  if (isKeyDown("d")) {
    blob.play("right");
    blob.move(SPEED, 0);
  } else if (isKeyDown("a")) {
    blob.play("left");
    blob.move(-SPEED, 0);
  }
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

