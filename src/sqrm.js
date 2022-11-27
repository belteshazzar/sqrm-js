
import SqrmDB from './SqrmDB.js'

export default function sqrm(src, db = new SqrmDB()) {
    return db.createDocument('default','document',src)
}