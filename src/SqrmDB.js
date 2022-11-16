
import mongo from 'mongols'

const defaults = {
    collection: 'default',
    name: 'doc',

    log_src: false,
    log_lines: false,
    log_sxast: false,
    log_code: false,

    log_sast: false,
    log_hast: false,
    log_html: false,
    log_jast: false,
    log_json: false
};

export default class SqrmDB {

    constructor(settings = {}) {
        this.settings = Object.assign({}, defaults, settings);
        this.settings.db = this
        this.collections = new Map()
        this.db = new mongo.DB()
        this.createCollection('default')
    }
  
    createCollection(name) {
        this.db.createCollection(name)
        let info = { name: name, docs: new Map(), docsBy_id: new Map() }
        this.collections.set(name,info)
        return info
    }

    // include(opts) {
    //     return h('span',{class: 'error'},[t(`error: includes not supported on this platform`)])
    // }
 
    // get(name) {
    // }
 
    find(collectionName,select,sort,skip,limit) {
    }
 
}