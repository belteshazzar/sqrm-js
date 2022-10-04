
import * as smile2emoji from 'smile2emoji'
const { checkText,emojiMap } = smile2emoji

export function t(str) {
    return {type: 'text', value: checkText(str)};
}

export function i(str,args) {
    return {type: 'include', value: str, args: args};
}

export function j(name,value) {
    return {type: 'json', name: name, value: value};
}