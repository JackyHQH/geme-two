export type SpecialKind = "bear" | "tombstone" | "moneyBag";
export type Cell = Piece | null;

export interface Piece {
  level?: number;
  advanced?: boolean;
  kind?: SpecialKind;
}

export interface Coord {
  row: number;
  col: number;
}

export interface MergeEvent {
  level: number;
  nextLevel: number;
  nextAdvanced: boolean;
  cells: Coord[];
  anchor: Coord;
  chain: number;
  score: number;
  scoreMultiplier: number;
}

export interface PlaceResult {
  ok: boolean;
  reason?: "out-of-bounds" | "occupied" | "game-over" | "no-empty-cell";
  placed?: Coord;
  merges: MergeEvent[];
  bearMoves: BearMoveEvent[];
  scoreGained: number;
  gameOver: boolean;
}

export interface BearMoveEvent {
  from: Coord;
  to?: Coord;
  blocked: boolean;
}

export interface CollectResult {
  ok: boolean;
  reason?: "out-of-bounds" | "not-money-bag";
  coinGained: number;
}

export interface GameSnapshot {
  rows: number;
  cols: number;
  board: Cell[][];
  score: number;
  turn: number;
  currentPiece: Piece;
  nextPiece: Piece;
  gameOver: boolean;
}

interface GameState {
  board: Cell[][];
  score: number;
  turn: number;
  currentPiece: Piece;
  nextPiece: Piece;
  ended: boolean;
}

export interface RandomSource {
  next(): number;
}

export interface TownGameOptions {
  rows?: number;
  cols?: number;
  maxPieceLevel?: number;
  random?: RandomSource;
  bearMode?: boolean;
  bearSpawnInterval?: number;
}

export const PIECE_NAMES = [
  "",
  "草地",
  "花丛",
  "小树",
  "木屋",
  "小院",
  "小镇",
  "城堡"
] as const;

const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 6;
const DEFAULT_MAX_PIECE_LEVEL = PIECE_NAMES.length - 1;
const MERGE_SIZE = 3;
const SPAWN_TABLE = [
  { level: 1, weight: 80 },
  { level: 2, weight: 15 },
  { level: 3, weight: 4 },
  { level: 4, weight: 1 }
] as const;

export class SeededRandom implements RandomSource {
  private seed: number;

  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }
}

export class TownGame {
  readonly rows: number;
  readonly cols: number;
  readonly maxPieceLevel: number;

  private readonly random: RandomSource;
  private readonly bearMode: boolean;
  private readonly bearSpawnInterval: number;
  private board: Cell[][];
  private score = 0;
  private turn = 0;
  private currentPiece: Piece;
  private nextPiece: Piece;
  private ended = false;
  private previousState: GameState | null = null;

  constructor(options: TownGameOptions = {}) {
    this.rows = options.rows ?? DEFAULT_ROWS;
    this.cols = options.cols ?? DEFAULT_COLS;
    this.maxPieceLevel = options.maxPieceLevel ?? DEFAULT_MAX_PIECE_LEVEL;
    this.random = options.random ?? { next: () => Math.random() };
    this.bearMode = options.bearMode ?? false;
    this.bearSpawnInterval = options.bearSpawnInterval ?? 20;
    this.board = this.createEmptyBoard();
    this.currentPiece = this.createRandomPiece();
    this.nextPiece = this.createRandomPiece();
  }

  static pieceLabel(piece: Cell): string {
    if (!piece) {
      return "";
    }

    if (piece.kind === "bear") {
      return "小熊";
    }
    if (piece.kind === "tombstone") {
      return "墓碑";
    }
    if (piece.kind === "moneyBag") {
      return "钱袋";
    }

    const name = PIECE_NAMES[piece.level ?? 0] ?? `Lv${piece.level}`;
    return piece.advanced ? `高级${name}` : name;
  }

  snapshot(): GameSnapshot {
    return {
      rows: this.rows,
      cols: this.cols,
      board: this.cloneBoard(),
      score: this.score,
      turn: this.turn,
      currentPiece: { ...this.currentPiece },
      nextPiece: { ...this.nextPiece },
      gameOver: this.ended
    };
  }

  reset(): GameSnapshot {
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.turn = 0;
    this.ended = false;
    this.previousState = null;
    this.currentPiece = this.createRandomPiece();
    this.nextPiece = this.createRandomPiece();
    return this.snapshot();
  }

  canUndo(): boolean {
    return this.previousState !== null;
  }

  undo(): GameSnapshot | null {
    if (!this.previousState) {
      return null;
    }

    const state = this.previousState;
    this.board = this.cloneBoardFrom(state.board);
    this.score = state.score;
    this.turn = state.turn;
    this.currentPiece = { ...state.currentPiece };
    this.nextPiece = { ...state.nextPiece };
    this.ended = state.ended;
    this.previousState = null;
    return this.snapshot();
  }

