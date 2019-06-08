const fpsCap = 90
const canvasWidth = 2000
const canvasHeight = 950
let now
let then = Date.now()
let delta

const styleCanvas = (canvasElement, stylesObject) => {
  Object.keys(stylesObject).forEach(attribute => {
    canvasElement.style[attribute] = stylesObject[attribute]
  })
}

const clearCanvasForNextFrame = (canvas, context) => {
  context.save()
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.restore()
}


const draw = (canvas, context) => {
  if (window._____drawFrameFunction) {
    window._____drawFrameFunction(canvas, context)
  }
}

const tick = (canvas, context) => {
  requestAnimationFrame(() => {
    tick(canvas, context)
    clearCanvasForNextFrame(canvas, context)
    draw(canvas, context)
  })
  // const interval = 1000 / fpsCap
  // now = Date.now()
  // delta = now - then
  // if (delta > interval) {
  //   then = now - (delta % interval)
  // }
}

const createCanvas = (mountElement, config = {
  width: canvasWidth,
  height: canvasHeight,
  backgroundColor: '#000'
}) => {
  const canvasElement = document.createElement('canvas')
  canvasElement.width = config.width
  canvasElement.height = config.height

  styleCanvas(canvasElement, {
    backgroundColor: config.backgroundColor,
    width: '100%',
  })

  mountElement.innerHTML = ''
  mountElement.appendChild(canvasElement)
  return canvasElement
}

const init = (mountElement) => {
  const canvas = createCanvas(mountElement)
  const context = canvas.getContext('2d')
  tick(canvas, context)
  setTimeout(() => {
    Piece(canvas)
  }, 500)
}

init(document.querySelector('.piece'))
