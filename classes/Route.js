const { serviceTime, speed } = require('../settings')
const { getDistance, getDistanceInTime } = require('../utils')

const Car = require('./Car')

module.exports = class {
  constructor () {
    this.car = new Car()
    this.route = []
  }

  getRoute () {
    return this.route
  }

  add (node) {
    this.route.push(node)
    node.inRoute = true
    this.car.serve(node.load)
  }

  getFirstNode () {
    return this.route[0]
  }

  getLastNode () {
    return this.route[this.route.length - 1]
  }

  getFullRoute () {
    let routeNodesId = this.route.map(n => n.id)
    return [0, ...routeNodesId, 0]
  }

  getTimeInRoute (distances) {
    let totalServiceTime = this.route.length * serviceTime

    return +(totalServiceTime + this.getRouteTravelTime(distances)).toFixed(3)
  }

  getRouteTravelTime (distances) {
    let totalTime = 0
    this.getFullRoute().reduce((prev, next) => {
      totalTime += getDistanceInTime(distances, speed, prev, next)
      return next
    })
    return totalTime
  }

  getRouteDistance (distances) {
    let result = 0
    let fullRoute = this.route.map(node => node.id)
    fullRoute = [0, ...fullRoute, 0]
    fullRoute.reduce((prev, cur) => {
      result += getDistance(distances, prev, cur)
      return cur
    })
    return +(result.toFixed(3))
  }

  getRouteLoad () {
    return this.route.reduce((result, node) => {
      result += node.load
      return +(result.toFixed(3))
    }, 0)
  }

  toPrint () {
    let route = this.route.map(node => node.id)
    return `${[0, ...route, 0].join('->')}`
  }

  toPrintTable (distances) {
    return [{
      route: this.toPrint(),
      totalDistance: this.getRouteDistance(distances),
      totalLoad: this.getRouteLoad(),
      totalTimeInRoute: this.getTimeInRoute(distances)
    }]
  }
}
