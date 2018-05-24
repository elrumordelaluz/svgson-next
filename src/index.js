import * as t from './tools'
import xmlPrint from 'xml-printer'

const svgson = function svgson(
  input,
  {
    optimize = false,
    svgoConfig = t.svgoDefaultConfig,
    pathsKey = '',
    customAttrs = null,
    transformNode = node => node,
    compat = false,
    camelcase = false,
  } = {}
) {
  const optimizer = input => {
    return optimize ? t.optimizeSVG(input, svgoConfig) : Promise.resolve(input)
  }
  const wrapper = input => t.wrapInput(input)
  const parser = input => t.parseInput(input)

  const applyFilters = input => {
    const applyPathsKey = node =>
      pathsKey !== '' ? t.wrapInKey(pathsKey, node) : node
    const applyCompatMode = node => (compat ? t.compat(node) : node)
    const applyCamelcase = node =>
      camelcase || compat ? t.camelize(node) : node

    let n
    n = t.removeAttrs(input)
    if (compat) {
      n = t.compat(n)
    }
    if (pathsKey !== '') {
      n = t.wrapInKey(pathsKey, n)
    }
    n = transformNode(n)
    if (camelcase || compat) {
      n = t.camelize(n)
    }

    return Promise.resolve(n)
  }

  return wrapper(input)
    .then(optimizer)
    .then(parser)
    .then(applyFilters)
    .then(r => {
      return r.name === 'root' ? r.children : r
    })
}

export const stringify = input => xmlPrint(input)

export default svgson
