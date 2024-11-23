
import parseText from '../src/util/parse-text.js'

const data = [
  ['one \\[Link back to H2] fred', [
    { type: 'text', value: 'one [Link back to H2] fred'}]],

  ['two [Link back to H2\\] fred', [
    { type: 'text', value: 'two [Link back to H2] fred' }]],

  ['three [ Link back to H2 ] fred', [
    { type: 'text', value: 'three ' },
    { type: 'link', ref: 'link back to h2', text: 'Link back to H2'},
    { type: 'text', value: ' fred'}]],

  ['four [ Link text | url ] fred', [
    { type: 'text', value: 'four ' },
    { type: 'link', ref: 'url', text: 'Link text' },
    { type: 'text', value: ' fred' }]],

  ['five [Link ba\\|ck to H2] fred', [
    { type: 'text', value: 'five ' },
    { type: 'link', ref: 'link ba|ck to h2', text: 'Link ba|ck to H2' },
    { type: 'text', value: ' fred' }]],

  ['six [Link ba\\]ck to H2] fred', [
    { type: 'text', value: 'six ' },
    { type: 'link', ref: 'link ba]ck to h2', text: 'Link ba]ck to H2' },
    { type: 'text', value: ' fred' }]],

  ['seven [Link ba\\ck to H2] fred', [
    { type: 'text', value: 'seven ' },
    { type: 'link', ref: 'link ba\\ck to h2', text: 'Link ba\\ck to H2' },
    { type: 'text', value: ' fred' }]],
]

describe("parse links test suite", () => {

  it.each(data)("test '%s'",(text,expected) => {

    let out = parseText(text)
    expect(out).not.toBeNull()
    expect(out).toEqual(expected)

  })

})
