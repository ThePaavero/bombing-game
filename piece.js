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


  const update = () => {
    updatePlayer()
  }

  window._____drawFrameFunction = (canvas, context) => {
    update(canvas)
    draw(context)
  }

}
