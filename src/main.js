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

await loadSprite("spike", "/sprites/smallSpike.png")

let spike = add([
  sprite("spike"),
  area(),
  body({ isStatic: false }),
  pos(400, 200),
  outline(2),
  "enemy"
]);d

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

  blob.onCollide("enemy", () => {
    blob.hurt(1);
  });

  blob.onDeath(() => {
    destroy(blob);
    blob = null;
  });
}

spawnBlob();

let isGravityFlipped = false

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
  if (isKeyDown("g")) {
    isGravityFlipped = !isGravityFlipped
    setGravity(isGravityFlipped ? -1600 : 1600)
    if (isGravityFlipped) {
      blob.angle = 180
   } else {
      blob.angle = 0
}
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
