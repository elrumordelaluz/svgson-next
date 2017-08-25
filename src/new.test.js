import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import svgson from './new'
chai.should()

const SVG =
  '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round" /></svg>'

const expected = [
  {
    type: 'tag',
    name: 'svg',
    attribs: { width: '100', height: '100', viewBox: '0 0 100 100' },
    children: [
      {
        type: 'tag',
        name: 'circle',
        attribs: { r: '15', 'data-name': 'stroke', 'stroke-linecap': 'round' },
        children: [],
      },
    ],
  },
]

const expectedOptimized = [
  {
    type: 'tag',
    name: 'svg',
    attribs: { width: '100', height: '100', viewBox: '0 0 100 100' },
    children: [
      {
        type: 'tag',
        name: 'circle',
        attribs: { r: '15', 'data-name': 'stroke' },
        children: [],
      },
    ],
  },
  {
    type: 'tag',
    name: 'svg',
    attribs: { viewBox: '0 0 100 100' },
    children: [
      {
        type: 'tag',
        name: 'circle',
        attribs: { r: '15', 'data-name': 'stroke' },
        children: [],
      },
    ],
  },
]

describe('svgson 2.0.0', () => {
  it('Fullfill a Promise', () => {
    svgson(SVG).should.be.fulfilled
  })

  it('Reject a Promise', () => {
    svgson('abc').should.be.rejected
  })

  it('Returns an Array', done => {
    svgson(SVG).should.eventually.be.an.instanceOf(Array).notify(done)
  })

  it('Resulted nodes has basic keys', () => {
    svgson(SVG).then(([res]) => {
      expect(res).to.include.keys('name', 'attribs', 'children')
    })
  })

  it('Wrap nodes in pathKey', () => {
    svgson(SVG, { pathsKey: 'paths' }).then(([res]) => {
      expect(res).to.include.key('paths')
      expect(res).to.eql({
        paths: expected[0],
      })
    })
  })

  it('Optimize using default config', () => {
    svgson(SVG, { optimize: true }).then(([res]) => {
      expect(res).to.eql(expectedOptimized[0])
    })
  })

  it('Optimize using custom config', () => {
    svgson(SVG, {
      optimize: true,
      svgoConfig: {
        plugins: [
          {
            removeAttrs: {
              attrs: '(width|height)',
            },
          },
        ],
      },
    }).then(([res]) => {
      expect(res).to.eql(expectedOptimized[1])
    })
  })

  it('Adds custom attributes', () => {
    svgson(SVG, {
      customAttrs: {
        foo: 'bar',
        test: true,
      },
    }).then(([res]) => {
      expect(res).to.include.keys('foo', 'test')
      expect(res).to.have.property('foo', 'bar')
      expect(res).to.have.property('test', true)
      expect(res).to.eql(
        Object.assign({}, expected[0], {
          foo: 'bar',
          test: true,
        })
      )
    })
  })
})
