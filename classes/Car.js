let { carLoad } = require('../settings')

module.exports = class Car {
  constructor () {
    this.load = carLoad
  }

  serve (load) {
    this.load -= load
  }

  isEmpty () {
    return this.load === 0
  }

  hasEnoughLoadToServe (load) {
    return this.load >= load
  }
}
