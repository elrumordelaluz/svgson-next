<p align="center">
  <img alt="svgson" title="svgson" src="https://cdn.rawgit.com/elrumordelaluz/svgson/7883b450/logo.svg" width="450">
</p>

<p align="center">
  Simple tool to transform <code>svg</code> files and Strings into <code>Object</code> or <code>JSON</code>.
</p>
<p align="center">
  Useful to manipulate <code>SVG</code> with <code>js</code>, to store in noSQL databses.
</p>
<p align="center">
  This is the new version of <a href="https://github.com/elrumordelaluz/svgson">svgson</a>
</p>

[![Travis](https://img.shields.io/travis/elrumordelaluz/svgson-next.svg)](https://travis-ci.org/elrumordelaluz/svgson-next/)
[![Codecov](https://img.shields.io/codecov/c/github/elrumordelaluz/svgson-next.svg)](https://codecov.io/gh/elrumordelaluz/svgson-next)
[![Version](https://img.shields.io/npm/v/svgson-next.svg)](https://www.npmjs.com/package/svgson-next)
[![Download](https://img.shields.io/npm/dm/svgson-next.svg)](https://npm-stat.com/charts.html?package=svgson-next)
[![MIT License](https://img.shields.io/npm/l/svgson-next.svg)](https://opensource.org/licenses/MIT)

## Install

```
yarn add svgson-next
```

## Usage

```js
const svgson = require('svgson-next').default

svgson(`<svg>
  <line
    stroke= "#bada55"
    stroke-width= "2"
    stroke-linecap= "round"
    x1= "70"
    y1= "80"
    x2= "250"
    y2= "150">
  </line>
</svg>`)

/*
  {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: {},
    children: [
      {
        name: 'line',
        type: 'element',
        value: '',
        attributes: {
          stroke: '#bada55',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          x1: '70',
          y1: '80',
          x2: '250',
          y2: '150'
        },
        children: []
      }
    ]
  }
*/
```

```js
const { stringify } = require('svgson-next')

stringify(parsed)
```

Test in browser [here](https://codepen.io/elrumordelaluz/full/XBKedz/)

## API

svgson(input, [options])

#### input

Type: `String`

#### options

Type: `Object`

##### transformNode

Function to apply on each node when parsing, useful when need to reshape nodes or set default attributes.

Type: `Function`

Default: node => node

##### compat

Use keys from previuos version of `svgson`

Type: `Boolean`

Default: false

##### camelcase

Apply `camelCase` into attributes

Type: `Boolean`

Default: false

## Related

[svgson-cli](https://github.com/elrumordelaluz/svgson-cli) Transform SVG into `Object` from the Command Line

[element-to-path](https://github.com/elrumordelaluz/element-to-path) Convert SVG element into `path`

[path-that-svg](https://github.com/elrumordelaluz/path-that-svg) Convert entire SVG with `path`

[svg-path-tools](https://github.com/elrumordelaluz/svg-path-tools) Tools to manipulate SVG `path` (d)

## License

MIT © [Lionel T](https://lionel.tzatzk.in)
