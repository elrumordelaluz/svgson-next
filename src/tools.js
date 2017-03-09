import omitDeep from 'omit-deep'

export const filterSVG = node => node.type === 'tag' && node.name === 'svg'
export const filterAttrs = obj => omitDeep(obj, ['next', 'prev', 'parent'])
