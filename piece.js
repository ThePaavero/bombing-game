const Piece = (_canvas) => {

  const canvas = _canvas

  // Some colors that we use.
  const colors = {
    planeAndEnemies: '#40aaff',
    bombs: '#fff',
    loading: '#ff2450',
  }

  // Our game's state.
  let state = {}

  const updateMainState = (difficulty) => {
    const playerSpeed = 5 * difficulty
    const loadingTimeInSeconds = 0.5 * difficulty
    const enemyCount = 10 * difficulty
    const bombsCount = enemyCount * (2 / difficulty)

    state = {
      difficulty,
      gameRunning: difficulty > 1,
      player: {
        x: 20,
        y: 20,
        speed: playerSpeed,
        direction: 'right',
        width: 100,
        height: 40,
        lastShotTime: 0,
        loadingTimeInSeconds,
        color: colors.planeAndEnemies,
        loading: false,
        bombsLeft: bombsCount,
      },
      bombs: [],
      terminalBombVelocity: 10,
      infoBarHeight: 60,
      colors: {
        bombs: colors.bombs,
        enemies: colors.planeAndEnemies,
      },
      debrisParticles: [],
      enemies: [],
      shakeSteps: 0,
      spawnEnemiesNumber: enemyCount,
      shakeStrength: null,
    }
  }

  /**
   * Draw our "pause" screen.
   *
   * @param context
   */
  const drawSplashScreen = (context) => {
    // Overlay/background.
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Write some text.
    context.textAlign = 'center'
    context.font = '90px Arial, sans-serif'
    context.fillStyle = 'white'
    context.fillText('Bomber', canvas.width / 2, canvas.height / 2)
    context.font = '30px Arial, sans-serif'
    context.fillText('Click to start', canvas.width / 2, (canvas.height / 2) + 40)
  }

  /**
   * Draw our player (plane).
   *
   * @param context
   */
  const drawPlayer = (context) => {
    context.fillStyle = state.player.color
    context.fillRect(state.player.x, state.player.y, state.player.width, state.player.height)
  }

  /**
   * Draw our bombs.
   *
   * @param context
   */
  const drawBombs = (context) => {
    state.bombs.forEach(bomb => {
      context.fillStyle = bomb.color
      context.beginPath()
      context.arc(bomb.x, bomb.y, bomb.size, 0, 2 * Math.PI)
      context.fill()
    })
  }

  /**
   * Draw our debris particles.
   *
   * @param context
   */
  const drawDebrisParticles = (context) => {
    state.debrisParticles.forEach(particle => {
      context.fillStyle = particle.color
      context.beginPath()
      context.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI)
      context.fill()
    })
  }

  /**
   * Draw our enemies/targets.
   *
   * @param context
   */
  const drawEnemies = (context) => {
    state.enemies.forEach(enemy => {
      context.fillStyle = enemy.color
      context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
    })
  }

  /**
   * Draw our info bar.
   *
   * @param context
   */
  const drawInfoBar = (context) => {
    context.fillStyle = '#fff'
    context.fillRect(0, canvas.height - state.infoBarHeight, canvas.width, state.infoBarHeight)

    // Draw remaining bombs.
    let bombIconLeftOffset = 30
    const bombIconSize = 20
    context.fillStyle = '#000'
    for (let i = 0; i < state.player.bombsLeft; i++) {
      context.fillRect(bombIconLeftOffset, canvas.height - (state.infoBarHeight / 1.5), bombIconSize, bombIconSize)
      bombIconLeftOffset += bombIconSize + 5
    }
  }

  /**
   * Update the state of our player (plane).
   */
  const updatePlayer = () => {
    // Are we loading or ready to drop bombs?
    state.player.loading = new Date().getTime() - state.player.lastShotTime < secondsToMilliseconds(state.player.loadingTimeInSeconds)

    // Add an appropriate class name for our canvas element. CSS uses that for the cursor.
    canvas.className = state.player.loading ? 'loading' : ''

    // Move the player either to the left or to the right.
    state.player.x += state.player.direction === 'left' ? state.player.speed * -1 : state.player.speed

    // Hitting a wall? Turn around.
    if (state.player.x > (canvas.width - state.player.width)) {
      state.player.direction = 'left'
    } else if (state.player.x < 0) {
      state.player.direction = 'right'
    }

    // If we're out of bombs, paint us "red."
    if (state.player.bombsLeft < 1) {
      state.player.color = colors.loading
      return
    }

    // If we're loading and can't drop bombs, paint us accordingly.
    state.player.color = state.player.loading ? colors.loading : colors.planeAndEnemies
  }

  /**
   * Create an explosion.
   *
   * @param bomb
   * @param includeTargetColors
   */
  const createBombHit = (bomb, includeTargetColors) => {

    // Shake the screen a bit.
    state.shakeStrength = 10
    shakeScreen()

    // Throw shit in the air.
    const debrisParticleCount = randomBetween(15, 60)
    for (let i = 0; i < debrisParticleCount; i++) {
      let color = colors.bombs

      if (includeTargetColors) {
        color = randomBetween(0, 4) === 0 ? colors.bombs : colors.planeAndEnemies // Most particles are from the target building, but some are from the bomb itself.
      }

      state.debrisParticles.push({
        size: randomBetween(1, 6),
        x: bomb.x,
        y: bomb.y,
        color,
        velocities: {
          x: randomBetween(-6, 6),
          y: randomBetween(-3, -8),
        },
      })
    }
  }

  /**
   * Update the state of our bombs.
   */
  const updateBombs = () => {
    state.bombs.forEach(bomb => {

      // Bomb is falling down.
      bomb.y += bomb.velocity

      // Its velocity grows as it falls.
      bomb.velocity += bomb.y / 1000

      // Bomb's velocity can't exceed terminal velocity.
      if (bomb.velocity < state.terminalBombVelocity) {
        bomb.velocity = state.terminalBombVelocity
      }

      // Move the bomb either to the left or the right. A little.
      if (bomb.playerDirectionAtTimeOfDropping === 'left') {
        bomb.x -= bomb.momentumFromPlane
      } else {
        bomb.x += bomb.momentumFromPlane
      }

      // Some wind resistance will lower some of the plane direction momentum.
      if (bomb.momentumFromPlane > state.player.speed / 10) {
        bomb.momentumFromPlane -= 0.01
      }

      // If we're hitting the ground, create an explosion and remove ourselves from the bombs array.
      if (bomb.y >= (canvas.height - state.infoBarHeight)) {
        createBombHit(bomb, false)
        state.bombs = state.bombs.filter(b => b !== bomb)
      }
    })
  }

  /**
   * Update the state of our debris particles.
   */
  const updateDebrisParticles = () => {
    state.debrisParticles.forEach(particle => {
      particle.y += particle.velocities.y
      particle.x += particle.velocities.x
      particle.velocities.y += randomBetween(0.1, 0.4) // Add some randomness to how the piece of debris flies towards the ground.

      // If it's below the ground, remove it from our array.
      if (particle.y > canvas.height) {
        state.debrisParticles = state.debrisParticles.filter(dp => dp !== particle)
      }
    })
  }

  /**
   * Update our enemies state. They're buildings. Why would they move? Should remove.
   */
  const updateEnemies = () => {
    // state.enemies.forEach(enemy => {
    // ...Should these move or something?
    // })
  }

  /**
   * Drop a bomb!
   */
  const dropBomb = () => {
    state.bombs.push({
      playerDirectionAtTimeOfDropping: state.player.direction,
      momentumFromPlane: state.player.speed,
      x: state.player.x + (state.player.width / 2), // From the center of the plane.
      y: state.player.y + state.player.height, // From the bottom of the plane.
      velocity: 1, // This will increase as we keep falling.
      color: state.colors.bombs,
      size: 10,
    })
  }

  /**
   * Drop a bomb if it's possible.
   */
  const dropBombIfPossible = () => {
    if (state.player.loading || state.player.bombsLeft < 1) {
      // We're wither loading or are out of bombs. :(
      return
    }
    // Drop a bomb!
    dropBomb()
    state.player.bombsLeft--
    state.player.lastShotTime = new Date().getTime()
  }

  /**
   * Set our controls.
   */
  const setControls = () => {
    canvas.addEventListener('click', e => {
      e.preventDefault()
      if (state.gameRunning) {
        dropBombIfPossible()
      } else {
        state.gameRunning = true
      }
    })
  }

  /**
   * Create a random set of targets to bomb.
   */
  const createEnemies = () => {
    // How many?
    const amountOfEnemies = state.spawnEnemiesNumber

    // Add random targets to our state.
    for (let i = 0; i < amountOfEnemies; i++) {
      const width = randomBetween(60, 100)
      const height = randomBetween(20, 50)
      state.enemies.push({
        x: randomBetween(10, canvas.width - 10),
        y: (canvas.height - height) - state.infoBarHeight,
        width,
        height,
        color: state.colors.enemies,
      })
    }
  }

  /**
   * Shake the canvas element.
   */
  const shakeScreen = () => {

    // How much do we want to shake?
    const rangeOfPixels = randomBetween(state.shakeStrength * -1, state.shakeStrength)

    // The rumble should start big and then simmer down.
    state.shakeStrength--

    if (state.shakeStrength < 0) {
      // We're done shaking, return our canvas to the original position.
      canvas.style.transform = 'none'
      return
    }

    // A little internal helper function for applying the styles.
    const applyShake = (axis, value) => {
      canvas.style.transform = 'translate' + axis.toUpperCase() + '(' + value + 'px)'
    }

    ['x', 'y'].forEach(axis => {
      applyShake(axis, randomBetween(rangeOfPixels * -1, rangeOfPixels))
    })

    // Next step of rumbles.
    setTimeout(shakeScreen, randomBetween(1, 20))
  }

  /**
   * A bomb has hit its target. React to that.
   *
   * @param bomb
   * @param enemy
   */
  const processBombHit = (bomb, enemy) => {
    // Remove the enemy from our array.
    state.enemies = state.enemies.filter(e => e !== enemy)

    // Create a big boom.
    createBombHit(bomb, true)
    state.shakeStrength = 30
    shakeScreen()

    // If this was the last enemy, do something!
    if (state.enemies.length < 1) {
      reactToAllEnemiesKilled()
    }
  }

  const reactToAllEnemiesKilled = () => {
    state.difficulty++
    initLevel(state.difficulty)
  }

  /**
   * Do our hit checks.
   */
  const doHitChecks = () => {
    const heightThreshold = canvas.height - (state.infoBarHeight + 50)
    state.bombs.forEach(bomb => {
      // Don't bother checking if bomb isn't even close to the targets.
      if (bomb.y < heightThreshold) {
        return
      }
      // Ok, we're low enough. Do checks.
      state.enemies.forEach(enemy => {
        if (bomb.x > enemy.x && bomb.x < (enemy.x + enemy.width)) {
          processBombHit(bomb, enemy)
        }
      })
    })
  }

  /**
   * Update tick. Just a centralized wrapper method.
   */
  const update = () => {
    if (!state.gameRunning) {
      return
    }
    updatePlayer()
    updateBombs()
    updateDebrisParticles()
    updateEnemies()
    doHitChecks()
  }

  /**
   * Paint our frame.
   *
   * @param context
   */
  const draw = (context) => {
    switch (state.gameRunning) {
      case true:
        drawPlayer(context)
        drawBombs(context)
        drawDebrisParticles(context)
        drawInfoBar(context)
        drawEnemies(context)
        break
      case false:
        drawSplashScreen(context)
        break
    }
  }

  const initLevel = (difficulty) => {
    updateMainState(difficulty)
    createEnemies()
  }

  /**
   * Helper function for transforming seconds into milliseconds.
   *
   * @param seconds
   * @returns {number}
   */
  const secondsToMilliseconds = (seconds) => {
    return Math.floor(seconds * 1000)
  }

  /**
   * Helper function for getting a random number between given arguments.
   *
   * @param min
   * @param max
   * @returns {number}
   */
  const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  window._____drawFrameFunction = (canvas, context) => {
    update(canvas)
    draw(context)
  }

  setControls()
  initLevel(1)
}
