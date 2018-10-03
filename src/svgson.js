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
      const children = compat ? node.childs : node.children
      return node.name === 'root'
        ? children.map(applyTransformNode)
        : {
            ...transformNode(node),
            ...(children && children.length > 0
              ? {
                  [compat ? 'childs' : 'children']: children.map(
                    applyTransformNode
                  ),
                }
              : {}),
          }
    }
    let n
    n = removeAttrs(input)
    if (compat) {
      n = applyCompat(n)
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
      const res = r.name === 'root' ? r.children : r
      return pathsKey !== '' ? wrapInKey(pathsKey, res) : res
    })
}

const stringify = input => xmlPrint(input)

export { svgson, stringify }
