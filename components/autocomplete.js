const createTree = require('functional-red-black-tree')
const startsWith = (str, x) => str.slice(0, x.length) === x

class Autocomplete {
  constructor () {
    this.tree = createTree()
  }
  add (k, v) {
    this.tree = this.tree.insert(k, v)
  }
  remove (k) {
    this.tree.remove(k)
  }
  complete (str) {
    let iter = this.tree.ge(str)
    let results = []
    while (iter.key && startsWith(iter.key, str)) {
      results.push(iter.value)
      iter.next()
    }
    return results
  }
}

module.exports = () => new Autocomplete()
