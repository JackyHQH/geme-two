import { _decorator, AudioClip, AudioSource, Button, Color, Component, EventMouse, EventTouch, Graphics, Label, Node, resources, Sprite, SpriteFrame, sys, tween, UITransform, Vec3 } from "cc";
import { SeededRandom, TownGame } from "../core/TownGame";
import type { BearMoveEvent, Cell } from "../core/TownGame";
import { drawBoardFrame, drawInsetPanel, drawPieceIcon, drawRibbon, drawRoundedBox, drawWoodSign, pieceVisual, UI } from "./theme/UiTheme";

const { ccclass, property } = _decorator;

interface CellView {
  node: Node;
  label: Label;
  background: Graphics;
  icon: Graphics;
  backgroundSprite: Sprite;
  iconSprite: Sprite;
}

const PIECE_ASSET_NAMES = ["", "grass", "flower", "tree", "house", "courtyard", "town", "castle"] as const;

@ccclass("GameController")
export class GameController extends Component {
  @property
  rows = 6;

  @property
  cols = 6;

  @property
  cellSize = UI.board.cellSize;

  @property
  cellGap = UI.board.cellGap;

  @property(Label)
  statusLabel: Label | null = null;

  private game!: TownGame;
  private cells: CellView[][] = [];
  private scoreLabel: Label | null = null;
  private bestLabel: Label | null = null;
  private turnLabel: Label | null = null;
  private coinLabel: Label | null = null;
  private currentLabel: Label | null = null;
  private nextLabel: Label | null = null;
  private currentIcon: Graphics | null = null;
  private nextIcon: Graphics | null = null;
  private currentIconSprite: Sprite | null = null;
  private nextIconSprite: Sprite | null = null;
  private soundIconLabel: Label | null = null;
  private internalStatusLabel: Label | null = null;
  private audioSource: AudioSource | null = null;
  private audioClips = new Map<string, AudioClip>();
  private spriteFrames = new Map<string, SpriteFrame>();
  private bestScore = 0;
  private coins = 2456;
  private soundEnabled = true;
  private selectedBoardSize = 6;
  private bearModeEnabled = false;
  private readonly boardCenterY = -30;

  start(): void {
    this.soundEnabled = sys.localStorage.getItem("childhood-town-sound") !== "muted";
    this.selectedBoardSize = Number(sys.localStorage.getItem("childhood-town-board-size") ?? "6");
    if (this.selectedBoardSize !== 6 && this.selectedBoardSize !== 7 && this.selectedBoardSize !== 8) {
      this.selectedBoardSize = 6;
    }
    this.bearModeEnabled = sys.localStorage.getItem("childhood-town-bear-mode") === "on";
    this.createAudio();
    this.showStartMenu();
  }

  private showStartMenu(): void {
    this.node.removeAllChildren();
    this.cells = [];
    this.clearUiRefs();
    this.createStartMenuBackground();
    this.createStartMenuLabels();
  }

  private beginGame(): void {
    this.rows = this.selectedBoardSize;
    this.cols = this.selectedBoardSize;
    this.configureBoardMetrics();
    this.node.removeAllChildren();
    this.cells = [];
    this.clearUiRefs();
    this.bestScore = Number(sys.localStorage.getItem("childhood-town-best") ?? "0");
    this.coins = Number(sys.localStorage.getItem("childhood-town-coins") ?? "2456");
    this.game = new TownGame({
      rows: this.rows,
      cols: this.cols,
      random: new SeededRandom(Date.now()),
      bearMode: this.bearModeEnabled
    });

    this.createBackground();
    this.createTopHud();
    this.createBoard();
    this.createBottomTray();
    this.refresh();
  }

  restart(): void {
    this.playSound("click");
    this.game.reset();
    this.setStatus("新一局开始");
    this.refresh();
  }

  private configureBoardMetrics(): void {
    const maxBoardWidth = 650;
    this.cellGap = UI.board.cellGap;
    this.cellSize = Math.min(UI.board.cellSize, Math.floor((maxBoardWidth - (this.cols - 1) * this.cellGap) / this.cols));
  }

