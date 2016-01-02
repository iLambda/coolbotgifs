# coolbotgifs
An artist bot which uses genetic algorithms on mathematical expression trees to generate artsy animated GIFs.

### install
To install the algorithm, clone the repository.
You will need to install [node-canvas](https://github.com/Automattic/node-canvas#installation) to be able to start the algorithm. Follow the link and install node-canvas dependencies. Then type :
```bash
$ npm install
```
### start
To start the algorithm, you can type :
```bash
$ npm start
```
```bash
$ nodejs generate.js
```

# how does it work ?

**Coolbotgifs** is a bot who creates GIFs. Internally, it starts by creating a
lot of random [mathematical functions](https://en.wikipedia.org/wiki/Binary_expression_tree). Those functions all depend on three parameters.
Then, it uses a [genetic algorithm](https://fr.wikipedia.org/wiki/Algorithme_g%C3%A9n%C3%A9tique) to mimic the process of evolution and sort
potentially good or bad looking expressions. Once the overall quality of
mathematical expressions is good enough, it starts transforming the expressions to GIFs. To proceed, it loops through all the functions and apply each of them to a matrix of pixels.

Don't worry if your computer fans start getting excited : the task is [pretty computationally expensive](https://vine.co/v/iKJOx272Y0m).
Your CPU will stop struggling as soon as the algorithm stops optimizing expressions and starts saving GIFs.

This algorithm will generate a lot of pictures, and you may have to be digging a little bit to find a GIF that you find pleasing. Because that's what this bot is good at : generating a lot of random pictures, hoping you will find one that suits your imaginative needs.

# output
The algorithm outputs its GIFs inside the /gif/ folder (relative to this project location). Each time you start the bot, it creates a folder named batchXXXX (where XXXX is a UNIX timestamp) and starts dumping the GIFs inside it.

Each GIF has at its side a .txt file containing the reverse polish notation used
internally to generate the GIF. The generated GIF is entierely decribed by the associated expression tree.

# customize

You can easily change the tastes of the algorithm by editing the genetic algorithm
inside **generate.js**, or even implement a whole new type of selection !
Changing the parameters of the genetic algorithm will drastically modify the results :

```js
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
```
Another way to create whole new types of GIFs is to add new operators, or remove existing ones !
To add an operator, just add at the top of generate.js :
```js
expr.operators['myoperator'] = { n:number_arguments, js:'myFunction({0})' }
```

# big thanks

Big thanks to Objelisks for [Objelisks/picobot](https://github.com/Objelisks/picobot).
This whole project was born when I saw his [@pico8bot](https://twitter.com/pico8bot) on Twitter.
Some bits of code come from [this](https://github.com/Objelisks/picobot) repository (mainly in gifpainter.js).
