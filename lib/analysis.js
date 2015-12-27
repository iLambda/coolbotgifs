var expr = require('expr-tree');
var _ = require('lodash')
var t = require('t')

module.exports = {
  // check the tree to see if it depends on a var
  dependsOn: function(tree, variable) {
    // default args
    tree = _.isString(tree) ? expr.fromRPN(tree) : tree
    // check validity
    if (!_.isString(variable)) {
      return undefined
    }
    // search tree
    var node = t.find(tree, function (node) {
      return node.type == 'var' && node.label == variable
    })
    // return
    return node ? true : false
  },

  // check if a tree is constant
  isConstant: function(tree) {
    // default args
    tree = _.isString(tree) ? expr.fromRPN(tree) : tree
    // return
    return tree.type == 'number' || (tree.type == 'func' && _.all(tree.children, this.isConstant, this))
  },

  // check if a tree is monomial
  isMonomial: function(tree) {
    // default args
    tree = _.isString(tree) ? expr.fromRPN(tree) : tree
    // return
    return tree.type != 'func'
        || (tree.type == 'func'
            && (this.isConstant(tree)
                || (_.contains(['*', '+', '-', '/'], tree.label)
                    && _.all(tree.children, this.isMonomial, this))))
   },
   // get the number of occurences of tokens
   occurences: function(tree, args) {
     // default args
     tree = _.isString(tree) ? expr.fromRPN(tree) : tree
     var n = 0, tokens

     // if args is not a predicate, we build one
     if (!args) {
       args = _.constant(true)
     } else if (!_.isFunction(args)) {
       tokens = _.isArray(args) ? args : [args]
       args = function(tree) { return _.contains(tokens, tree.label) }
     }

     // go through the expr
     t.bfs(tree, function(subtree) {
       // predicate result
       var res = args(subtree)
       if (_.isNumber(res)) {
         n = n + res
       } else {
         n = n + (res ? 1 : 0)
       }
     })

     // return the number of occurences
     return n
   }
}