  place(row: number, col: number): PlaceResult {
    if (this.ended) {
      return this.failedPlace("game-over");
    }

    if (this.isBoardFull()) {
      this.ended = true;
      return this.failedPlace("no-empty-cell");
    }

    if (!this.inBounds(row, col)) {
      return this.failedPlace("out-of-bounds");
    }

    if (this.board[row][col]) {
      return this.failedPlace("occupied");
    }

    this.previousState = this.captureState();
    this.board[row][col] = { ...this.currentPiece };
    const merges = this.currentPiece.kind ? [] : this.resolveMerges({ row, col });
    const bearMoves = this.moveBears();
    merges.push(...this.resolveTombstoneMerges());
    const scoreGained = merges.reduce((sum, event) => sum + event.score, 0);
    this.score += scoreGained;
    this.turn += 1;
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createRandomPiece();
    this.ended = this.isBoardFull();

    return {
      ok: true,
      placed: { row, col },
      merges,
      bearMoves,
      scoreGained,
      gameOver: this.ended
    };
  }

  collectMoneyBag(row: number, col: number): CollectResult {
    if (!this.inBounds(row, col)) {
      return { ok: false, reason: "out-of-bounds", coinGained: 0 };
    }

    if (this.board[row][col]?.kind !== "moneyBag") {
      return { ok: false, reason: "not-money-bag", coinGained: 0 };
    }

    this.previousState = this.captureState();
    this.board[row][col] = null;
    this.ended = false;
    return { ok: true, coinGained: 500 };
  }

  setPiece(row: number, col: number, level: number, advanced = false): void {
    if (!this.inBounds(row, col)) {
      throw new Error(`Cell is out of bounds: ${row},${col}`);
    }

    this.board[row][col] = level > 0 ? this.createPiece(level, advanced) : null;
    this.ended = this.isBoardFull();
    this.previousState = null;
  }

  forceCurrentPiece(level: number, advanced = false): void {
    this.currentPiece = this.createPiece(level, advanced);
    this.previousState = null;
  }

  forceCurrentBear(): void {
    this.currentPiece = this.createSpecialPiece("bear");
    this.previousState = null;
  }

  setSpecial(row: number, col: number, kind: SpecialKind): void {
    if (!this.inBounds(row, col)) {
      throw new Error(`Cell is out of bounds: ${row},${col}`);
    }

    this.board[row][col] = this.createSpecialPiece(kind);
    this.ended = this.isBoardFull();
    this.previousState = null;
  }

  private failedPlace(reason: PlaceResult["reason"]): PlaceResult {
    return {
      ok: false,
      reason,
      merges: [],
      bearMoves: [],
      scoreGained: 0,
      gameOver: this.ended
    };
  }

  private resolveMerges(start: Coord): MergeEvent[] {
    const events: MergeEvent[] = [];
    let anchor = start;
    let chain = 0;

    while (true) {
      const piece = this.board[anchor.row][anchor.col];
      if (!piece || piece.kind || !piece.level) {
        break;
      }

      const group = this.findConnected(anchor, piece.level);
      if (group.length < MERGE_SIZE || piece.level >= this.maxPieceLevel) {
        break;
      }

      chain += 1;
      const nextLevel = piece.level + 1;
      const scoreMultiplier = this.scoreMultiplierFor(group);
      const score = this.scoreForMerge(piece.level, group.length, chain) * scoreMultiplier;
      const mergeAnchor = this.pickAnchor(group, anchor);
      const nextAdvanced = group.length > MERGE_SIZE;

      for (const cell of group) {
        this.board[cell.row][cell.col] = null;
      }
      this.board[mergeAnchor.row][mergeAnchor.col] = this.createPiece(nextLevel, nextAdvanced);

      events.push({
        level: piece.level,
        nextLevel,
        nextAdvanced,
        cells: group,
        anchor: mergeAnchor,
        chain,
        score,
        scoreMultiplier
      });

      anchor = mergeAnchor;
    }

    return events;
  }

  private findConnected(start: Coord, level: number): Coord[] {
    const visited = new Set<string>();
    const result: Coord[] = [];
    const queue: Coord[] = [start];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = this.cellKey(current);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const piece = this.board[current.row][current.col];
      if (!piece || piece.kind || piece.level !== level) {
        continue;
      }

      result.push(current);
      for (const next of this.neighbors(current)) {
        if (!visited.has(this.cellKey(next))) {
          queue.push(next);
        }
      }
    }

