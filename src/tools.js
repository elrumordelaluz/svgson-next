import omitDeep from 'omit-deep'
import rename from 'deep-rename-keys'
import clean from 'clean-deep'
import htmlparser from 'htmlparser2'
import serializer from 'dom-serializer'
import svgo from 'svgo'

export const svgoDefaultConfig = {
  plugins: [
    { removeStyleElement: true },
    {
      removeAttrs: {
        attrs: '(stroke-width|stroke-linecap|stroke-linejoin|)',
      },
    },
  ],
  multipass: true,
}

export const parseInput = input => {
  return Promise.resolve(htmlparser.parseDOM(input, { xmlMode: true }))
}

export const sanitizeInput = input => {
  const parsed = htmlparser.parseDOM(input, { xmlMode: true })
  const f = node => node.type === 'tag' && node.name === 'svg'
  const filtered = parsed.filter(f)
  return serializer(filtered)
}

export const optimizeSVG = (input, config) => {
  return new Promise((resolve, reject) => {
    return new svgo(config).optimize(input, ({ data }) => {
      return data ? resolve(data) : reject()
    })
  })
}

export const getOnlySvg = node => node.type === 'tag' && node.name === 'svg'
export const removeAttrs = obj => omitDeep(obj, ['next', 'prev', 'parent'])
export const wrapInKey = (key, node) => ({ [key]: node })
export const addCustomAttrs = (attrs, node) => ({
  ...node,
  ...attrs,
})

export const compat = node => {
  const renamed = rename(node, key => {
    if (key === 'attribs') {
      return 'attrs'
    }
    if (key === 'children') {
      return 'childs'
    }
    return key
  })
  return omitDeep(clean(renamed), ['type'])
}

export const camelize = node => {
  return rename(node, key => {
    if (!notCamelcase(key)) {
      return toCamelCase(key)
    }
    return key
  })
}

export const toCamelCase = prop =>
  prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase())

const notCamelcase = prop => /^(data|aria)(-\w+)/.test(prop)
