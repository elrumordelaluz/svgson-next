import {
  parseInput,
  wrapInput,
  wrapInKey,
  removeDoctype,
  removeAttrs,
  camelize,
  applyCompat,
} from './tools'
import xmlPrint from 'xml-printer'

const svgson = function svgson(
  input,
  {
    pathsKey = '',
    customAttrs = null,
    transformNode = node => node,
    compat = false,
    camelcase = false,
  } = {}
) {
  const wrapper = input => {
    const cleanInput = removeDoctype(input)
    return wrapInput(cleanInput)
  }
  const parser = input => parseInput(input)

  const applyFilters = input => {
    const applyTransformNode = node => {
      return node.name === 'root'
        ? node.children.map(transformNode)
        : transformNode(node)
    }
    let n
    n = removeAttrs(input)
    if (compat) {
      n = applyCompat(n)
    }
    if (pathsKey !== '') {
      n = wrapInKey(pathsKey, n)
    }
    n = applyTransformNode(n)
    if (camelcase || compat) {
      n = camelize(n)
    }
    return Promise.resolve(n)
  }

  return wrapper(input)
    .then(parser)
    .then(applyFilters)
    .then(r => {
      return r.name === 'root' ? r.children : r
    })
}

const stringify = input => xmlPrint(input)

export { svgson, stringify }
