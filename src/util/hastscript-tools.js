
import * as smile2emoji from 'smile2emoji'
const { checkText,emojiMap } = smile2emoji
import {decode} from 'html-entities';
// import util from 'node:util'

export function t(str) {
    // TODO: raise as a bug?
   const leading = str.match(/^[\s]*/);
//   console.log('"'+str+'"')

    return {type: 'text', value: leading + decode(checkText(str),{level: 'html5'})};
}
