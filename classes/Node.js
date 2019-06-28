module.exports = class Node {
  constructor (id, load, open, close) {
    this.id = id
    this.load = load
    this.open = open
    this.close = close
    this.inRoute = false
  }
}
