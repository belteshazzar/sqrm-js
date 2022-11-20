
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

import linkifyStr from 'linkify-string';

const linkifyOptions = { defaultProtocol: 'https' };

function url(s) {
    s = s.replace(/\\\\/g,'\\')
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
    if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
        parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1]
        parts.pop();
    }
    if (parts.length == 1) {
        if (parts[0].trim() == '') {
            return t(`[${s}]`)
        }

        let u = parts[0].trim().replace(/\\\]/g,']');

        if (u[0] == '^') {
            u = u.substring(1).trim();
            return h('sup',{},[ h('a',{'footnote-u':u,'href': `#footnote-${u}`},[t(`TBD`)])])
        } else {
            const addr = parts[0].trim().replace(/\]/g,']');
            const u = url(addr)
            if (u==null) {
                const il = internalLink(addr)
                if (il == null) {
                    return h('a',{'link-ref':addr.toLowerCase()},[t(addr)])
                } else {
                    return h('a',{'href':il},[t(il)])
                }
            } else {
                return h('a',{'href':u},[t(u)])
            }
        }
    } else {
        const txt = parts[0].trim().replace(/\|/g,'|');
        const addr = parts[1].trim().replace(/\]/g,']');
        const u = url(addr)
        if (u==null) {
            const il = internalLink(addr)
            if (il == null) {
                return h('a',{'link-ref':addr.toLowerCase()},[t(txt)])
            } else {
                return h('a',{'href':il},[t(txt)])
            }
        } else {
            return h('a',{'href':u},[t(txt)])
        }
    }
}
