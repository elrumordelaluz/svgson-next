import * as t from './tools'

const svgson = function svgson(
  input,
  {
    optimize = false,
    svgoConfig = t.svgoDefaultConfig,
    pathsKey = '',
    customAttrs = null,
    compat = false,
    camelcase = false,
  } = {}
) {
  const optimizer = input => {
    const sanitized = t.sanitizeInput(input)
    return optimize ? t.optimizeSVG(sanitized, svgoConfig) : Promise.resolve(sanitized)
  }

  const applyFilters = input => {
    const applyPathsKey = node =>
      pathsKey !== '' ? t.wrapInKey(pathsKey, node) : node
    const applyCustomAttrs = node =>
      customAttrs ? t.addCustomAttrs(customAttrs, node) : node
    const applyCompatMode = node => (compat ? t.compat(node) : node)
    const applyCamelcase = node =>
      camelcase || compat ? t.camelize(node) : node

    const result = input
      .map(t.removeAttrs)
      .map(applyCompatMode)
      .map(applyPathsKey)
      .map(applyCustomAttrs)
      .map(applyCamelcase)

    return Promise.resolve(result)
  }

  const haveResult = input =>
    input.length > 0
      ? Promise.resolve(input)
      : Promise.reject('No result produced')

  return optimizer(input).then(t.parseInput).then(applyFilters).then(haveResult)
}

const processInput = input => {}

export default svgson
