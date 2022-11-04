
import {toHtml} from 'hast-util-to-html'
import sastToHast from './sast-to-hast.js';
import toJson from './jast-to-json.js'

export default function responseToResult(response,options) {
    let sast = response.root
        
    if (options.log_sast) {
        console.log('= sast =================')
        console.log(sast);
    }

    let hast = sastToHast(sast)
    response.hastCallbacks.forEach((cb) => {
        cb.call(null,hast)
    })

    if (options.log_hast) {
        console.log('= hast =================')
        console.log(hast);
    }

    let html = toHtml(hast)

    if (options.log_html) {
        console.log('= html =================')
        console.log(html)
    }

    let jast = response.jsonTree

    if (options.log_jast) {
        console.log('= jast =================')
        console.log(jast);
    }

    let json = toJson(jast)
    if (json==null) json = {}

    if (options.log_json) {
        console.log('= json =================')
        console.log(json);
    }

    return {html: html, json: json}
}