    return result;
  }

  private neighbors(cell: Coord): Coord[] {
    const candidates = [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 }
    ];

    return candidates.filter((candidate) => this.inBounds(candidate.row, candidate.col));
  }

  private pickAnchor(group: Coord[], preferred: Coord): Coord {
    return group.some((cell) => cell.row === preferred.row && cell.col === preferred.col)
      ? preferred
      : group[0];
  }

  private scoreForMerge(level: number, size: number, chain: number): number {
    return level * size * 10 * chain;
  }

  private scoreMultiplierFor(group: Coord[]): number {
    return group.some((cell) => this.board[cell.row][cell.col]?.advanced) ? 2 : 1;
  }

  private createRandomPiece(): Piece {
    if (this.shouldCreateBear()) {
      return this.createSpecialPiece("bear");
    }

    const roll = this.random.next() * 100;
    let cursor = 0;

    for (const entry of SPAWN_TABLE) {
      cursor += entry.weight;
      if (roll < cursor) {
        return this.createPiece(entry.level);
      }
    }

    const level = SPAWN_TABLE[SPAWN_TABLE.length - 1].level;
    return this.createPiece(level);
  }

  private createPiece(level: number, advanced = false): Piece {
    return advanced ? { level, advanced: true } : { level };
  }

  private createSpecialPiece(kind: SpecialKind): Piece {
    return { kind };
  }

  private shouldCreateBear(): boolean {
    if (!this.bearMode || this.bearSpawnInterval <= 0) {
      return false;
    }

    const upcomingMoveNumber = this.turn + 2;
    return upcomingMoveNumber > 0 && upcomingMoveNumber % this.bearSpawnInterval === 0;
  }

  private moveBears(): BearMoveEvent[] {
    const events: BearMoveEvent[] = [];
    const bears: Coord[] = [];
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (this.board[row][col]?.kind === "bear") {
          bears.push({ row, col });
        }
      }
    }

    for (const bear of bears) {
      if (this.board[bear.row][bear.col]?.kind !== "bear") {
        continue;
      }

      const emptyNeighbors = this.neighbors(bear).filter((cell) => !this.board[cell.row][cell.col]);
      if (emptyNeighbors.length === 0) {
        this.board[bear.row][bear.col] = this.createSpecialPiece("tombstone");
        events.push({ from: bear, blocked: true });
        continue;
      }

      const target = emptyNeighbors[Math.floor(this.random.next() * emptyNeighbors.length)];
      this.board[bear.row][bear.col] = null;
      this.board[target.row][target.col] = this.createSpecialPiece("bear");
      events.push({ from: bear, to: target, blocked: false });
    }

    return events;
  }

  private resolveTombstoneMerges(): MergeEvent[] {
    const events: MergeEvent[] = [];
    const visited = new Set<string>();

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const start = { row, col };
        const key = this.cellKey(start);
        if (visited.has(key) || this.board[row][col]?.kind !== "tombstone") {
          continue;
        }

        const group = this.findConnectedSpecial(start, "tombstone", visited);
        if (group.length < MERGE_SIZE) {
          continue;
        }

        const anchor = group[0];
        for (const cell of group) {
          this.board[cell.row][cell.col] = null;
        }
        this.board[anchor.row][anchor.col] = this.createSpecialPiece("moneyBag");
        events.push({
          level: 0,
          nextLevel: 0,
          nextAdvanced: false,
          cells: group,
          anchor,
          chain: 1,
          score: 0,
          scoreMultiplier: 1
        });
      }
    }

    return events;
  }

  private findConnectedSpecial(start: Coord, kind: SpecialKind, visited: Set<string>): Coord[] {
    const result: Coord[] = [];
    const queue: Coord[] = [start];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = this.cellKey(current);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const piece = this.board[current.row][current.col];
      if (piece?.kind !== kind) {
        continue;
      }

      result.push(current);
      for (const next of this.neighbors(current)) {
        if (!visited.has(this.cellKey(next))) {
          queue.push(next);
        }
      }
    }

    return result;
  }

  private createEmptyBoard(): Cell[][] {
    return Array.from({ length: this.rows }, () => Array<Cell>(this.cols).fill(null));
  }

  private cloneBoard(): Cell[][] {
    return this.cloneBoardFrom(this.board);
  }

  private cloneBoardFrom(board: Cell[][]): Cell[][] {
    return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
  }

  private captureState(): GameState {
    return {
      board: this.cloneBoard(),
      score: this.score,
      turn: this.turn,
      currentPiece: { ...this.currentPiece },
      nextPiece: { ...this.nextPiece },
      ended: this.ended
    };
  }

  private isBoardFull(): boolean {
    return this.board.every((row) => row.every(Boolean));
  }

  private inBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  private cellKey(cell: Coord): string {
    return `${cell.row}:${cell.col}`;
  }
}
