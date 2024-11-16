
import parseText from '../src/util/parse-text.js'

const formattingData = [
  ['blah blah', [{ type: 'text', value: 'blah blah'}]],
  ['blah !! blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'bold'},{type:'text', value: ' blah'}]],
  ['blah ** blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'bold'},{type:'text', value: ' blah'}]],
  ['blah ___ blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'underline'},{type:'text', value: ' blah'}]],
  ['blah --- blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'strike-through'},{type:'text', value: ' blah'}]],
  ['blah ^^^ blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'superscript'},{type:'text', value: ' blah'}]],
  ['blah //// blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'italic'},{type:'text', value: ' blah'}]],
  ['blah ~~ blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'italic'},{type:'text', value: ' blah'}]],
  ['blah `` blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'code'},{type:'text', value: ' blah'}]],
  ['blah $$ blah', [{ type: 'text', value: 'blah ' }, {type: 'format', style: 'kbd'},{type:'text', value: ' blah'}]],
  ['blah \$ blah', [{ type: 'text', value: 'blah $ blah'}]],
]

describe("parse text test suite", () => {

  it.each(formattingData)("test '%s'",(text,expected) => {

    let out = parseText(text)
    expect(out).not.toBeNull()
    expect(out).toEqual(expected)

  })

})
