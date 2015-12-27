var expr = require('expr-tree')
var _ = require('lodash')

module.exports = {
  // logs a tree to the console
  log: function (tree) {
    console.log((_.isString(tree) ? tree : expr.toRPN(tree)) + '\n')
  },

  // generate an expression tree
  maketree: function (pfunc, pvar, end) {
    // defaulting
    pfunc = pfunc || function(n) { return Math.min(1/Math.pow(Math.max(n-1, 0), 0.90), 0.6) }
    pvar = pvar || function(n) { return 0.3 }
    end = end || function (n) { return n >= 15 }

    var gen = (function(expression, n) {
      // defaulting
      expression = expression || { }
      n = n || 0
      var p = Math.random()

      // decide what we put in the tree
      if (p < pfunc(n) && !end(n)) {
        // a function
        expression.type = 'func'
        // pick a label
        expression.label = this.pick(expression.type)
        // we generate the children
        expression.children = _.map(_.range(expr.operators[expression.label].n), function(i) {
          return gen({ parent: expression }, n+1)
        })
      } else {
        // a value
        expression.type = p < pfunc(n) + pvar(n) ? 'var' : 'number'
        // pick a label
        expression.label = this.pick(expression.type)
      }
      // return the expression
      return expression
    }).bind(this)

    // generate three expressions
    var s1 = gen(), s2 = gen(), s3 = gen()

    // bind them
    var subroot = {
      type: 'func',
      label: '*',
      children: [s2, s3]
    }
    s2.parent = subroot
    s3.parent = subroot
    var root =  {
      type: 'func',
      label: '*',
      children: [s1, subroot]
    }
    s1.parent = root
    subroot.parent = root
    // return them
    return root
  },

  // picks a random value
  pick: function(what) {
    // what do we need
    if (what === 'number') {
      // returns a number >= 0 and < 10, w/ 2 decimals
      return (10*Math.random()).toFixed(2)
    } else if (what === 'var') {
      // return a variable
      return _.sample(['x', 'y', 't'])
    } else if (what === 'func') {
      // return a function
      return _.sample(_.keys(expr.operators))
    } else {
      // pick whaaaat ?
      return undefined
    }
  },
}