  private clearUiRefs(): void {
    this.scoreLabel = null;
    this.bestLabel = null;
    this.turnLabel = null;
    this.coinLabel = null;
    this.currentLabel = null;
    this.nextLabel = null;
    this.currentIcon = null;
    this.nextIcon = null;
    this.currentIconSprite = null;
    this.nextIconSprite = null;
    this.soundIconLabel = null;
    this.internalStatusLabel = null;
  }

  private createStartMenuBackground(): void {
    const background = this.createNode("StartMenuBackground", this.node, 0, 0);
    background.addComponent(UITransform).setContentSize(UI.screen.width, UI.screen.height);
    const sprite = background.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    resources.load("ui/menu/start-menu-v1/spriteFrame", SpriteFrame, (error, frame) => {
      if (error || !frame) {
        console.warn("Failed to load start menu image", error);
        drawRoundedBox(background.addComponent(Graphics), UI.screen.width, UI.screen.height, UI.colors.parchment, UI.colors.parchment, 0, 0);
        return;
      }
      sprite.spriteFrame = frame;
    });
  }

  private createStartMenuLabels(): void {
    const title = this.createLabel("MenuTitle", "童年小镇", 0, 396, 60, UI.colors.white, 360, 76, this.node);
    title.enableOutline = true;
    title.outlineColor = UI.colors.ink;
    title.outlineWidth = 5;

    this.createModeOption(6, 0, 126);
    this.createModeOption(7, 0, -28);
    this.createModeOption(8, 0, -182);
    this.createBearModeOption(0, -338);
    this.createStartButton(0, -506);
  }

  private createModeOption(size: number, x: number, y: number): void {
    const selected = this.selectedBoardSize === size;
    this.createMenuHitZone(`Mode${size}`, x, y, 520, 104, () => {
      this.selectedBoardSize = size;
      sys.localStorage.setItem("childhood-town-board-size", String(size));
      this.playSound("select");
      this.showStartMenu();
    });
    const label = this.createLabel(`Mode${size}Label`, `${size} x ${size} 棋盘`, x + 54, y + 7, 34, selected ? UI.colors.buttonGold : UI.colors.ink, 360, 48, this.node);
    label.enableOutline = selected;
    label.outlineColor = UI.colors.ink;
    label.outlineWidth = selected ? 2 : 0;
  }

  private createBearModeOption(x: number, y: number): void {
    this.createMenuHitZone("BearModeToggle", x, y, 430, 86, () => {
      this.bearModeEnabled = !this.bearModeEnabled;
      sys.localStorage.setItem("childhood-town-bear-mode", this.bearModeEnabled ? "on" : "off");
      this.playSound("select");
      this.showStartMenu();
    });
    this.createLabel("BearModeLabel", `小熊模式：${this.bearModeEnabled ? "开" : "关"}`, x - 4, y + 6, 30, UI.colors.ink, 330, 46, this.node);
  }

  private createStartButton(x: number, y: number): void {
    this.createMenuHitZone("StartButton", x, y, 500, 100, () => {
      this.playSound("click");
      this.beginGame();
    });
    const label = this.createLabel("StartButtonLabel", "开始游戏", x, y + 12, 44, UI.colors.white, 360, 58, this.node);
    label.enableOutline = true;
    label.outlineColor = UI.colors.ink;
    label.outlineWidth = 4;
  }

