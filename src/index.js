import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.isWinningSquare ? 'winning-square' : null}`}
            onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, winning_squares) {
    let is_winning_square = false;
    if (winning_squares.includes(i)) {
        is_winning_square = true;
    }
    return (
      <Square
        key={i}
        isWinningSquare={is_winning_square}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(min, max, winning_squares) {
    let squares = []
    for (let i = min; i <= max; i++) {
      squares = squares.concat(this.renderSquare(i, winning_squares));
    }
    return (
      <div className="board-row">
        {squares}
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderRow(0, 2, this.props.winning_squares)}
        {this.renderRow(3, 5, this.props.winning_squares)}
        {this.renderRow(6, 8, this.props.winning_squares)}
      </div>
    );
  }
}

class OrderToggle extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onOrderChange(e.target.value);
  }

  render() {
    return (
      <div>
        <p>Move order:
        <input type="radio"
               id="descending"
               name="order"
               value="descending"
               onChange={this.handleChange}
               checked={this.props.descending}
        />
        <label htmlFor="descending">Descending</label>
        <input type="radio"
               id="ascending"
               name="order"
               value="ascending"
               onChange={this.handleChange}
               checked={!this.props.descending}
        />
        <label htmlFor="ascending">Ascending</label>
        </p>
      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      descending: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winning_info = calculateWinner(squares);

    if (winning_info.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        clickedIndex: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  handleOrderChange(order) {
    const descending = (order === 'descending');
    this.setState({descending: descending})
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winning_info = calculateWinner(current.squares);
    const winner = winning_info.winner;

    let moves = history.map((step, move) => {

      const desc = move ?
        generateMoveText(move, step.clickedIndex) :
        'Go to game start';

      return (
        <li key={move}>
          <button className={move === this.state.stepNumber ? 'current-step' : null} onClick={() =>
          this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.descending) {
      moves = moves.reverse();
    }

    let status;
    let winning_squares;
    if (winner) {
      status = 'Winner: ' + winner;
      winning_squares = winning_info.winning_squares;
    } else {
      status = 'Next player: ' +
(this.state.xIsNext ? 'X' : 'O');
      winning_squares = [];
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winning_squares={winning_squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <OrderToggle descending={this.state.descending}
                       onOrderChange={(order) => this.handleOrderChange(order)}
          />
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winning_squares: [a, b, c] }
    }
  }
  return { winner: null, winning_squares: [] };
}

// Returns {row, column} of index given a square width x width grid
// and walking through the grid left-to-right, top-to-bottom
// Uses more-human-friendly, 1-indexed values
function locationOfIndex(index, width) {
  let row = parseInt(index / width) + 1;
  let column = (index % width) + 1;
  return {row: row, column: column};
}

function generateMoveText(move, clickedIndex) {
  const location = move ? locationOfIndex(clickedIndex, 3) : false;
  const row = location.row;
  const column = location.column;
  return `Go to move #${move} (row: ${row}, column: ${column})`
}
