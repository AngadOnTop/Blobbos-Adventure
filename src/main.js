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
const MAX_JUMP_FORCE = 900
const MIN_JUMP_FORCE = 400
let jumpStartTime = 0
let isJumping = false
const NORMAL_GRAVITY = 1600
const FAST_FALL_GRAVITY = 3200
let score = 0

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
  loadSprite("studio", "/sprites/solostudio.png"),
  loadSprite("heal", "/sprites/heal.png"),
  loadSprite("respawn", "/sprites/respawn.png"),
  loadSprite("door", "/sprites/door.png"),
  loadSprite("tile", "/sprites/tile.png"),
  loadSound("jump", "/sounds/jump.wav"),
  loadSound("collectingCoin", "/sounds/coin.wav"),
  loadSound("hit", "/sounds/hit.wav"),
  loadSound("death", "/sounds/death.wav"),
  loadSound("music", "/sounds/music.mp3"),
  loadSound("UIpop", "/sounds/UIpop.wav"),
  loadSound("UIstart", "/sounds/UIstart.wav"),
])

scene("mainMenu", () => {
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

  const studio = add([
    sprite("studio"),
    scale(2),
    pos(width() / 2, height() / 3 + 400),
    anchor("center"),
    fixed(),
    area(),
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
    play("UIpop")
    tween(start.scale.x, 5.2, 0.3, (val) => {
      start.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  start.onHoverEnd(() => {
    tween(start.scale.x, 5.0, 0.3, (val) => {
      start.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  studio.onHover(() => {
    play("UIpop")
    tween(studio.scale.x, 3.2, 0.3, (val) => {
      studio.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  studio.onHoverEnd(() => {
    tween(studio.scale.x, 2.0, 0.3, (val) => {
      studio.scale = vec2(val)
    }, easings.easeOutElastic)
  })

  start.onClick(() => {
    play("UIstart")
    go("tutorial")
  })
})

scene("tutorial", () => {
  setGravity(NORMAL_GRAVITY)
  const WIDTH = 1280
  const HEIGHT = 720

  // Create gradient-like background using two rectangles
  add([
    rect(WIDTH, HEIGHT),
    pos(0, 0),
    color(0, 0, 0),
    fixed(),
    z(-999),
  ])

  add([
    rect(WIDTH, HEIGHT),
    pos(0, 0),
    color(50, 50, 50),
    opacity(0.5),
    fixed(),
    z(-998),
  ])

  function showDeathScreen() {
    const deathScreen = add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.7),
      fixed(),
      z(100),
    ])

    const respawnButton = add([
      sprite("respawn"),
      pos(width() / 2, height() / 2),
      anchor("center"),
      fixed(),
      z(101),
      area(),
      scale(4),
    ])

    const menuButton = add([
      text("Back to Menu", { size: 24 }),
      pos(width() / 2, height() / 2 + 100),
      anchor("center"),
      fixed(),
      z(101),
      area(),
      color(255, 255, 255),
      scale(1),
    ])

    respawnButton.onHover(() => {
      tween(respawnButton.scale.x, 4.2, 0.3, (val) => {
        respawnButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    respawnButton.onHoverEnd(() => {
      tween(respawnButton.scale.x, 4.0, 0.3, (val) => {
        respawnButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    menuButton.onHover(() => {
      tween(menuButton.scale.x, 1.2, 0.3, (val) => {
        menuButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    menuButton.onHoverEnd(() => {
      tween(menuButton.scale.x, 1.0, 0.3, (val) => {
        menuButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    respawnButton.onClick(() => {
      destroy(deathScreen)
      destroy(respawnButton)
      destroy(menuButton)
      wait(0.1, () => {
        spawnBlob()
      })
    })

    menuButton.onClick(() => {
      go("mainMenu")
    })
  }

  for (let i = 0; i < 20; i++) {
    add([
      sprite("tile"),
      scale(4),
      pos(200 + i * 64, 672),
      area(),
      body({ isStatic: true }),
    ])
  }

  for (let i = 0; i < 20; i++) {
    add([
      sprite("tile"),
      scale(4),
      pos(200, 672 - i * 64),
      area(),
      body({ isStatic: true }),
    ])
  }

  for (let i = 0; i < 25; i++) {
    add([
      sprite("tile"),
      scale(4),
      pos(1480, 672 - i * 64),
      area(),
      body({ isStatic: true }),
    ])
  }

  add([
    sprite("door"),
    scale(4),
    pos(500, 616),
    area(),
    "door",
  ])

  function spawnBlob() {
    blob = add([
      sprite("smiley", { anim: "idle" }),
      pos(250, 500),
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

    blob.onAnimEnd(() => blob.play("idle"))

    blob.onDeath(() => {
      destroy(blob)
      blob = null
      play("death")
      showDeathScreen()
    })

    blob.onCollide("door", () => {
      go("game")
    })
  }

  spawnBlob()

  onUpdate(() => {
    if (!blob) return

    if (blob.pos.y > 1000 || blob.pos.y < 0) {
      destroy(blob)
      blob = null
      play("death")
      showDeathScreen()
      return
    }

    if (blob && blob.pos) {
      setCamPos(blob.pos)
    }
  })

  onKeyDown(["d", "right"], () => {
    if (blob) {
      blob.play("right")
      blob.move(SPEED, 0)
    }
  })

  onKeyDown(["a", "left"], () => {
    if (blob) {
      blob.play("left")
      blob.move(-SPEED, 0)
    }
  })

  onKeyPress(["space", "w", "up"], () => {
    if (blob && blob.isGrounded()) {
      isJumping = true
      jumpStartTime = time()
      blob.play("jump")
      play("jump", { volume: 0.3 })
      blob.jump(MIN_JUMP_FORCE)
    }
  })

  onKeyDown(["space", "w", "up"], () => {
    if (blob && isJumping && !blob.isGrounded()) {
      const holdTime = time() - jumpStartTime
      if (holdTime < 0.3) { // Only apply additional force for the first 0.3 seconds
        blob.jump(MAX_JUMP_FORCE - MIN_JUMP_FORCE)
      }
    }
  })

  onKeyRelease(["space", "w", "up"], () => {
    isJumping = false
  })

  onKeyDown(["s", "down"], () => {
    if (blob && !blob.isGrounded()) {
      setGravity(FAST_FALL_GRAVITY)
    }
  })

  onKeyRelease(["s", "down"], () => {
    setGravity(NORMAL_GRAVITY)
  })
})

scene("game", () => {
  setGravity(NORMAL_GRAVITY)
  const WIDTH = 1280
  const HEIGHT = 720
  const GROUND_TILE_COUNT = 20

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

  // Create elevated platform
  for (let i = 0; i < 10; i++) {
    add([
      sprite("ground"),
      scale(4),
      pos(600 + i * 64, 480),
      area(),
      body({ isStatic: true }),
    ])
  }

  // Add door at the end of the elevated platform
  add([
    sprite("door"),
    scale(4),
    pos(1000, 398), // Positioned above the platform
    area(),
    "door",
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

  function spawnHeal() {
    const y = 624
    const safeZones = [
      { min: 200, max: 380 },
      { min: 500, max: 800 },
    ]
    const zone = choose(safeZones)
    const x = rand(zone.min, zone.max)

    const heal = add([
      sprite("heal"),
      area(),
      "heal",
      scale(3),
      pos(x, y),
    ])

    let goingUp = true
    loop(1.0, () => {
      if (!heal.exists()) return
      const offset = goingUp ? -15 : 15
      tween(heal.pos.y, heal.pos.y + offset, 0.8, val => heal.pos.y = val)
      goingUp = !goingUp
    })

    return heal
  }

  let coin = spawnCoin()
  let heal = spawnHeal()

  function showDeathScreen() {
    const deathScreen = add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.7),
      fixed(),
      z(100),
    ])

    const respawnButton = add([
      sprite("respawn"),
      pos(width() / 2, height() / 2),
      anchor("center"),
      fixed(),
      z(101),
      area(),
      scale(4),
    ])

    const menuButton = add([
      text("Back to Menu", { size: 24 }),
      pos(width() / 2, height() / 2 + 100),
      anchor("center"),
      fixed(),
      z(101),
      area(),
      color(255, 255, 255),
      scale(1),
    ])

    respawnButton.onHover(() => {
      tween(respawnButton.scale.x, 4.2, 0.3, (val) => {
        respawnButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    respawnButton.onHoverEnd(() => {
      tween(respawnButton.scale.x, 4.0, 0.3, (val) => {
        respawnButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    menuButton.onHover(() => {
      tween(menuButton.scale.x, 1.2, 0.3, (val) => {
        menuButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    menuButton.onHoverEnd(() => {
      tween(menuButton.scale.x, 1.0, 0.3, (val) => {
        menuButton.scale = vec2(val)
      }, easings.easeOutElastic)
    })

    respawnButton.onClick(() => {
      destroy(deathScreen)
      destroy(respawnButton)
      destroy(menuButton)
      wait(0.1, () => {
        spawnBlob()
      })
    })

    menuButton.onClick(() => {
      go("mainMenu")
    })
  }

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

    blob.onCollide("heal", (h) => {
      if (blob.hp() < 100) {
        blob.heal(25)
        destroy(h)
        heal = spawnHeal()
      }
    })

    blob.onAnimEnd(() => blob.play("idle"))

    blob.onDeath(() => {
      destroy(blob)
      blob = null
      play("death")
      showDeathScreen()
    })

    blob.onCollide("door", () => {
      go("game")
    })
  }

  spawnBlob()

  onUpdate(() => {
    if (!blob) return

    if (blob.pos.y > 1000 || blob.pos.y < 0) {
      destroy(blob)
      blob = null
      play("death")
      showDeathScreen()
      return
    }

    if (blob && blob.pos) {
      setCamPos(blob.pos)
    }
  })

  onKeyDown(["d", "right"], () => {
    if (blob) {
      blob.play("right")
      blob.move(SPEED, 0)
    }
  })

  onKeyDown(["a", "left"], () => {
    if (blob) {
      blob.play("left")
      blob.move(-SPEED, 0)
    }
  })

  onKeyPress(["space", "w", "up"], () => {
    if (blob && blob.isGrounded()) {
      isJumping = true
      jumpStartTime = time()
      blob.play("jump")
      play("jump", { volume: 0.3 })
      blob.jump(MIN_JUMP_FORCE)
    }
  })

  onKeyDown(["space", "w", "up"], () => {
    if (blob && isJumping && !blob.isGrounded()) {
      const holdTime = time() - jumpStartTime
      if (holdTime < 0.3) { // Only apply additional force for the first 0.3 seconds
        blob.jump(MAX_JUMP_FORCE - MIN_JUMP_FORCE)
      }
    }
  })

  onKeyRelease(["space", "w", "up"], () => {
    isJumping = false
  })

  onKeyDown(["s", "down"], () => {
    if (blob && !blob.isGrounded()) {
      setGravity(FAST_FALL_GRAVITY)
    }
  })

  onKeyRelease(["s", "down"], () => {
    setGravity(NORMAL_GRAVITY)
  })
})

go("mainMenu")

