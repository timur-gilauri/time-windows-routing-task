const path = require('path')
const { execSync } = require('child_process')

let counter = 10000
let counterStep = 1000
let pathToProgram = path.resolve('./../')

for (; runScript(counter); counter += counterStep) {}

console.log('\n', 'Total normal executions: ' + counter, '\n')

function runScript (amount) {
  try {
    let result = execSync(`node index TEST=${amount}`, {
      cwd: pathToProgram
    }).toString()
    console.log(result)
    return true
  } catch (e) {
    return false
  }
}
