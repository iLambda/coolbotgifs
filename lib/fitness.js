var expr = require('expr-tree')
var _ = require('lodash')
var analysis = require('./analysis.js')

module.exports = {
  complicated: function(tree) {
    // defaulting inputs
    tree = _.isString(tree) ? expr.fromRPN(tree) : tree

    // get the number of nodes
    var n = analysis.occurences(tree)
    // get the number of functions that have two or more args
    var p = analysis.occurences(tree, function (subexpr) {
      return subexpr.type == 'func' && expr.operators[subexpr.label].n > 1
    })
    // establishing the drawbacks
    var drawbacks = (function(tree) {
      // initalize the counter
      var sum = 0
      // if the tree is constant
      sum = analysis.isConstant(tree) ? Infinity : sum
      // if the tree doesn't depend on x or y or t
      sum = !analysis.dependsOn(tree, 'x') ? (sum+2) : sum
      sum = !analysis.dependsOn(tree, 'y') ? (sum+2) : sum
      sum = !analysis.dependsOn(tree, 't') ? (sum+0.5) : sum
      // if the tree is monomial
      sum = analysis.isMonomial(tree) ? (sum+1) : sum

      // return the sum of the drawbacks
      return sum
    })(tree)

    /*
     *  n : account for the number of tokens in the expr
     *  p : account for the number of functions w/
     *  score : relative score
     *  drawbacks : serious drawbacks
     */
    var nExpectation = 35, nVariance = 15
    var nProba = Math.exp(-Math.pow(n - nExpectation, 2) / nVariance)

    var pExpectation = 2, pVariance = 1/3.45
    var pProba = 1 / (1 + Math.exp((p - pExpectation) / -pVariance))

    var drawbacksProba = Math.exp(-drawbacks)

    return Math.min(1, Math.max(0, nProba * pProba * drawbacksProba))
  }
}
