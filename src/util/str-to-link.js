
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

import linkifyStr from 'linkify-string';

const linkifyOptions = { defaultProtocol: 'https' };

function url(s) {
//    s = s.replace(/\\\\/g,'\\')
    const l = linkifyStr(s, linkifyOptions);
    const m = l.match(/"([^"]+)"/)

    if (m==null) {
        return null
    } else {
        return m[1]
    }
}

function internalLink(l) {
    switch(l[0]) {
        case '/':
            return '/' + encodeURIComponent(l.substring(1).replace(/ +/g,"_").toLowerCase());
        case '#':
            return '#' + encodeURIComponent(l.substring(1).replace(/ +/g,"_").toLowerCase());
        default:
            return null
    }
}

export default function strToLink(s) {

    var parts = s.split("|", 2);
    // console.log(parts)
    if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
        parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1]
        parts.pop();
    }
    if (parts.length == 1) {
        if (parts[0].trim() == '') {
            return null // not actually a link
        }

        let u = parts[0].trim().replace(/\\\]/g,']');

        if (u[0] == '^') {
            u = u.substring(1).trim();
            return { type: 'link', ref: `#footnote-${u}`, text: u }
        } else {
            const addr = parts[0].trim().replace(/\]/g,']');
            const u = url(addr)

            if (u==null) {
                const il = internalLink(addr)

                if (il == null) {
                    return { type: 'link', ref: addr.toLowerCase(), text: addr }
                // } else if (il[0] == '#') {
                //     return { type: 'link', ref: il, text: il }
                } else {
                    return { type: 'link', ref: il, text: il }
                }
            } else {
                return { type: 'link', ref: u, text: u }
            }
        }
    } else {
        const txt = parts[0].trim().replace(/\|/g,'|');
        const addr = parts[1].trim().replace(/\]/g,']');
        const u = url(addr)

        if (u==null) {
            const il = internalLink(addr)
            if (il == null) {
                return { type: 'link', ref: addr.toLowerCase(), text: txt }
            // } else if (il[0] == '#') {
            //     return { type: 'link', ref: il, text: txt }
            } else {
                return { type: 'link', ref: il, text: txt }
            }
        } else {
            return { type: 'link', ref: u, text: txt }
        }
    }
}
