const Piece = (_canvas) => {

  const canvas = _canvas

  const state = {
    player: {
      x: 20,
      y: 20,
      speed: 5,
      direction: 'right',
      width: 100,
      height: 40,
      lastShotTime: 0,
      loadingTimeInSeconds: 1,
      color: '#40aaff',
      loading: false,
      bombsLeft: 5,
    },
    bombs: [],
    terminalBombVelocity: 10,
    infoBarHeight: 60,
    colors: {
      bombs: '#FF2450',
      infoBarBackground: '#6e1d00',
      remainingBombIcon: '#fff',
    },
    debrisParticles: [],
  }

  const drawPlayer = (context) => {
    context.fillStyle = state.player.color
    context.fillRect(state.player.x, state.player.y, state.player.width, state.player.height)
  }

  const drawBombs = (context) => {
    state.bombs.forEach(bomb => {
      context.fillStyle = bomb.color
      context.beginPath()
      context.arc(bomb.x, bomb.y, bomb.size, 0, 2 * Math.PI)
      context.fill()
    })
  }

  const drawDebrisParticles = (context) => {
    state.debrisParticles.forEach(particle => {
      context.fillStyle = particle.color
      context.beginPath()
      context.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI)
      context.fill()
    })
  }

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

  const draw = (context) => {
    drawPlayer(context)
    drawBombs(context)
    drawDebrisParticles(context)
    drawInfoBar(context)
  }

  const updatePlayer = () => {
    // Are we loading or ready to drop bombs?
    state.player.loading = new Date().getTime() - state.player.lastShotTime < secondsToMilliseconds(state.player.loadingTimeInSeconds)

    // Move the player either to the left to the right.
    state.player.x += state.player.direction === 'left' ? state.player.speed * -1 : state.player.speed

    // Hitting a wall? Turn around.
    if (state.player.x > (canvas.width - state.player.width)) {
      state.player.direction = 'left'
    } else if (state.player.x < 0) {
      state.player.direction = 'right'
    }

    // If we're out of bombs, paint us "red."
    if (state.player.bombsLeft < 1) {
      state.player.color = '#ff2450'
      return
    }

    // If we're loading and can't drop bombs, paint us accordingly.
    state.player.color = state.player.loading ? '#ff2450' : '#40aaff'
  }

  const createBombHit = (bomb) => {
    const debrisParticleCount = randomBetween(10, 20)
    for (let i = 0; i < debrisParticleCount; i++) {
      state.debrisParticles.push({
        size: randomBetween(1, 3),
        x: bomb.x,
        y: bomb.y,
        color: randomBetween(0, 4) === 0 ? '#40aaff' : '#ff2450',
        velocities: {
          x: randomBetween(-6, 6),
          y: randomBetween(-3, -8),
        },
      })
    }
  }

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
      if (state.player.direction === 'left') {
        bomb.x -= state.player.speed / 2
      } else {
        bomb.x += state.player.speed / 2
      }

      // If we're hitting the ground, create an explosion and remove ourselves from the bombs array.
      if (bomb.y >= canvas.height) {
        createBombHit(bomb)
        state.bombs = state.bombs.filter(b => b !== bomb)
        console.log(state.bombs)
      }
    })
  }

  const updateDebrisParticles = () => {
    state.debrisParticles.forEach(particle => {
      particle.y += particle.velocities.y
      particle.x += particle.velocities.x
    })
  }

  const secondsToMilliseconds = (seconds) => {
    return Math.floor(seconds * 1000)
  }

  const dropBomb = () => {
    state.bombs.push({
      x: state.player.x + (state.player.width / 2),
      y: state.player.y + state.player.height,
      velocity: 1,
      color: state.colors.bombs,
      size: 10,
    })
  }

  const fireIfPossible = () => {
    if (state.player.loading || state.player.bombsLeft < 1) {
      return
    }
    dropBomb()
    state.player.bombsLeft--
    state.player.lastShotTime = new Date().getTime()
  }

  const setControls = () => {
    canvas.addEventListener('click', e => {
      e.preventDefault()
      fireIfPossible()
    })
  }

  const update = () => {
    updatePlayer()
    updateBombs()
    updateDebrisParticles()
  }

  const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }


  window._____drawFrameFunction = (canvas, context) => {
    update(canvas)
    draw(context)
  }

  setControls()

}
