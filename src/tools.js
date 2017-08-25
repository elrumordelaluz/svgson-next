import omitDeep from 'omit-deep'
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

export const optimizeSVG = (input, config) => {
  return new Promise((resolve, reject) => {
    return new svgo(config).optimize(input, ({ data }) => data ? resolve(data) : reject())
  })
}

export const getOnlySvg = node => node.type === 'tag' && node.name === 'svg'
export const removeAttrs = obj => omitDeep(obj, ['next', 'prev', 'parent'])
export const wrapInKey = (key, node) => ({ [key]: node })
export const addCustomAttrs = (attrs, node) => ({
  ...node,
  ...attrs,
})

export const toCamelCase = prop =>
  prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase())

const isDataAttr = prop => /^data(-\w+)/.test(prop)
