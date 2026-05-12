import assert from "node:assert/strict";
import { SeededRandom, TownGame } from "../dist/core/TownGame.js";

class QueueRandom {
  constructor(values) {
    this.values = values;
  }

  next() {
    return this.values.shift() ?? 0;
  }
}

function labels(game) {
  return game.snapshot().board.map((row) => row.map((piece) => TownGame.pieceLabel(piece)));
}

{
  const game = new TownGame();
  const snapshot = game.snapshot();

  assert.equal(snapshot.rows, 6);
  assert.equal(snapshot.cols, 6);
}

{
  const game = new TownGame({
    random: new QueueRandom([0, 0.7999, 0.8, 0.9499, 0.95, 0.9899, 0.99, 0.9999])
  });

  assert.equal(TownGame.pieceLabel(game.snapshot().currentPiece), "草地");
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "草地");

  game.place(0, 0);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "花丛");

  game.place(0, 1);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "花丛");

  game.place(0, 2);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "小树");

  game.place(1, 0);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "小树");

  game.place(1, 1);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "木屋");
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(12) });
  game.forceCurrentPiece(1);
  const result = game.place(1, 1);

  assert.equal(result.ok, true);
  assert.equal(result.merges.length, 0);
  assert.equal(labels(game)[1][1], "草地");
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(1) });
  game.setPiece(1, 0, 1);
  game.setPiece(1, 1, 1);
  game.forceCurrentPiece(1);

  const result = game.place(1, 2);
  const snapshot = game.snapshot();

  assert.equal(result.ok, true);
  assert.equal(result.merges.length, 1);
  assert.equal(result.merges[0].nextLevel, 2);
  assert.equal(snapshot.board[1][2]?.level, 2);
  assert.equal(snapshot.board[1][0], null);
  assert.equal(snapshot.board[1][1], null);
  assert.equal(snapshot.score, 30);
}

{
  const game = new TownGame({ rows: 4, cols: 4, random: new SeededRandom(1) });
  game.setPiece(1, 0, 1);
  game.setPiece(1, 1, 1);
  game.setPiece(0, 2, 2);
  game.setPiece(1, 3, 2);
  game.forceCurrentPiece(1);

  const result = game.place(1, 2);
  const snapshot = game.snapshot();

  assert.equal(result.ok, true);
  assert.equal(result.merges.length, 2);
  assert.equal(result.merges[0].nextLevel, 2);
  assert.equal(result.merges[1].nextLevel, 3);
  assert.equal(snapshot.board[1][2]?.level, 3);
  assert.equal(snapshot.score, 150);
}

{
  const game = new TownGame({ rows: 3, cols: 4, random: new SeededRandom(1) });
  game.setPiece(1, 0, 1);
  game.setPiece(1, 1, 1);
  game.setPiece(1, 2, 1);
  game.forceCurrentPiece(1);

  const result = game.place(1, 3);
  const snapshot = game.snapshot();

  assert.equal(result.ok, true);
  assert.equal(result.merges.length, 1);
  assert.equal(result.merges[0].nextLevel, 2);
  assert.equal(result.merges[0].nextAdvanced, true);
  assert.equal(result.merges[0].score, 40);
  assert.equal(snapshot.board[1][3]?.level, 2);
  assert.equal(snapshot.board[1][3]?.advanced, true);
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(1) });
  game.setPiece(1, 0, 2, true);
  game.setPiece(1, 1, 2);
  game.forceCurrentPiece(2);

  const result = game.place(1, 2);
  const snapshot = game.snapshot();

  assert.equal(result.ok, true);
  assert.equal(result.merges[0].scoreMultiplier, 2);
  assert.equal(result.merges[0].score, 120);
  assert.equal(snapshot.board[1][2]?.level, 3);
  assert.equal(snapshot.board[1][2]?.advanced, undefined);
  assert.equal(snapshot.score, 120);
}

{
  const game = new TownGame({ rows: 2, cols: 2, random: new SeededRandom(1) });
  game.forceCurrentPiece(1);
  assert.equal(game.place(0, 0).ok, true);
  assert.equal(game.place(0, 0).ok, false);
  assert.equal(game.place(0, 0).reason, "occupied");
  assert.equal(game.place(9, 0).reason, "out-of-bounds");
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(1) });
  assert.equal(game.canUndo(), false);
  game.forceCurrentPiece(1);
  game.place(0, 0);
  assert.equal(game.canUndo(), true);
  assert.equal(game.snapshot().turn, 1);

  const undone = game.undo();
  assert.notEqual(undone, null);
  assert.equal(game.snapshot().board[0][0], null);
  assert.equal(game.snapshot().turn, 0);
  assert.equal(game.canUndo(), false);
  assert.equal(game.undo(), null);
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(1) });
  game.setPiece(1, 0, 1);
  game.setPiece(1, 1, 1);
  game.forceCurrentPiece(1);
  game.place(1, 2);
  assert.equal(game.snapshot().board[1][2]?.level, 2);

  game.undo();
  const snapshot = game.snapshot();
  assert.equal(snapshot.board[1][0]?.level, 1);
  assert.equal(snapshot.board[1][1]?.level, 1);
  assert.equal(snapshot.board[1][2], null);
  assert.equal(snapshot.score, 0);
}

{
  const game = new TownGame({ rows: 3, cols: 3, bearMode: true, bearSpawnInterval: 3, random: new QueueRandom([0, 0, 0, 0]) });
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "草地");
  game.place(0, 0);
  assert.equal(TownGame.pieceLabel(game.snapshot().nextPiece), "小熊");
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new QueueRandom([0, 0, 0, 0]) });
  game.forceCurrentBear();
  const result = game.place(1, 1);
  const snapshot = game.snapshot();
  const bearCount = snapshot.board.flat().filter((piece) => piece?.kind === "bear").length;

  assert.equal(result.ok, true);
  assert.equal(result.bearMoves.length, 1);
  assert.equal(result.bearMoves[0].blocked, false);
  assert.equal(snapshot.board[1][1], null);
  assert.equal(bearCount, 1);
}

{
  const game = new TownGame({ rows: 3, cols: 3, random: new SeededRandom(1) });
  game.setPiece(0, 1, 1);
  game.setPiece(1, 0, 1);
  game.setPiece(1, 2, 1);
  game.setPiece(2, 1, 1);
  game.forceCurrentBear();
  const result = game.place(1, 1);
  const snapshot = game.snapshot();

  assert.equal(result.ok, true);
  assert.equal(result.bearMoves[0].blocked, true);
  assert.equal(snapshot.board[1][1]?.kind, "tombstone");
}

{
  const game = new TownGame({ rows: 4, cols: 4, random: new SeededRandom(1) });
  game.setSpecial(1, 0, "tombstone");
  game.setSpecial(1, 1, "tombstone");
  game.setSpecial(1, 2, "tombstone");
  game.forceCurrentPiece(1);
  game.place(3, 3);
  const snapshot = game.snapshot();

  assert.equal(snapshot.board[1][0]?.kind, "moneyBag");
  assert.equal(snapshot.board[1][1], null);
  assert.equal(snapshot.board[1][2], null);

  const collect = game.collectMoneyBag(1, 0);
  assert.equal(collect.ok, true);
  assert.equal(collect.coinGained, 500);
  assert.equal(game.snapshot().board[1][0], null);
}

console.log("TownGame core tests passed");
