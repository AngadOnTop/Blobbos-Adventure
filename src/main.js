import kaplay from "kaplay"
import "kaplay/global"

kaplay({
  width: 1280,
  height: 720,
  background: [0, 0, 0],
  letterbox: true,
})

// Game state
let gameStarted = false

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
  loadSound("jump", "/sounds/jump.wav"),
  loadSound("collectingCoin", "/sounds/coin.wav"),
  loadSound("hit", "/sounds/hit.wav"),
  loadSound("death", "/sounds/death.wav"),
])

// Main Menu
function showMainMenu() {
  // Background
  add([
    sprite("background"),
    pos(0, 0),
    scale(Math.max(width() / 1280, height() / 720)),
    anchor("topleft"),
    fixed(),
    z(-999),
  ])

  // Title
  const blobbo = add([
    sprite("blobbo"),
    scale(4),
    pos(width() / 2, height() / 3 - 60),
    anchor("center"),
    fixed(),
  ])

  const adventure = add([
    sprite("adventure"),
    scale(4),
    pos(width() / 2, height() / 3 + 20),
    anchor("center")
  ])

  // Start Game Button
  const startButton = add([
    rect(240, 60),
    pos(width() / 2, height() / 2),
    anchor("center"),
    area(),
    color(0, 0, 0),
    outline(4, rgb(255, 255, 255)),
    fixed(),
  ])

  add([
    text("START GAME", {
      size: 32,
      font: "monospace",
    }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
  ])

  // Button hover effect
  startButton.onHover(() => {
    startButton.color = rgb(50, 50, 50)
  })

  startButton.onHoverEnd(() => {
    startButton.color = rgb(0, 0, 0)
  })

  // Start game on click
  startButton.onClick(() => {
    destroyAll()
    gameStarted = true
    startGame()
  })
}

// Game initialization
function startGame() {
  setGravity(1600)

  const WIDTH = 1280
  const HEIGHT = 720
  const SCORE_FONT = 24
  const GROUND_TILE_COUNT = 20
  const SPEED = 300
  let score = 0
  let blob = null

  add([
    sprite("background"),
    pos(0, 0),
    scale(Math.max(width() / WIDTH, height() / HEIGHT)),
    anchor("topleft"),
    fixed(),
    z(-999),
  ])

  const scoreLabel = add([
    text(`Score: ${score}`, { size: SCORE_FONT }),
    pos(WIDTH / 2, 16),
    anchor("center"),
    fixed(),
    z(100),
    color(0, 0, 0),
  ])

  for (let i = 0; i < GROUND_TILE_COUNT; i++) {
    const x = 200 + i * 64
    const y = 672

    add([
      sprite("ground"),
      scale(4),
      pos(x, y),
      area(),
      body({ isStatic: true }),
    ])
  }

  // Ceiling
  add([
    rect(5000, 48),
    pos(-1000, 0),
    area(),
    color(0, 0, 255),
    body({ isStatic: true }),
  ])

  // Spikes
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
    const coin = add([
      sprite("coin"),
      area(),
      "coin",
      scale(3),
      pos(rand(200, 800), y),
    ])

    let goingUp = true

    loop(1.0, () => {
      if (!coin.exists()) return
      const offset = goingUp ? -15 : 15
      tween(coin.pos.y, coin.pos.y + offset, 0.8, (val) => coin.pos.y = val)
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
      blob.hurt(5)
      play("hit")
    })

    blob.onCollide("longSpike", () => {
      blob.hurt(10)
      play("hit")
    })

    blob.onCollide("coin", (c) => {
      destroy(c)
      score++
      scoreLabel.text = `Score: ${score}`
      play("collectingCoin")
      coin = spawnCoin()
    })

    blob.onAnimEnd(() => blob.play("idle"))

    blob.onDeath(() => {
      destroy(blob)
      blob = null
      play("death")
    })

    onKeyPress(["space", "w"], () => {
      if (blob && blob.isGrounded()) {
        blob.jump()
        blob.play("jump")
        play("jump").volume = 0.3
      }
    })
  }

  spawnBlob()

  // Controls
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

  // Respawn button
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

    setCamPos(blob.pos)
  })
}

showMainMenu()
