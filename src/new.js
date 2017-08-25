import htmlparser from 'htmlparser2'
import * as t from './tools'

const svgson = function svgson(
  input,
  {
    optimize = false,
    svgoConfig = t.svgoDefaultConfig,
    pathsKey = '',
    customAttrs = null,
  } = {}
) {
  const optimizer = input => {
    return optimize ? t.optimizeSVG(input, svgoConfig) : Promise.resolve(input)
  }

  const parseInput = input => {
    return Promise.resolve(htmlparser.parseDOM(input, { xmlMode: true }))
  }

  const applyFilters = input => {
    const result = input
      .filter(t.getOnlySvg)
      .map(t.removeAttrs)
      .map(node => {
        return pathsKey !== '' ? t.wrapInKey(pathsKey, node) : node
      })
      .map(node => {
        return customAttrs ? t.addCustomAttrs(customAttrs, node) : node
      })

    return Promise.resolve(result)
  }

  const haveResult = input =>
    input.length > 0 ? Promise.resolve(input) : Promise.reject('No result produced')

  return optimizer(input).then(parseInput).then(applyFilters).then(haveResult)
}

const processInput = input => {}

export default svgson
