/** @jsx React.DOM */
var BoardView = React.createClass({displayName: 'BoardView',
  getInitialState: function () {
    return {board: new Board};
  },
  restartGame: function () {
    this.setState(this.getInitialStateWithSize(this.state.board.getSize()));
  },
  getInitialStateWithSize: function (size) {
    return {board: new Board(size)};
  },
  restartGameWithNewSize: function(size){    
    this.setState(this.getInitialStateWithSize(size));
  },
  handleKeyDown: function (event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault();
      var direction = event.keyCode - 37;
      this.setState({board: this.state.board.move(direction)});
    }
  },
  handleTouchStart: function (event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.touches.length != 1) {
      return;
    }
    this.startX = event.touches[0].screenX;
    this.startY = event.touches[0].screenY;
    event.preventDefault();
  },
  handleTouchEnd: function (event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.changedTouches.length != 1) {
      return;
    }
    var deltaX = event.changedTouches[0].screenX - this.startX;
    var deltaY = event.changedTouches[0].screenY - this.startY;
    var direction = -1;
    if (Math.abs(deltaX) > 3 * Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      direction = deltaX > 0 ? 2 : 0;
    } else if (Math.abs(deltaY) > 3 * Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      direction = deltaY > 0 ? 3 : 1;
    }
    if (direction != -1) {
      this.setState({board: this.state.board.move(direction)});
    }
  },
  componentDidMount: function () {
    window.addEventListener('keydown', this.handleKeyDown);  
  },
  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.handleKeyDown);
  },  
  render: function () {
    var cells = this.state.board.cells.map(function (row) {
      return React.DOM.div(null, row.map(function () {return Cell(null); }));
    });
    var boardClassArray = ['board'];
    boardClassArray.push('board'+this.state.board.getSize());
    var tiles = this.state.board.tiles.filter(function (tile) {
      return tile.value != 0;
    }).map(function (tile) {
      return TileView({tile: tile});
    });
    var boardClasses = React.addons.classSet.apply(null, boardClassArray);
    return (
      React.DOM.div({className: boardClasses, onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd, tabIndex: "1"}, 
        cells, 
        tiles, 
        GameEndOverlay({board: this.state.board, onRestart: this.restartGame}), 
        Score({board: this.state.board, onRestart: this.restartGame, onRestartWithNewSize: this.restartGameWithNewSize})
      )

    );
  }
});

var Cell = React.createClass({displayName: 'Cell',
  shouldComponentUpdate: function () {
    return false;
  },
  render: function () {
    return (
      React.DOM.span({className: "cell"}, '')
    );
  }
});

var TileView = React.createClass({displayName: 'TileView',
  shouldComponentUpdate: function (nextProps) {
    if (this.props.tile != nextProps.tile) {
      return true;
    }
    if (!nextProps.tile.hasMoved() && !nextProps.tile.isNew()) {
      return false;
    }
    return true;
  },
  render: function () {
    var tile = this.props.tile;
    var classArray = ['tile'];
    classArray.push('tile' + this.props.tile.value);
    if (!tile.mergedInto) {
      classArray.push('position_' + tile.row + '_' + tile.column);
    }
    if (tile.mergedInto) {
      classArray.push('merged');
    }
    if (tile.isNew()) {
      classArray.push('new');
    }
    if (tile.hasMoved()) {
      classArray.push('row_from_' + tile.fromRow() + '_to_' + tile.toRow());
      classArray.push('column_from_' + tile.fromColumn() + '_to_' + tile.toColumn());
      classArray.push('isMoving');
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.span({className: classes, key: tile.id}, tile.value)
    );
  }
});

var GameEndOverlay = React.createClass({displayName: 'GameEndOverlay',
  render: function () {
    var board = this.props.board;
    var contents = '';
    var gameRestartType = 'New Game'
    if (board.hasWon()) {
      contents = 'Good Job!';
      gameRestartType = 'Try again'
    } else if (board.hasLost()) {
      contents = 'Game Over';
      gameRestartType = 'Try again'
    }
    if (!contents) {
      return null;
    }
    return (
      React.DOM.div({className: "overlay"}, 
        React.DOM.p({className: "message"}, contents), 
        React.DOM.button({className: "tryAgain", onClick: this.props.onRestart, onTouchEnd: this.props.onRestart}, "Try again")
      )
    )
  }
});

var Score = React.createClass({displayName: 'Score',
  getInitialState: function() {
    return {size: 4};
  },
  handleChange: function(newValue) {
    newValue= newValue > 8 ? 8 : (newValue<3) ? 3 : newValue;
    this.setState({size: newValue});
    this.props.board.setSize(newValue);
    this.props.onRestartWithNewSize(newValue);
  },
  render: function () {
    var board = this.props.board;
    var contents = "Score: " + board.getScore();
    var scoreClassArray = ['score'];
    scoreClassArray.push('score'+this.props.board.getSize());
    var scoreClasses = React.addons.classSet.apply(null, scoreClassArray);  
    var valuelink = {
      value: this.state.size,
      requestChange: this.handleChange
    };  
    return (
      React.DOM.div({className: scoreClasses}, 
        React.DOM.p({className: "message"}, contents), 
        React.DOM.button({className: "tryAgain", onClick: this.props.onRestart, onTouchEnd: this.props.onRestart}, "New Game"), 
        React.DOM.select({valueLink: valuelink, className: "matrix"}, 
          React.DOM.option({value: "3"}, "3x3"), 
          React.DOM.option({value: "4"}, "4x4"), 
          React.DOM.option({value: "5"}, "5x5"), 
          React.DOM.option({value: "6"}, "6x6"), 
          React.DOM.option({value: "7"}, "7x7"), 
          React.DOM.option({value: "8"}, "8x8")
        )
      )
    )
  }
});


React.initializeTouchEvents(true);
//React.renderComponent(<BoardView />, document.getElementById('boardDiv'));
React.render(
    React.createElement(BoardView,null), document.getElementById('boardDiv')
);

