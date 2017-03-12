import htmlparser from 'htmlparser2'
import * as t from './tools'

const svgson = function svgson (input, options) {
  const parsed = htmlparser.parseDOM(input, { xmlMode: true })
  const svgs = parsed.filter(t.getOnlySvg).map(t.removeAttrs)
  
  return svgs.length
}

export default svgson
