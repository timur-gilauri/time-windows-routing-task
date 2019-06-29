let args = process.argv.slice(2)
let arguments = args.reduce((r, a) => {
  let key = (a.split('=')[0]).toLowerCase()
  let value = a.split('=')[1]
  value = value ? value.toLowerCase() : true
  r[key] = value
  return r
}, {})

const TEST = 'test' in arguments
const SHOW_ROUTES = 'show_routes' in arguments
const SAVE_DATA = 'save_data' in arguments

const fs = require('fs')
const path = require('path')
const testsPath = path.resolve('./tests')

const Node = require('./classes/Node')
const Route = require('./classes/Route')
let nodesData = require('./data/nodes')
let distances = require('./data/distance')

const { serviceTime, speed } = require('./settings')

const {
  getDistanceInTime,
  getEarliestUnusedNodeByOpenTime, getSortedNodesByDistance,
  generateNodes, generateDistance, getClosestTimeWindowsForRoute,
  flattenDeep, generateRandomStringSalt
} = require('./utils')

let nodesAmount = nodesData.length
let sortedDistances = flattenDeep(distances).sort()
let minDistance = sortedDistances[0]
let maxDistance = sortedDistances[sortedDistances.length - 1]

if (TEST) {
  nodesAmount = +arguments['test']
  if (nodesAmount <= 0) {
    console.error('Указано неправильное количество точек')
    return false
  }
  if (!Number.isInteger(+arguments['test'])) {
    console.error('Неправильный формат тестовой нагрузки')
    return false
  }

  let generatedDistances = generateDistance(nodesAmount, 1, 12)
  nodesData = generateNodes(nodesAmount)
  distances = generatedDistances.distances
  minDistance = generatedDistances.minDistance
  maxDistance = generatedDistances.maxDistance
}

let minNodeLoad = nodesData[0].load
let maxNodeLoad = nodesData[0].load

if (SAVE_DATA && TEST) {
  let date = Date.now()
  let dirPath = path.resolve(testsPath, `${date}_${generateRandomStringSalt(3)}`)
  let nodesPath = path.join(dirPath, 'nodes.json')
  let distancesPath = path.join(dirPath, 'distances.json')

  try {
    fs.mkdirSync(dirPath)

    try {
      fs.writeFileSync(nodesPath, JSON.stringify(nodesData))

    } catch (e) {
      console.log('Ошибка при записи файла точек')
    }
    try {
      fs.writeFileSync(distancesPath, JSON.stringify(distances))

    } catch (e) {
      console.log('Ошибка при записи файла растояний')
    }
  } catch (e) {

  }
}

let nodes = nodesData.map(node => {
  if (node.load < minNodeLoad) minNodeLoad = node.load
  if (node.load > maxNodeLoad) maxNodeLoad = node.load
  return new Node(...Object.values(node))
})

let groupedNodes = nodes.reduce((result, point) => {
  if (!result.hasOwnProperty(point.close)) {
    result[point.close] = {}
  }
  result[point.close][point.id] = point
  return result
}, {})

function calcRoute (route) {
  // Проверяем, не пуста ли машина
  if (route.car.isEmpty()) {
    return
  }

  // Получаем список доступных окон
  let closeTimeArr = getClosestTimeWindowsForRoute(groupedNodes, route, distances, serviceTime)

  // Перебираем каждую группу
  for (let timeToSearchNext of closeTimeArr) {
    // Если машина пуста или имеет недостаточно товара для обслуживания минимальной потребности - выходим, маршрут построен
    if (route.car.isEmpty() || !route.car.hasEnoughLoadToServe(minNodeLoad)) {
      break
    }
    // Группа точек  находится по ключу - времени закрытия
    let groupToSearch = groupedNodes[timeToSearchNext]

    // Если в группе нет точек, удаляем группу из списка, чтобы никогда по ней не проходить и идем на следующую иттерацию
    if (!Object.keys(groupToSearch).length) {
      delete groupedNodes[timeToSearchNext]
      continue
    }
    // Сортируем точки по расстоянию от последней точки в маршруте
    let nodesGroup = getSortedNodesByDistance(distances, route.getLastNode(), Object.values(groupToSearch))

    // Перебираем все точки
    for (let node of nodesGroup) {
      if (route.car.isEmpty() || !route.car.hasEnoughLoadToServe(minNodeLoad)) {
        break
      }
      // Находим время до текущей точки
      let timeToNode = getDistanceInTime(distances, speed, route.getLastNode().id, node.id) + serviceTime
      // Если мы успеваем доехать до нее и обслужить ее до закрытия окна - добавляем ее в маршрут и удаляем ее из общего списка точек
      if ((route.getTimeInRoute(distances) + timeToNode < node.close) && route.car.hasEnoughLoadToServe(node.load)) {
        route.add(node)
        delete groupedNodes[timeToSearchNext][node.id]
      }
    }
    if (!Object.keys(groupToSearch).length) {
      delete groupedNodes[timeToSearchNext]
    }
  }

}

let routes = []
let programTime = Date.now()

while (true) {
  let node = getEarliestUnusedNodeByOpenTime(groupedNodes)
  if (!node) {
    break
  }

  let route = new Route()

  route.add(node)
  delete groupedNodes[node.close][node.id]

  calcRoute(route)
  routes.push(route)
}

programTime = Date.now() - programTime

if (SHOW_ROUTES) {
  routes.forEach((route, i) => {
    console.log(`Route #${++i}: ${route.toPrint()}\n`)
    console.table(route.toPrintTable(distances))
    console.log(`\n===================\n`)
  })
}

console.log(`Количество точек: ${nodesAmount}\n`)
console.table({
  'Min load': minNodeLoad,
  'Max load': maxNodeLoad,
  'Min distance': minDistance,
  'Max distance': maxDistance,
})
console.log(`Program execution time: ${programTime}мс`)
console.log(`Routes found: ${routes.length}\n`)
