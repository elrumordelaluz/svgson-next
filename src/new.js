import htmlparser from 'htmlparser2'
import omitDeep from 'omit-deep'
import * as t from './tools'

const svgson = function svgson (input) {
  const parsed = htmlparser.parseDOM(input, { xmlMode: true })
  const svgs = parsed.filter(t.filterSVG)
  
  const cl = svgs.map(t.filterAttrs)
  
  return svgs.length
}

export default svgson
