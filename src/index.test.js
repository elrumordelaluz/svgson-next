import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import svgson from './index'
import _svgson from 'svgson'

const expect = chai.expect
chai.use(chaiAsPromised)
chai.should()

const SVG =
  '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round" /></svg>'

const MULTIPLE_SVG = `
  <svg viewBox="0 0 100 100" width="100" height="100">
    <circle r="15" data-name="first" stroke-linecap="round" />
  </svg>
  <svg viewBox="0 0 50 50" width="50" height="50">
    <title>Second SVG</title>
    <circle r="15" data-name="second" stroke-linecap="round" />
  </svg>
`


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
    attribs: {},
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

describe('svgson-next', () => {
  it('Fullfill a Promise', done => {
    svgson(SVG).should.be.fulfilled.notify(done)
  })

  it('Reject a Promise', done => {
    svgson('abc').should.be.rejected.notify(done)
  })

  it('Returns an Array', done => {
    svgson(SVG).should.eventually.be.an.instanceOf(Array).notify(done)
  })

  it('Resulted nodes has basic keys', done => {
    svgson(SVG)
      .then(([res]) => {
        expect(res).to.include.keys('name', 'attribs', 'children')
        done()
      })
      .catch(done)
  })

  it('Wrap nodes in pathKey', done => {
    svgson(SVG, { pathsKey: 'paths' })
      .then(([res]) => {
        expect(res).to.include.key('paths')
        expect(res).to.eql({
          paths: expected[0],
        })
        done()
      })
      .catch(done)
  })

  it('Optimize using default config', done => {
    svgson(SVG, { optimize: true })
      .then(([res]) => {
        expect(res).to.eql(expectedOptimized[0])
        done()
      })
      .catch(done)
  })

  it('Optimize using custom config', done => {
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
    })
      .then(([res]) => {
        expect(res).to.eql(expectedOptimized[1])
        done()
      })
      .catch(done)
  })

  it('Adds custom attributes', done => {
    svgson(SVG, {
      customAttrs: {
        foo: 'bar',
        test: false,
      },
    })
      .then(([res]) => {
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
      .then(([res]) => {
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
      camelcase: true
    })
      .then(([res]) => {
        const childrenAttrs = res.children[0].attribs
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
      optimize: true
    })
      .then(([res]) => {
        const childrenAttrs = res.children[0].attribs
        expect(res).to.not.have.property('name', 'root')
        expect(res).to.have.property('name', 'svg')
        done()
      })
      .catch(done)
  })
})
