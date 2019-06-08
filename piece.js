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
  }

  const drawPlayer = (context) => {
    context.fillStyle = 'green';
    context.fillRect(state.player.x, state.player.y, state.player.width, state.player.height)
  }

  const draw = (context) => {
    drawPlayer(context)
  }

  const updatePlayer = () => {
    switch (state.player.direction) {
      case 'left':
      default:
        state.player.x -= state.player.speed
        break
      case 'right':
        state.player.x += state.player.speed
        break
    }

    if (state.player.x > (canvas.width - state.player.width)) {
      state.player.direction = 'left'
    } else if (state.player.x < 0) {
      state.player.direction = 'right'
    }
  }

  const secondsToMilliseconds = (seconds) => {
    return Math.floor(seconds * 1000)
  }


  const fireIfPossible = () => {
    const timeDeltaFromLastShot = new Date().getTime() - state.player.lastShotTime
    console.log('secondsToMilliseconds(state.player.loadingTimeInSeconds):', secondsToMilliseconds(state.player.loadingTimeInSeconds))
    if (timeDeltaFromLastShot < secondsToMilliseconds(state.player.loadingTimeInSeconds)) {
      console.log('Loading...')
      return
    }

    // todo: Shoot!
    console.log('FIRING!')

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
  }

  window._____drawFrameFunction = (canvas, context) => {
    update(canvas)
    draw(context)
  }

  setControls()

}
