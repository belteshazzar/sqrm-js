
export default function toJson(jast) {

    if (jast==null) return null
    
    if (jast.type == 'value') return jast.value

    if (jast.type == 'array') {
        let a = []
        for (let i=0 ; i<jast.children.length ; i++) {
            a.push(toJson(jast.children[i]))
        }
        return a
    }
    if (jast.type == 'object') {
        let o = {}
        for (let i=0 ; i<jast.children.length ; i++) {
            o[jast.children[i].name] = toJson(jast.children[i])
        }
        return o
    }

    if (jast.type == 'unknown') {
        return null;
    }

    console.log('toJson Error, unhandled type: ',jast)
}