  private createMenuHitZone(name: string, x: number, y: number, width: number, height: number, onTap: () => void): Node {
    const zone = this.createNode(name, this.node, x, y);
    zone.addComponent(UITransform).setContentSize(width, height);
    const button = zone.addComponent(Button);
    button.transition = Button.Transition.SCALE;
    button.zoomScale = 0.98;
    button.duration = 0.06;
    zone.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onButtonNodeTap(onTap, event), this);
    zone.on(Node.EventType.MOUSE_UP, (event: EventMouse) => this.onButtonNodeTap(onTap, event), this);
    return zone;
  }

  private createBackground(): void {
    const background = this.createNode("ParchmentBackground", this.node, 0, 0);
    const transform = background.addComponent(UITransform);
    transform.setContentSize(UI.screen.width, UI.screen.height);
    drawRoundedBox(background.addComponent(Graphics), UI.screen.width, UI.screen.height, UI.colors.parchment, UI.colors.parchment, 0, 0);

    this.createMiniScene("WindmillScene", -282, 520);
    this.coinLabel = this.createCurrency("CoinCounter", "★", String(this.coins), 265, 518, UI.colors.buttonGold);
    this.createCurrency("StarCounter", "★", "128", 265, 452, UI.colors.buttonGreen);
  }

  private createTopHud(): void {
    const sign = this.createNode("WoodTitleSign", this.node, 0, 520);
    sign.addComponent(UITransform).setContentSize(370, 112);
    drawWoodSign(sign.addComponent(Graphics), 370, 112);
    this.addSprite(sign, "ui/components/title-sign", 370, 112);
    const title = this.createLabel("Title", "童年小镇", 0, 4, 52, UI.colors.white, 330, 70, sign);
    title.enableOutline = true;
    title.outlineColor = UI.colors.ink;
    title.outlineWidth = 4;

    const scorePanel = this.createStatPanel("ScorePanel", -212, 392, "分数", UI.colors.ribbonGreen, "ui/components/stat-panel-green");
    this.scoreLabel = this.createLabel("ScoreValue", "0", 0, -18, 43, UI.colors.ink, 180, 54, scorePanel);

    const bestPanel = this.createStatPanel("BestPanel", 0, 392, "最高", UI.colors.ribbonGold, "ui/components/stat-panel-gold");
    this.createLabel("BestIcon", "🏆", -54, -14, 28, UI.colors.buttonGold, 44, 40, bestPanel);
    this.bestLabel = this.createLabel("BestValue", "0", 22, -18, 43, UI.colors.ink, 130, 54, bestPanel);

    const turnPanel = this.createStatPanel("TurnPanel", 212, 392, "当前回合", UI.colors.ribbonBlue, "ui/components/stat-panel-blue");
    this.turnLabel = this.createLabel("TurnValue", "0", 0, -18, 43, UI.colors.ink, 180, 54, turnPanel);
  }

  private createStatPanel(name: string, x: number, y: number, caption: string, ribbonColor: Color, assetPath: string): Node {
    const panel = this.createPanel(name, x, y, 190, 92, UI.colors.panelInner, UI.colors.panelStroke);
    this.addSprite(panel, assetPath, 190, 92);
    this.createRibbon(`${name}Ribbon`, caption, 0, 47, 116, 42, ribbonColor, panel);
    return panel;
  }

  private createBoard(): void {
    const boardWidth = this.cols * this.cellSize + (this.cols - 1) * this.cellGap;
    const boardHeight = this.rows * this.cellSize + (this.rows - 1) * this.cellGap;
    const boardPanel = this.createNode("BoardPanel", this.node, 0, this.boardCenterY);
    boardPanel.addComponent(UITransform).setContentSize(boardWidth + 42, boardHeight + 42);
    drawBoardFrame(boardPanel.addComponent(Graphics), boardWidth + 42, boardHeight + 42);
    this.addSprite(boardPanel, "ui/components/board-frame", boardWidth + 42, boardHeight + 42);

    for (let row = 0; row < this.rows; row += 1) {
      const viewRow: CellView[] = [];
      for (let col = 0; col < this.cols; col += 1) {
        const cellNode = this.createNode(
          `Cell_${row}_${col}`,
          boardPanel,
          col * (this.cellSize + this.cellGap) - boardWidth / 2 + this.cellSize / 2,
          boardHeight / 2 - row * (this.cellSize + this.cellGap) - this.cellSize / 2
        );
        cellNode.addComponent(UITransform).setContentSize(this.cellSize, this.cellSize);

        const background = cellNode.addComponent(Graphics);
        drawRoundedBox(background, this.cellSize, this.cellSize, UI.colors.cell, UI.colors.cellStroke, UI.board.radius, 3);
        const backgroundSprite = this.addSprite(cellNode, "ui/components/cell-empty", this.cellSize + 10, this.cellSize + 10);

        const iconNode = this.createNode("Icon", cellNode, 0, 6);
        iconNode.addComponent(UITransform).setContentSize(this.cellSize - 8, this.cellSize - 8);
        const icon = iconNode.addComponent(Graphics);
        const iconSprite = this.createSpriteChild(iconNode, this.cellSize - 8, this.cellSize - 8);

        const label = this.createLabel("PieceLabel", "", 0, -36, 16, UI.colors.ink, 94, 24, cellNode);
        const button = cellNode.addComponent(Button);
        button.transition = Button.Transition.SCALE;
        button.zoomScale = 0.95;
        button.duration = 0.05;
        cellNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onCellNodeTap(row, col, event), this);
        cellNode.on(Node.EventType.MOUSE_UP, (event: EventMouse) => this.onCellNodeTap(row, col, event), this);

        viewRow.push({ node: cellNode, label, background, icon, backgroundSprite, iconSprite });
      }
      this.cells.push(viewRow);
    }
  }

  private createBottomTray(): void {
    const tray = this.createPanel("BottomTray", 0, -525, 690, 188, UI.colors.panelInner, UI.colors.panelStroke);
    this.addSprite(tray, "ui/components/bottom-tray", 690, 188);
    this.createGrassTrim(this.node, 0, -654, 740, 58);

    const currentPanel = this.createPiecePreview("CurrentPiece", -230, 6, "当前", UI.colors.ribbonGreen, tray);
    this.currentIcon = currentPanel.icon;
    this.currentIconSprite = currentPanel.iconSprite;
    this.currentLabel = currentPanel.label;

    const nextPanel = this.createPiecePreview("NextPiece", -60, 6, "下一个", UI.colors.ribbonBlue, tray);
    this.nextIcon = nextPanel.icon;
    this.nextIconSprite = nextPanel.iconSprite;
    this.nextLabel = nextPanel.label;

    this.createButton("UndoButton", "↶", "撤销", 138, 45, UI.colors.buttonGold, () => {
      this.undoLastMove();
    });
    this.createButton("RestartButton", "↻", "重新", 270, 45, UI.colors.buttonRed, () => this.restart());
    this.createButton("PauseButton", "Ⅱ", "", 112, -46, UI.colors.buttonBlue, () => {
      this.playSound("click");
      this.setStatus("暂停稍后接入");
    });
    this.soundIconLabel = this.createButton("SoundButton", this.soundEnabled ? "♪" : "×", "", 212, -46, UI.colors.buttonGreen, () => {
      this.toggleSound();
    });
    this.createButton("SettingsButton", "⚙", "", 312, -46, UI.colors.buttonBrown, () => {
      this.playSound("click");
      this.setStatus("设置稍后接入");
    });

    this.createStatusLabel();
  }

  private createPiecePreview(name: string, x: number, y: number, caption: string, ribbonColor: Color, parent: Node): { icon: Graphics; iconSprite: Sprite; label: Label } {
    const panel = this.createPanel(name, x, y, 138, 150, UI.colors.cell, UI.colors.cellStroke, parent);
    this.addSprite(panel, "ui/components/cell-empty", 138, 150);
    this.createRibbon(`${name}Ribbon`, caption, 0, 75, 92, 38, ribbonColor, panel);
    const iconNode = this.createNode(`${name}Icon`, panel, 0, 12);
    iconNode.addComponent(UITransform).setContentSize(88, 88);
    const icon = iconNode.addComponent(Graphics);
    const iconSprite = this.createSpriteChild(iconNode, 88, 88);
    const label = this.createLabel(`${name}Label`, "", 0, -54, 17, UI.colors.ink, 120, 28, panel);
    return { icon, iconSprite, label };
  }

  private createButton(name: string, icon: string, caption: string, x: number, y: number, fill: Color, onTap: () => void): Label {
    const button = this.createPanel(name, x, -524 + y, 78, 70, fill, UI.colors.ink);
    const buttonAsset = this.buttonAssetPath(name);
    if (buttonAsset) {
      this.addSprite(button, buttonAsset, caption ? 86 : 74, caption ? 78 : 74);
    }
    const buttonComponent = button.addComponent(Button);
    buttonComponent.transition = Button.Transition.SCALE;
    buttonComponent.zoomScale = 0.94;
    buttonComponent.duration = 0.06;
    button.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onButtonNodeTap(onTap, event), this);
    button.on(Node.EventType.MOUSE_UP, (event: EventMouse) => this.onButtonNodeTap(onTap, event), this);

    const iconLabel = this.createLabel(`${name}Icon`, buttonAsset && icon !== "×" ? "" : icon, 0, caption ? 9 : 0, 36, UI.colors.white, 58, 42, button);
    iconLabel.enableOutline = true;
    iconLabel.outlineColor = UI.colors.ink;
    iconLabel.outlineWidth = 2;
    if (caption) {
      this.createLabel(`${name}Caption`, caption, 0, -30, 18, UI.colors.ink, 82, 24, button);
    }
    return iconLabel;
  }

  private createStatusLabel(): void {
    if (this.statusLabel) {
      return;
    }

    const statusPanel = this.createPanel("StatusPanel", 0, -648, 600, 36, UI.colors.panel, UI.colors.panelStroke);
    this.internalStatusLabel = this.createLabel("StatusLabel", "", 0, 0, 19, UI.colors.ink, 560, 30, statusPanel);
  }

  private onCellNodeTap(row: number, col: number, event: EventTouch | EventMouse): void {
    event.propagationStopped = true;
    this.handleCellTap(row, col);
  }

  private onButtonNodeTap(onTap: () => void, event: EventTouch | EventMouse): void {
    event.propagationStopped = true;
    onTap();
  }

  private handleCellTap(row: number, col: number): void {
    console.log(`Cell tapped: ${row}, ${col}`);
    const snapshot = this.game.snapshot();
    if (snapshot.board[row][col]?.kind === "moneyBag") {
      this.collectMoneyBag(row, col);
      return;
    }

    const result = this.game.place(row, col);
    if (!result.ok) {
      this.playSound("select");
      this.setStatus(`不能放这里：${this.reasonText(result.reason)}`);
      this.animateInvalidCell(row, col);
      return;
    }

    this.playSound(result.merges.length > 1 ? "levelup" : result.merges.length === 1 ? "merge" : "place");
    const mergeText = result.merges.length > 0 ? `，合成 ${result.merges.length} 次` : "";
    const advancedText = result.merges.some((merge) => merge.nextAdvanced) ? "，生成高级道具" : "";
    const bonusText = result.merges.some((merge) => merge.scoreMultiplier > 1) ? "，高级加分x2" : "";
    this.setStatus(`+${result.scoreGained}${mergeText}${advancedText}${bonusText}`);
    this.refresh();
    this.animatePlacement(result.placed?.row ?? row, result.placed?.col ?? col);
    for (const move of result.bearMoves) {
      this.animateBearMove(move);
    }
    for (const merge of result.merges) {
      this.animateMerge(merge.anchor.row, merge.anchor.col, merge.chain);
    }
  }

  private collectMoneyBag(row: number, col: number): void {
    const result = this.game.collectMoneyBag(row, col);
    if (!result.ok) {
      this.playSound("select");
      this.setStatus("这里没有钱袋");
      return;
    }

    this.coins += result.coinGained;
    sys.localStorage.setItem("childhood-town-coins", String(this.coins));
    this.playSound("levelup");
    this.setStatus(`获得 ${result.coinGained} 金币`);
    this.refresh();
    this.setLabel(this.coinLabel, String(this.coins));
  }

  private undoLastMove(): void {
    if (!this.game.canUndo()) {
      this.playSound("select");
      this.setStatus("只能撤回上一步");
      return;
    }

    this.game.undo();
    this.playSound("click");
    this.setStatus("已撤回一步");
    this.refresh();
  }

  private toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    sys.localStorage.setItem("childhood-town-sound", this.soundEnabled ? "on" : "muted");
    if (this.soundIconLabel) {
      this.soundIconLabel.string = this.soundEnabled ? "♪" : "×";
    }
    this.setStatus(this.soundEnabled ? "音效已开启" : "已静音");
    if (this.soundEnabled) {
      this.playSound("select");
    }
  }

  private animatePlacement(row: number, col: number): void {
    const cell = this.cells[row]?.[col]?.node;
    if (!cell) {
      return;
    }

    cell.setScale(new Vec3(0.82, 0.82, 1));
    tween(cell)
      .to(0.1, { scale: new Vec3(1.08, 1.08, 1) })
      .to(0.08, { scale: new Vec3(1, 1, 1) })
      .start();
  }

  private animateMerge(row: number, col: number, chain: number): void {
    const cell = this.cells[row]?.[col]?.node;
    if (!cell) {
      return;
    }

    const peak = Math.min(1.2, 1.08 + chain * 0.04);
    tween(cell)
      .delay(0.05 * chain)
      .to(0.1, { scale: new Vec3(peak, peak, 1) })
      .to(0.12, { scale: new Vec3(1, 1, 1) })
      .start();
  }

  private animateInvalidCell(row: number, col: number): void {
    const cell = this.cells[row]?.[col]?.node;
    if (!cell) {
      return;
    }

    const origin = cell.position.clone();
    tween(cell)
      .to(0.04, { position: new Vec3(origin.x - 8, origin.y, origin.z) })
      .to(0.04, { position: new Vec3(origin.x + 8, origin.y, origin.z) })
      .to(0.04, { position: origin })
      .start();
  }

  private animateBearMove(move: BearMoveEvent): void {
    if (move.blocked || !move.to) {
      this.animateMerge(move.from.row, move.from.col, 1);
      return;
    }

    const cell = this.cells[move.to.row]?.[move.to.col];
    if (!cell) {
      return;
    }

    const origin = cell.node.position.clone();
    const step = this.cellSize + this.cellGap;
    const startOffset = new Vec3((move.from.col - move.to.col) * step, (move.to.row - move.from.row) * step, 0);
    const direction = move.to.col >= move.from.col ? "right" : "left";
    cell.node.setPosition(new Vec3(origin.x + startOffset.x, origin.y + startOffset.y, origin.z));
    this.setSprite(cell.iconSprite, `ui/characters/bear-walk-${direction}-01`);
    this.scheduleOnce(() => this.setSprite(cell.iconSprite, `ui/characters/bear-walk-${direction}-02`), 0.08);
    this.scheduleOnce(() => this.setSprite(cell.iconSprite, `ui/characters/bear-walk-${direction}-03`), 0.16);
    tween(cell.node)
      .to(0.24, { position: origin })
      .call(() => this.setSprite(cell.iconSprite, "ui/characters/bear-idle-01"))
      .start();
  }

  private refresh(): void {
    const snapshot = this.game.snapshot();
    for (let row = 0; row < snapshot.rows; row += 1) {
      for (let col = 0; col < snapshot.cols; col += 1) {
        this.refreshCell(this.cells[row][col], snapshot.board[row][col]);
      }
    }

    if (snapshot.score > this.bestScore) {
      this.bestScore = snapshot.score;
      sys.localStorage.setItem("childhood-town-best", String(this.bestScore));
    }

    this.setLabel(this.scoreLabel, String(snapshot.score));
    this.setLabel(this.bestLabel, String(this.bestScore));
    this.setLabel(this.turnLabel, String(snapshot.turn));
    this.setLabel(this.coinLabel, String(this.coins));
    this.setPreview(this.currentIcon, this.currentLabel, snapshot.currentPiece);
    this.setPreview(this.nextIcon, this.nextLabel, snapshot.nextPiece);

    if (snapshot.gameOver) {
      this.setStatus("棋盘已满，游戏结束");
    } else if (!this.currentStatus()) {
      this.setStatus("点击空格放置当前物品");
    }
  }

  private refreshCell(view: CellView, piece: Cell): void {
    view.icon.clear();
    if (!piece) {
      this.setSprite(view.backgroundSprite, "ui/components/cell-empty");
      view.iconSprite.spriteFrame = null;
      drawRoundedBox(
        view.background,
        this.cellSize,
        this.cellSize,
        UI.colors.cell,
        UI.colors.cellStroke,
        UI.board.radius,
        3
      );
      view.label.string = "";
      return;
    }

    this.setSprite(view.backgroundSprite, "ui/components/cell-empty");
    drawRoundedBox(view.background, this.cellSize, this.cellSize, UI.colors.cell, UI.colors.cellStroke, UI.board.radius, 3);
    if (piece.kind) {
      this.setSprite(view.iconSprite, this.pieceAssetPath(piece));
      view.label.string = "";
      return;
    }

    drawPieceIcon(view.icon, piece.level ?? 0, 76, piece.advanced);
    this.setSprite(view.iconSprite, this.pieceAssetPath(piece));
    view.label.string = "";
    view.label.color = pieceVisual(piece.level ?? 0).text;
  }

  private setPreview(icon: Graphics | null, label: Label | null, piece: Cell): void {
    if (!icon || !label || !piece) {
      return;
    }

    if (piece.kind) {
      icon.clear();
    } else {
      drawPieceIcon(icon, piece.level ?? 0, 82, piece.advanced);
    }
    const targetSprite = icon === this.currentIcon ? this.currentIconSprite : this.nextIconSprite;
    if (targetSprite) {
      this.setSprite(targetSprite, this.pieceAssetPath(piece));
    }
    label.string = TownGame.pieceLabel(piece);
  }

  private pieceAssetPath(piece: Cell): string {
    if (piece?.kind === "bear") {
      return "ui/characters/bear-idle-01";
    }
    if (piece?.kind === "tombstone") {
      return "ui/characters/bear-tombstone";
    }
    if (piece?.kind === "moneyBag") {
      return "ui/characters/money-bag";
    }

    const name = piece ? PIECE_ASSET_NAMES[piece.level ?? 0] : "";
    return `ui/tiles/piece-${name}-${piece?.advanced ? "advanced" : "normal"}`;
  }

  private buttonAssetPath(name: string): string | null {
    const map: Record<string, string> = {
      UndoButton: "ui/components/button-undo",
      RestartButton: "ui/components/button-restart",
      PauseButton: "ui/components/button-pause",
      SoundButton: "ui/components/button-sound",
      SettingsButton: "ui/components/button-settings"
    };

    return map[name] ?? null;
  }

  private createPanel(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: Color = UI.colors.panel,
    stroke: Color = UI.colors.panelStroke,
    parent: Node = this.node
  ): Node {
    const panel = this.createNode(name, parent, x, y);
    panel.addComponent(UITransform).setContentSize(width, height);
    const graphics = panel.addComponent(Graphics);
    if (fill === UI.colors.panel || fill === UI.colors.panelInner || fill === UI.colors.cell) {
      drawInsetPanel(graphics, width, height);
    } else {
      drawRoundedBox(graphics, width, height, fill, stroke, 14, 4);
    }
    return panel;
  }

  private createRibbon(name: string, text: string, x: number, y: number, width: number, height: number, fill: Color, parent: Node): Label {
    const ribbon = this.createNode(name, parent, x, y);
    ribbon.addComponent(UITransform).setContentSize(width, height);
    drawRibbon(ribbon.addComponent(Graphics), width, height, fill);
    const label = this.createLabel(`${name}Label`, text, 0, 0, 22, UI.colors.white, width - 12, height - 8, ribbon);
    label.enableOutline = true;
    label.outlineColor = UI.colors.ink;
    label.outlineWidth = 2;
    return label;
  }

  private createCurrency(name: string, icon: string, value: string, x: number, y: number, color: Color): Label {
    const panel = this.createPanel(name, x, y, 156, 48, UI.colors.panelInner, UI.colors.panelStroke);
    this.addSprite(panel, name === "CoinCounter" ? "ui/components/currency-coin" : "ui/components/currency-star", 156, 48);
    this.createLabel(`${name}Icon`, icon, -54, 0, 26, color, 42, 34, panel);
    const valueLabel = this.createLabel(`${name}Value`, value, 8, 0, 26, UI.colors.ink, 76, 34, panel);
    const plus = this.createPanel(`${name}Plus`, 64, 0, 30, 30, UI.colors.buttonGreen, UI.colors.ink, panel);
    this.createLabel(`${name}PlusLabel`, "+", 0, 0, 24, UI.colors.white, 28, 28, plus);
    return valueLabel;
  }

  private createMiniScene(name: string, x: number, y: number): void {
    const panel = this.createPanel(name, x, y, 132, 74, UI.colors.panelInner, UI.colors.panelStroke);
    this.addSprite(panel, "ui/components/windmill-card", 132, 74);
    const g = panel.addComponent(Graphics);
    g.fillColor = UI.colors.grass;
    g.strokeColor = pieceVisual(1).stroke;
    g.lineWidth = 3;
    g.roundRect(-46, -22, 88, 18, 8);
    g.fill();
    g.stroke();
    g.fillColor = UI.colors.buttonGold;
    g.moveTo(-38, -2);
    g.lineTo(-16, 24);
    g.lineTo(2, -2);
    g.close();
    g.fill();
    g.stroke();
    this.createLabel(`${name}Windmill`, "✣", -32, 22, 40, UI.colors.buttonBrown, 48, 48, panel);
  }

  private addSprite(node: Node, assetPath: string, width: number, height: number): Sprite {
    const sprite = this.createSpriteChild(node, width, height);
    this.setSprite(sprite, assetPath);
    return sprite;
  }

  private createSpriteChild(node: Node, width: number, height: number): Sprite {
    const spriteNode = this.createNode(`${node.name}AssetSprite`, node, 0, 0);
    spriteNode.addComponent(UITransform).setContentSize(width, height);
    const sprite = spriteNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    return sprite;
  }

  private setSprite(sprite: Sprite, assetPath: string): void {
    const cached = this.spriteFrames.get(assetPath);
    if (cached) {
      sprite.spriteFrame = cached;
      return;
    }

    resources.load(`${assetPath}/spriteFrame`, SpriteFrame, (error, frame) => {
      if (error || !frame) {
        console.warn(`Failed to load ${assetPath}`, error);
        return;
      }

      this.spriteFrames.set(assetPath, frame);
      sprite.spriteFrame = frame;
    });
  }

  private createGrassTrim(parent: Node, x: number, y: number, width: number, height: number): void {
    const trim = this.createNode("GrassTrim", parent, x, y);
    trim.addComponent(UITransform).setContentSize(width, height);
    const g = trim.addComponent(Graphics);
    g.fillColor = UI.colors.grass;
    for (let i = 0; i < 15; i += 1) {
      const px = -width / 2 + i * 52;
      g.circle(px, -8 + (i % 3) * 6, 24 + (i % 2) * 8);
      g.fill();
    }
  }

  private createLabel(
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    width: number,
    height: number,
    parent: Node
  ): Label {
    const node = this.createNode(name, parent, x, y);
    node.addComponent(UITransform).setContentSize(width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = Math.round(fontSize * 1.12);
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    return label;
  }

  private createNode(name: string, parent: Node, x: number, y: number): Node {
    const node = new Node(name);
    node.setParent(parent);
    node.layer = parent.layer;
    node.setPosition(new Vec3(x, y, 0));
    return node;
  }

  private setLabel(label: Label | null, text: string): void {
    if (label) {
      label.string = text;
    }
  }

  private setStatus(text: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = text;
      return;
    }

    if (this.internalStatusLabel) {
      this.internalStatusLabel.string = text;
    }
  }

  private createAudio(): void {
    this.audioSource = this.node.addComponent(AudioSource);
    this.audioSource.playOnAwake = false;

    for (const name of ["place", "select", "click", "merge", "levelup"]) {
      resources.load(`audio/${name}`, AudioClip, (error, clip) => {
        if (error || !clip) {
          console.warn(`Failed to load audio/${name}`, error);
          return;
        }

        this.audioClips.set(name, clip);
      });
    }
  }

  private playSound(name: string): void {
    if (!this.soundEnabled) {
      return;
    }

    const clip = this.audioClips.get(name);
    if (!clip || !this.audioSource) {
      return;
    }

    this.audioSource.playOneShot(clip, 1);
  }

  private currentStatus(): string {
    return this.statusLabel?.string ?? this.internalStatusLabel?.string ?? "";
  }

  private reasonText(reason: string | undefined): string {
    const map: Record<string, string> = {
      occupied: "格子已经有东西",
      "out-of-bounds": "超出棋盘",
      "game-over": "游戏已结束"
    };

    return reason ? map[reason] ?? reason : "未知原因";
  }
}
