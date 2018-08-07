import test from 'ava'
import svgson, { stringify } from './dist/svgson.cjs'
import _svgson from 'svgson'
import svgo from 'svgo'
import { expect } from 'chai'

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
const expected = {
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
}

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

const expectedMultiple = [
  {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: { viewBox: '0 0 100 100', width: '100', height: '100' },
    children: [
      {
        name: 'circle',
        type: 'element',
        value: '',
        attributes: {
          r: '15',
          'stroke-linecap': 'round',
          'data-name': 'first',
        },
        children: [],
      },
    ],
  },
  {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: { viewBox: '0 0 50 50', width: '50', height: '50' },
    children: [
      {
        name: 'title',
        type: 'element',
        value: '',
        attributes: {},
        children: [
          {
            name: '',
            type: 'text',
            value: 'Second SVG',
            attributes: {},
            children: [],
          },
        ],
      },
      {
        name: 'circle',
        type: 'element',
        value: '',
        attributes: {
          r: '15',
          'stroke-linecap': 'round',
          'data-name': 'second',
        },
        children: [],
      },
    ],
  },
]

// <svg viewBox="0 0 100 100" width="100" height="100">
// <circle r="15" data-name="first" stroke-linecap="round"/>
// </svg>
// <svg viewBox="0 0 50 50" width="50" height="50">
// <title>Second SVG</title>
// <circle r="15" data-name="second" stroke-linecap="round"/>
// </svg>

test('Fullfill a Promise', async t => {
  await t.notThrows(svgson(SVG))
})

test('Reject a Promise', async t => {
  await t.throws(svgson('abc'))
})

test('Returns an Array when input is more than one SVG', async t => {
  const res = await svgson(MULTIPLE_SVG)
  t.true(Array.isArray(res))
})

test('Works with Array and compat mode', async t => {
  const res = await svgson(MULTIPLE_SVG, { compat: true })
  t.true(Array.isArray(res))
})

test('Resulted nodes has basic keys', async t => {
  const res = await svgson(SVG)
  const keys = Object.keys(res)
  t.true(keys.includes('type'))
  t.true(keys.includes('name'))
  t.true(keys.includes('attributes'))
  t.true(keys.includes('children'))
})

test('Wrap nodes in pathKey', async t => {
  const res = await svgson(SVG, { pathsKey: 'paths' })
  const keys = Object.keys(res)
  t.true(keys.includes('paths'))
  t.deepEqual(res, {
    paths: expected,
  })
})

test('Wrap nodes in pathKey with multiple input', async t => {
  const res = await svgson(MULTIPLE_SVG, { pathsKey: 'paths' })
  const keys = Object.keys(res)
  t.true(keys.includes('paths'))
  t.deepEqual(res, {
    paths: expectedMultiple,
  })
})

test('Optimize using default config', async t => {
  const optimized = await optimizeSVG(SVG, svgoDefaultConfig)
  const res = await svgson(optimized)
  t.deepEqual(res, expectedOptimized[0])
})

test('Optimize using custom config', async t => {
  const optimized = await optimizeSVG(SVG, {
    plugins: [
      {
        removeAttrs: {
          attrs: '(width|height)',
        },
      },
    ],
  })
  const res = await svgson(optimized)
  t.deepEqual(res, expectedOptimized[1])
})

test('Adds custom attributes via transformNode', async t => {
  const res = await svgson(SVG, {
    transformNode: node => Object.assign({}, node, { foo: 'bar', test: false }),
  })
  const keys = Object.keys(res)
  const values = Object.values(res)
  t.true(keys.includes('foo'))
  t.true(keys.includes('test'))
  t.true(values.includes('bar'))
  t.true(values.includes(false))
  t.deepEqual(
    res,
    Object.assign({}, expected, {
      foo: 'bar',
      test: false,
    })
  )
})

test.cb('Works in compat mode', t => {
  svgson(SVG, { compat: true }).then(res => {
    _svgson(SVG, {}, old => {
      t.deepEqual(res, old)
      t.end()
    })
  })
})

test.cb('Applies camelCase', t => {
  svgson(SVG, {
    camelcase: true,
  }).then(res => {
    const childrenAttrs = res.children[0].attributes
    expect(childrenAttrs).to.deep.include.keys('strokeLinecap', 'data-name')
    expect(childrenAttrs).to.have.property('strokeLinecap', 'round')
    expect(childrenAttrs).to.have.property('data-name', 'stroke')
    t.end()
  })
})

test('Stringify', async t => {
  const res = await svgson(SVG)
  t.is(SVG, stringify(res))
})

test('Works with doctype', async t => {
  const svg = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 32 32">
<path class="st0" d="M16,16v15.5c0,0,9.3-2.6,12.7-15.5H16z"/>
</svg>`
  const res = await svgson(svg)
  const keys = Object.keys(res)
  t.true(keys.includes('name'))
  t.true(res.name === 'svg')
})
