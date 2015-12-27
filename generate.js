var gifpainter = require('./lib/gifpainter.js')
var fitness = require('./lib/fitness.js')
var tools = require('./lib/tools.js')
var format = require('string-format')
var expr = require('expr-tree')
var moment = require('moment')
var _ = require('lodash')
var fs = require('fs')
// add format method to string
format.extend(String.prototype)
// add new expressions to expr
expr.operators['gamma'] = { n:1, js:'gamma({0})' }
expr.operators['lngamma'] = { n:1, js:'math.cosh({0})' }
expr.operators['sinh'] = { n:1, js:'math.sinh({0})' }
expr.operators['cosh'] = { n:1, js:'math.cosh({0})' }
expr.operators['cbrt'] = { n:1, js:'math.cbrt({0})' }
expr.operators['sinc'] = { n:1, js:'((function(a) { return a != 0 ? Math.sin(a) / a : 1 })({0}))' }

expr.operators['%'] = { n:2, js:'(function(a,b) { return b != 0 ? a % b : 0 })({0}, {1})' }
expr.operators['/'] = { n:2, js:'(function(a,b) { return a / b })({0}, {1})' }


// the size of the population.
// the bigger it is, the slower it gets.
// increasing the number will allow for more genetic diversity.
var n = 350
// the number of generations where the algorithm will proceed.
// too much generations on a too small population give uniform results,
// whereas too few generations on a too big population give random results
var tmax = 450
// the probability of a mutation (resp. a crossover)
// too few alters genetic diversity
// too many prevent a good candidate to emerge due to genetic instability
var pmutation = 0.3, pcrossover = 0.1
// the fitness function : takes an expression (from expr-tree), returns
// a number between 0 and 1. the fittest an individual is, the highest is its
// fitness score.
// changing this function will drastically change the result of evolution,
// since it describes what a 'good' or 'bad' expression is.
var fitness = fitness.complicated

// populate the forest
var forest = _.map(_.range(n), function (i) { return tools.maketree() })

// we enter the loop
for (var t = 0; t < tmax; t++) {
  // counters
  var generation = {
    t: t,
    mutations: 0,
    crossovers: 0
  }
  pMutation = pmutation / Math.pow(t + 1, pmutation)

  // check if population is empty
  if (_.isEmpty(forest)) {
    console.log('all the trees died out. the forest is empty.')
    process.exit()
  }

  // procreate
  forest = forest.concat(_.range(n).map(function (i) {
    var parents = _.sample(forest, 2)
    return expr.reproduce(parents[0], parents[1])
  }))

  // mutate
  _.forEach(forest, function (tree) {
    if (Math.random() < pmutation) {
      // up to n mutations
      var n = _.random(0, 5)
      generation.mutations += n
      _.forEach(_.range(n), function(i) { expr.mutate(tree, tools.pick) })
    }
  })

  // crossover
  _.forEach(forest, function (tree) {
    if (Math.random() < pcrossover) {
      generation.crossovers ++
      expr.crossover(tree)
    }
  })

  // select (tournament)
  var poolA = _.sample(_.shuffle(forest), Math.floor(forest.length/2))
  var poolB = _.shuffle(_.without(forest, poolA))
  forest = _.map(poolA, function(tree, k) {
    return fitness(poolA[k]) > fitness(poolB[k]) ? poolA[k] : poolB[k]
  })

  // display info
  generation.n = forest.length
  console.log('generation {t} : n={n}    n_mutations={mutations}   n_crossovers={crossovers} '.format(generation))
}

// display the forest
_.forEach(forest, function(i, k) {
  console.log('{fitness},         {rpn}\n'.format({
    fitness: fitness(i).toFixed(3),
    rpn: expr.toRPN(i)
  }))
})

// create the params object
var params = {
  n: n,
  tmax: tmax,
  pmutation: pmutation,
  pcrossover: pcrossover
}

// create a folder
var folder = __dirname + '/gif/batch' + moment().unix() + '/'
fs.mkdir(folder, function (err) {
  if (err) {
    console.log(err)
    process.exit()
  }
  fs.writeFile(folder + 'batch.txt', JSON.stringify(params, null, 4), function(err) {
    if (err) {
      console.log(err)
      process.exit()
    }
    saveBatch(forest, folder)
  })
})

// savign a batch of files
function saveBatch(forest, folder) {
  // getting a tree
  var tree = forest.shift()
  if (tree) {
    // find a filename
    var filename = moment().unix().toString()
    // display info
    tools.log(tree)
    console.log(filename + '.(gif|txt)')
    console.log('{n} left'.format({ n: forest.length }))
    // write the txt file
    fs.writeFile(folder + filename + '.txt', expr.toRPN(tree), function(err) {
      if (err) {
        console.log(err)
        process.exit()
      } else {
        console.log("saved!");
        // save gif
        var gs = gifpainter.toGIF(tree)
        gs.pipe(fs.createWriteStream(folder + filename + '.gif'))
        gs.on('end', function() {
          saveBatch(forest, folder)
        })
      }
    })
  }
}
