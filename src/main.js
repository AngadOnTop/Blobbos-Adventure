import kaplay from "kaplay"
import "kaplay/global"

kaplay({
  width: 1280,
  height: 720,
  background: [0, 0, 0],
  letterbox: true,
})

let gameStarted = false
let blob = null
const SPEED = 300

// Load assets
await Promise.all([
  loadSprite("smiley", "/sprites/evenBetterSheet.png", {
    sliceX: 13,
    sliceY: 1,
    anims: {
      idle: { from: 0, to: 3, speed: 8, loop: true },
      jump: { from: 4, to: 7, speed: 8, loop: false },
      right: { from: 11, to: 11 },
      left: { from: 12, to: 12 },
    },
  }),
  loadSprite("spike", "/sprites/smallSpike.png"),
  loadSprite("longSpike", "/sprites/longSpike.png"),
  loadSprite("coin", "/sprites/coin.png"),
  loadSprite("ground", "/sprites/ground.png"),
  loadSprite("background", "/sprites/background.jpg"),
  loadSprite("blobbo", "/sprites/BLOBBO'S.png"),
  loadSprite("adventure", "/sprites/ADVENTURE.png"),
  loadSprite("start", "/sprites/start.png"),
  loadSound("jump", "/sounds/jump.wav"),
  loadSound("collectingCoin", "/sounds/coin.wav"),
  loadSound("hit", "/sounds/hit.wav"),
  loadSound("death", "/sounds/death.wav"),
  loadSound("music", "/sounds/music.mp3"),
])

