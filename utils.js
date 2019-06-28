function getDistance (distances, a, b) {
  if (b < a) {
    let c = a
    a = b
    b = c
  }

  try {
    return distances[a][b - a - 1]
  } catch (e) {
    console.log(e)
  }
}

function getDistanceInTime (distances, speed, a, b) {
  let speedInM = speed * 1000 / 3600
  let distance = getDistance(distances, a, b)
  return parseFloat(((distance * 1000) / speedInM / 3600).toFixed(4))
}

function getEarliestUnusedNodeByOpenTime (groupedNodes) {
  let groups = Object.values(groupedNodes)
  if (!groups.length) {
    return null
  }
  let group = groups.shift()
  while (Object.keys(groups).length && (!group || !Object.keys(group).length)) {
    group = groups.shift()
  }
  return Object.values(group).shift()
}

function getSortedNodesByDistance (distances, fromNode, nodes) {
  if (!nodes.length) {
    return nodes
  }
  return nodes.sort(function (a, b) {
    if (getDistance(distances, fromNode.id, a.id) <= getDistance(distances, fromNode.id, b.id)) {
      return a
    }
    return b
  })
}

function generateNodes (amount = 10, minLoad = 100, maxLoad = 1000, minOpenTime = 6, maxCloseTime = 19, windowSize = 2) {
  let maxOpenTime = maxCloseTime - windowSize
  return new Array(amount).fill(0).map((node, i) => {
    let open = randomInteger(minOpenTime, maxOpenTime, 0)
    return {
      id: ++i,
      load: randomInteger(minLoad, maxLoad, 2),
      open,
      close: open + windowSize
    }
  })
}

function generateDistance (amount, min, max) {
  let distances = []
  let minDistance = max
  let maxDistance = min
  for (let i = amount; i > 0; i--) {
    let dist = []
    for (let j = 0; j < i; j++) {
      let currentDistance = randomInteger(min, max, 3)
      dist.push(currentDistance)
      if (currentDistance > maxDistance) {
        maxDistance = currentDistance
      }
      if (currentDistance < minDistance) {
        minDistance = currentDistance
      }
    }
    distances.push(dist)
  }
  return {
    distances,
    minDistance,
    maxDistance
  }
}

function removeEl (source, positions) {
  if (!Array.isArray(positions)) {
    positions = [positions]
  }
  positions.forEach((item, index) => {
    source.splice(item - index, 1)
  })
}

function randomInteger (min, max, toFixed) {
  let random = min + Math.random() * (max + 1 - min)
  if (typeof toFixed !== 'undefined') {
    if (toFixed === 0 && random > 0) {
      return Math.round(random)
    }
    return +(random.toFixed(toFixed))
  }
  return random
}

function flattenDeep (source) {
  return source.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), [])
}

function getClosestTimeWindowsForRoute (groupedNodes, route, distances, serviceTime) {
  return Object.keys(groupedNodes).filter(closeTime => closeTime > route.getTimeInRoute(distances) + serviceTime)
}

function generateRandomStringSalt (length = 7) {
  return Math.random().toString(36).slice(2, length) + Math.random().toString(36).slice(2, length)
}

module.exports.removeEl = removeEl
module.exports.flattenDeep = flattenDeep
module.exports.getDistance = getDistance
module.exports.generateNodes = generateNodes
module.exports.generateDistance = generateDistance
module.exports.getDistanceInTime = getDistanceInTime
module.exports.generateRandomStringSalt = generateRandomStringSalt
module.exports.getSortedNodesByDistance = getSortedNodesByDistance
module.exports.getClosestTimeWindowsForRoute = getClosestTimeWindowsForRoute
module.exports.getEarliestUnusedNodeByOpenTime = getEarliestUnusedNodeByOpenTime
