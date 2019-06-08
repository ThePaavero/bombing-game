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

  const draw = (context) => {
    drawPlayer(context)
    drawBombs(context)
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
      color: '#fff',
      size: 10,
    })
  }

  const fireIfPossible = () => {
    if (state.player.loading || state.player.bombsLeft < 1) {
      return
    }
    state.player.bombsLeft--
    dropBomb()
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
  }

  window._____drawFrameFunction = (canvas, context) => {
    update(canvas)
    draw(context)
  }

  setControls()

}
