2048-react
==========

This is a clone of [2048](http://gabrielecirulli.github.io/2048/) implemented using React. It's running live [here](http://tk120404.github.io/2048-react/).


## Building and running

To run, simply start a web server serving the main project directory. For example, using ```node-static```, you can do

    npm install -g node-static
    static -p 8000
    
and the game will be accessible on ```localhost:8000```.

If you change a file which needs to be rebuilt (that is, any file inside the ```src``` dir), you need to run ```gulp```.

    npm install -g gulp
    npm install
    gulp build   # to rebuild the files once, or
    gulp   # to watch the files for changes and rebuild continously.