function showMainMenu() {
  play("music", { loop: true })

  add([
    sprite("background"),
    pos(0, 0),
    scale(Math.max(width() / 1280, height() / 720)),
    anchor("topleft"),
    fixed(),
    z(-999),
  ])

  const blobbo = add([
    sprite("blobbo"),
    scale(5),
    pos(width() / 2, height() / 3 - 60),
    anchor("center"),
    fixed(),
  ])

  const adventure = add([
    sprite("adventure"),
    scale(5),
    pos(width() / 2, height() / 3 + 20),
    anchor("center"),
    fixed(),
  ])

  function floatY(obj, distance = 10, duration = 1) {
    let goingUp = true
    loop(duration * 2, () => {
      if (!obj.exists()) return
      const offset = goingUp ? -distance : distance
      tween(obj.pos.y, obj.pos.y + offset, duration, val => obj.pos.y = val)
      goingUp = !goingUp
    })
  }

  floatY(blobbo)
  floatY(adventure)

  const start = add([
    sprite("start"),
    scale(5),
    pos(width() / 2, height() / 3 + 200),
    anchor("center"),
    fixed(),
    area(),
  ])

  start.onHover(() => {
    tween(start.scale.x, 5.2, 0.3, (val) => {
      start.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  start.onHoverEnd(() => {
    tween(start.scale.x, 5.0, 0.3, (val) => {
      start.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  start.onClick(() => {
    destroyAll()
    gameStarted = true
    startGame()
  })
}

function startGame() {
  setGravity(1600)
  const WIDTH = 1280
  const HEIGHT = 720
  const GROUND_TILE_COUNT = 20
  let score = 0

  add([
    sprite("background"),
    pos(0, 0),
    scale(Math.max(width() / WIDTH, height() / HEIGHT)),
    anchor("topleft"),
    fixed(),
    z(-999),
  ])

  const scoreLabel = add([
    text(`Score: ${score}`, { size: 24 }),
    pos(WIDTH / 2, 16),
    anchor("center"),
    fixed(),
    z(100),
    color(0, 0, 0),
  ])

  for (let i = 0; i < GROUND_TILE_COUNT; i++) {
    add([
      sprite("ground"),
      scale(4),
      pos(200 + i * 64, 672),
      area(),
      body({ isStatic: true }),
    ])
  }

  add([
    rect(5000, 48),
    pos(-1000, 0),
    area(),
    color(0, 0, 255),
    body({ isStatic: true }),
  ])

  add([
    sprite("spike"),
    area(),
    body({ isStatic: true }),
    pos(400, 640),
    scale(4),
    "smallSpike",
  ])

  add([
    sprite("longSpike"),
    area(),
    body({ isStatic: true }),
    pos(450, 612),
    scale(4),
    "longSpike",
  ])

  function spawnCoin() {
    const y = 624
    const safeZones = [
      { min: 200, max: 380 },
      { min: 500, max: 800 },
    ]
    const zone = choose(safeZones)
    const x = rand(zone.min, zone.max)

    const coin = add([
      sprite("coin"),
      area(),
      "coin",
      scale(3),
      pos(x, y),
    ])

    let goingUp = true
    loop(1.0, () => {
      if (!coin.exists()) return
      const offset = goingUp ? -15 : 15
      tween(coin.pos.y, coin.pos.y + offset, 0.8, val => coin.pos.y = val)
      goingUp = !goingUp
    })

    return coin
  }

  let coin = spawnCoin()

  function spawnBlob() {
    blob = add([
      sprite("smiley", { anim: "idle" }),
      pos(200, 500),
      scale(4),
      area(),
      body(),
      health(100, 100),
      rotate(),
      "player",
    ])

    const hpBarBg = blob.add([
      rect(40, 6),
      color(255, 0, 0),
      pos(-14, -20),
    ])

    const hpBar = blob.add([
      rect(40, 6),
      color(0, 255, 0),
      pos(-14, -20),
    ])

    const hpText = blob.add([
      text(`${blob.hp()}/${blob.maxHP()}`, { size: 5 }),
      color(0, 0, 0),
      pos(5, -16),
      anchor("center"),
    ])

    blob.onUpdate(() => {
      const ratio = blob.hp() / blob.maxHP()
      hpBar.width = 40 * ratio
      hpText.text = `${Math.max(blob.hp(), 0)}/${blob.maxHP()}`
    })

    blob.onCollide("smallSpike", () => {
      blob.hurt(10)
      play("hit")

      if (blob) blob.use(color(255, 0, 0))

      wait(0.2, () => {
        if (blob) {
          blob.use(color())
        }
      })
    })

    blob.onCollide("longSpike", () => {
      blob.hurt(25)
      play("hit")

      if (blob) blob.use(color(255, 0, 0))

      wait(0.2, () => {
        if (blob) {
          blob.use(color())
        }
      })
    })

    blob.onCollide("coin", (c) => {
      destroy(c)
      score++
      scoreLabel.text = `Score: ${score}`
      play("collectingCoin", { volume: 0.5 })
      coin = spawnCoin()
    })

    blob.onAnimEnd(() => blob.play("idle"))

    blob.onDeath(() => {
      destroy(blob)
      blob = null
      play("death")
    })
  }

  spawnBlob()

  add([
    text("Respawn", { size: 32 }),
    pos(WIDTH / 2, 300),
    anchor("center"),
    area(),
    color(0, 0, 0),
  ]).onClick(() => {
    if (!blob) spawnBlob()
  })

  onUpdate(() => {
    if (!blob) return

    if (blob.pos.y > 1000 || blob.pos.y < 0) {
      destroy(blob)
      blob = null
      spawnBlob()
      return
    }

    if (blob && blob.pos) {
      setCamPos(blob.pos)
    }
  })
}

onKeyDown("d", () => {
  if (blob) {
    blob.play("right")
    blob.move(SPEED, 0)
  }
})

onKeyDown("a", () => {
  if (blob) {
    blob.play("left")
    blob.move(-SPEED, 0)
  }
})

onKeyPress(["space", "w"], () => {
  if (blob && blob.isGrounded()) {
    blob.jump()
    blob.play("jump")
    play("jump", { volume: 0.3 })
  }
})

showMainMenu()
