
import util from 'node:util'

export default function inspect() {
    return (options = {}) => {
      return (tree, file) => {
        console.log('\n-- inspect --\n')
        console.log(util.inspect(tree,false,null,true));
      };
    };
  }