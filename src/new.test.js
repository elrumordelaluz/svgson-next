import { expect } from 'chai'
import n from './new'

const SVG = `
  <svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round" /></svg>
  <svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round" /></svg>
`;

describe('new svgson', () => {
  it('returns 2', () => {
    const val = n(SVG)
    expect(val).to.eql(2);
  });
})
