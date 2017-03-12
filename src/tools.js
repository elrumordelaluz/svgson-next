import omitDeep from 'omit-deep'

export const getOnlySvg = node => node.type === 'tag' && node.name === 'svg'

export const removeAttrs = obj => omitDeep(obj, ['next', 'prev', 'parent'])

export const toCamelCase = prop => 
  prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase())

const isDataAttr = prop => /^data(-\w+)/.test(prop)
