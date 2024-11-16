
import {GENERATOR, generate} from 'astring'

export default function compileEcma(options) {
  const self = this
  const settings = {...self.data('settings'), ...options}
  self.compiler = compiler

  function compiler(tree) {

    const {SourceMapGenerator, filePath, handlers} = self.settings || {}
    const sourceMap = SourceMapGenerator
      ? new SourceMapGenerator({file: filePath || '<unknown>.js'})
      : undefined
  
    const value = generate(
      tree,
      {
        comments: true,
        generator: {...GENERATOR, ...handlers},
        sourceMap: sourceMap || undefined
      }
    )
    const map = sourceMap ? sourceMap.toJSON() : undefined
  
    return {value, map}
  }
}
