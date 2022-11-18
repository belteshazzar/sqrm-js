
import * as smile2emoji from 'smile2emoji'
const { checkText,emojiMap } = smile2emoji
import {decode} from 'html-entities';

export function t(str) {
    return {type: 'text', value: decode(checkText(str),{level: 'html5'})};
}
