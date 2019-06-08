const Piece = (_canvas) => {

  const canvas = _canvas

  const state = {
    player: {
      x: 20,
      y: 20,
      speed: 20,
      direction: 'right',
      width: 100,
      height: 40,
      lastShotTime: 0,
      loadingTimeInSeconds: 3,
    },
    bombs: [],
    terminalBombVelocity: 10,
  }

  const drawPlayer = (context) => {
    context.fillStyle = 'green';
    context.fillRect(state.player.x, state.player.y, state.player.width, state.player.height)
  }

  const draw = (context) => {
    drawPlayer(context)
  }

  const updatePlayer = () => {
    // Move the player either to the left to the right.
    state.player.x += state.player.direction === 'left' ? state.player.speed * -1 : state.player.speed

    // Hitting a wall? Turn around.
    if (state.player.x > (canvas.width - state.player.width)) {
      state.player.direction = 'left'
    } else if (state.player.x < 0) {
      state.player.direction = 'right'
    }
  }

  const updateBombs = () => {
    state.bombs.forEach(bomb => {
      bomb.y += bomb.velocity
      bomb.velocity += bomb.y / 10
      if (bomb.velocity < state.terminalBombVelocity) {
        bomb.velocity = state.terminalBombVelocity
      }
    })
  }

  const secondsToMilliseconds = (seconds) => {
    return Math.floor(seconds * 1000)
  }

  const dropBomb = () => {
    state.bombs.push({
      x: state.player.x,
      y: state.player.y,
      velocity: 1,
    })
  }

  const fireIfPossible = () => {
    const timeDeltaFromLastShot = new Date().getTime() - state.player.lastShotTime
    console.log('secondsToMilliseconds(state.player.loadingTimeInSeconds):', secondsToMilliseconds(state.player.loadingTimeInSeconds))
    if (timeDeltaFromLastShot < secondsToMilliseconds(state.player.loadingTimeInSeconds)) {
      console.log('Loading...')
      return
    }
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
