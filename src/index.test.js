import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import svgson, { stringify } from './index'
import _svgson from 'svgson'
import svgo from 'svgo'

const expect = chai.expect
chai.use(chaiAsPromised)
chai.should()

const svgoDefaultConfig = {
  plugins: [
    { removeStyleElement: true },
    { removeViewBox: false },
    {
      removeAttrs: {
        attrs: '(stroke-width|stroke-linecap|stroke-linejoin|)',
      },
    },
  ],
  multipass: true,
}

const optimizeSVG = (input, config) => {
  return new svgo(config).optimize(input).then(({ data }) => data)
}

const SVG =
  '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round"/></svg>'

const MULTIPLE_SVG = `
  <svg viewBox="0 0 100 100" width="100" height="100">
    <circle r="15" data-name="first" stroke-linecap="round"/>
  </svg>
  <svg viewBox="0 0 50 50" width="50" height="50">
    <title>Second SVG</title>
    <circle r="15" data-name="second" stroke-linecap="round"/>
  </svg>
`

const expected = [
  {
    type: 'element',
    name: 'svg',
    attributes: { width: '100', height: '100', viewBox: '0 0 100 100' },
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: {
          r: '15',
          'data-name': 'stroke',
          'stroke-linecap': 'round',
        },
        children: [],
        value: '',
      },
    ],
  },
]

const expectedOptimized = [
  {
    type: 'element',
    name: 'svg',
    attributes: { width: '100', height: '100', viewBox: '0 0 100 100' },
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        children: [],
        value: '',
      },
    ],
  },
  {
    type: 'element',
    name: 'svg',
    attributes: {},
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        children: [],
        value: '',
      },
    ],
  },
]

describe('svgson-next', () => {
  it('Fullfill a Promise', done => {
    svgson(SVG).should.be.fulfilled.notify(done)
  })

  it('Reject a Promise', done => {
    svgson('abc').should.be.rejected.notify(done)
  })

  it('Returns an Array when input is more than one SVG', done => {
    svgson(MULTIPLE_SVG)
      .should.eventually.be.an.instanceOf(Array)
      .notify(done)
  })

  it('Resulted nodes has basic keys', done => {
    svgson(SVG)
      .then(res => {
        expect(res).to.include.keys('name', 'attributes', 'children')
        done()
      })
      .catch(done)
  })

  it('Wrap nodes in pathKey', done => {
    svgson(SVG, { pathsKey: 'paths' })
      .then(res => {
        expect(res).to.include.key('paths')
        expect(res).to.eql({
          paths: expected[0],
        })
        done()
      })
      .catch(done)
  })

  it('Optimize using default config', done => {
    optimizeSVG(SVG, svgoDefaultConfig)
      .then(optimized => {
        svgson(optimized, { optimize: true }).then(res => {
          expect(res).to.eql(expectedOptimized[0])
          done()
        })
      })
      .catch(done)
  })

  it('Optimize using custom config', done => {
    optimizeSVG(SVG, {
      plugins: [
        {
          removeAttrs: {
            attrs: '(width|height)',
          },
        },
      ],
    })
      .then(optimized => {
        svgson(optimized).then(res => {
          expect(res).to.eql(expectedOptimized[1])
          done()
        })
      })
      .catch(done)
  })

  it('Adds custom attributes via transformNode', done => {
    svgson(SVG, {
      transformNode: node => ({
        ...node,
        foo: 'bar',
        test: false,
      }),
    })
      .then(res => {
        expect(res).to.include.keys('foo', 'test')
        expect(res).to.have.property('foo', 'bar')
        expect(res).to.have.property('test', false)
        expect(res).to.eql(
          Object.assign({}, expected[0], {
            foo: 'bar',
            test: false,
          })
        )
        done()
      })
      .catch(done)
  })

  it('Works in compat mode', done => {
    svgson(SVG, { compat: true })
      .then(res => {
        expect(res).to.include.keys('attrs', 'childs')
        _svgson(SVG, {}, old => {
          expect(res).to.deep.equal(old)
        })
        done()
      })
      .catch(done)
  })

  it('Applies camelCase', done => {
    svgson(SVG, {
      camelcase: true,
    })
      .then(res => {
        const childrenAttrs = res.children[0].attributes
        expect(childrenAttrs).to.deep.include.keys('strokeLinecap', 'data-name')
        expect(childrenAttrs).to.have.property('strokeLinecap', 'round')
        expect(childrenAttrs).to.have.property('data-name', 'stroke')
        done()
      })
      .catch(done)
  })

  it('Works with multiple SVG optimized', done => {
    // due to https://github.com/svg/svgo/issues/782
    svgson(MULTIPLE_SVG, {
      optimize: true,
    })
      .then(([svg1, svg2]) => {
        expect(svg1).to.not.have.property('name', 'root')
        expect(svg2).to.not.have.property('name', 'root')
        expect(svg1).to.have.property('name', 'svg')
        expect(svg2).to.have.property('name', 'svg')
        done()
      })
      .catch(done)
  })

  it('Stringify', done => {
    svgson(SVG)
      .then(res => {
        expect(SVG).to.be.equal(stringify(res))
        done()
      })
      .catch(done)
  })

  it('Works with doctype', done => {
    const svg = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 32 32">
<path class="st0" d="M16,16v15.5c0,0,9.3-2.6,12.7-15.5H16z"/>
</svg>`
    svgson(svg, { optimize: true })
      .then(res => {
        expect(res).to.have.property('name', 'svg')
        done()
      })
      .catch(done)
  })
})
