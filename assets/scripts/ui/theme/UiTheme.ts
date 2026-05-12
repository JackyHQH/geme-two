import { Color, Graphics } from "cc";

export interface PieceVisual {
  fill: Color;
  stroke: Color;
  dark: Color;
  light: Color;
  text: Color;
  shortName: string;
}

export const UI = {
  screen: {
    width: 750,
    height: 1334
  },
  board: {
    cellSize: 102,
    cellGap: 6,
    radius: 14
  },
  colors: {
    parchment: hex("#fff3d8"),
    parchmentDeep: hex("#efd79f"),
    panel: hex("#fff2cf"),
    panelInner: hex("#fff8e7"),
    panelStroke: hex("#d3ad61"),
    ink: hex("#5a2d10"),
    mutedInk: hex("#8e6a37"),
    boardFrame: hex("#b9993e"),
    boardVine: hex("#83aa36"),
    cell: hex("#fff4d6"),
    cellStroke: hex("#dcc48e"),
    cellInset: hex("#f8e8bd"),
    cellHighlight: hex("#fff0a7"),
    grass: hex("#88c446"),
    flower: hex("#9ac958"),
    tree: hex("#78b948"),
    house: hex("#d98839"),
    courtyard: hex("#8fc16f"),
    town: hex("#deaa55"),
    castle: hex("#9eb8d8"),
    ribbonGreen: hex("#87b842"),
    ribbonBlue: hex("#5a91c7"),
    ribbonGold: hex("#e7a52f"),
    buttonGold: hex("#eeb43c"),
    advancedGold: hex("#ffd45a"),
    buttonRed: hex("#d96948"),
    buttonBlue: hex("#4e91d0"),
    buttonGreen: hex("#79b847"),
    buttonBrown: hex("#a87439"),
    white: hex("#ffffff")
  }
};

export function hex(value: string, alpha = 255): Color {
  const normalized = value.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return new Color(r, g, b, alpha);
}

export function drawRoundedBox(
  graphics: Graphics,
  width: number,
  height: number,
  fill: Color,
  stroke: Color,
  radius = 12,
  lineWidth = 3
): void {
  graphics.clear();
  graphics.lineWidth = lineWidth;
  graphics.fillColor = fill;
  graphics.strokeColor = stroke;
  graphics.roundRect(-width / 2, -height / 2, width, height, radius);
  graphics.fill();
  graphics.stroke();
}

export function drawInsetPanel(graphics: Graphics, width: number, height: number): void {
  drawRoundedBox(graphics, width, height, UI.colors.panel, UI.colors.panelStroke, 16, 4);
  graphics.lineWidth = 2;
  graphics.strokeColor = hex("#fffaf0", 180);
  graphics.roundRect(-width / 2 + 8, -height / 2 + 8, width - 16, height - 16, 12);
  graphics.stroke();
}

export function drawBoardFrame(graphics: Graphics, width: number, height: number): void {
  drawRoundedBox(graphics, width, height, hex("#d2bc65"), UI.colors.boardFrame, 22, 5);
  graphics.fillColor = hex("#9abb44", 120);
  graphics.circle(-width / 2 + 24, height / 2 - 24, 18);
  graphics.fill();
  graphics.circle(width / 2 - 22, -height / 2 + 24, 16);
  graphics.fill();
}

export function drawRibbon(graphics: Graphics, width: number, height: number, fill: Color): void {
  graphics.clear();
  graphics.lineWidth = 3;
  graphics.fillColor = fill;
  graphics.strokeColor = hex("#68461e");
  const halfW = width / 2;
  const halfH = height / 2;
  graphics.moveTo(-halfW, -halfH + 8);
  graphics.lineTo(-halfW + 12, 0);
  graphics.lineTo(-halfW, halfH - 8);
  graphics.lineTo(halfW, halfH - 8);
  graphics.lineTo(halfW - 12, 0);
  graphics.lineTo(halfW, -halfH + 8);
  graphics.close();
  graphics.fill();
  graphics.stroke();
}

export function drawWoodSign(graphics: Graphics, width: number, height: number): void {
  drawRoundedBox(graphics, width, height, hex("#a96424"), hex("#704217"), 18, 5);
  graphics.lineWidth = 3;
  graphics.strokeColor = hex("#c8863a");
  graphics.moveTo(-width / 2 + 28, 6);
  graphics.lineTo(width / 2 - 28, 6);
  graphics.stroke();
  graphics.moveTo(-width / 2 + 40, -16);
  graphics.lineTo(width / 2 - 36, -16);
  graphics.stroke();
  graphics.fillColor = hex("#6fa342");
  graphics.circle(-width / 2 + 18, height / 2 - 6, 18);
  graphics.fill();
  graphics.circle(width / 2 - 18, height / 2 - 6, 18);
  graphics.fill();
}

export function drawPieceIcon(graphics: Graphics, level: number, size = 74, advanced = false): void {
  const visual = pieceVisual(level);
  const half = size / 2;
  graphics.clear();
  graphics.lineWidth = 3;

  if (level === 1) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = visual.fill;
    graphics.strokeColor = visual.stroke;
    graphics.roundRect(-half + 8, -half + 16, size - 16, size - 28, 8);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = visual.light;
    graphics.circle(-8, 1, 4);
    graphics.circle(10, -6, 4);
    graphics.fill();
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  if (level === 2) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = visual.fill;
    graphics.strokeColor = visual.stroke;
    graphics.circle(0, -4, half - 10);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = visual.light;
    for (const point of [[-14, 8], [9, 12], [15, -8], [-8, -13]]) {
      graphics.circle(point[0], point[1], 6);
      graphics.fill();
    }
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  if (level === 3) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = hex("#8a5b2b");
    graphics.roundRect(-6, -half + 12, 12, 34, 5);
    graphics.fill();
    graphics.fillColor = visual.fill;
    graphics.strokeColor = visual.stroke;
    graphics.circle(0, 8, half - 8);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = visual.light;
    graphics.circle(-12, 18, 8);
    graphics.circle(14, 12, 8);
    graphics.fill();
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  if (level === 4) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = hex("#f5d37d");
    graphics.strokeColor = visual.stroke;
    graphics.roundRect(-28, -26, 56, 42, 6);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = visual.fill;
    graphics.moveTo(-34, 14);
    graphics.lineTo(0, 38);
    graphics.lineTo(34, 14);
    graphics.close();
    graphics.fill();
    graphics.stroke();
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  if (level === 5) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = visual.light;
    graphics.strokeColor = visual.stroke;
    graphics.roundRect(-30, -24, 60, 42, 9);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = hex("#65a84d");
    graphics.circle(-24, -7, 10);
    graphics.circle(24, -5, 10);
    graphics.fill();
    graphics.fillColor = hex("#72b8dd");
    graphics.circle(0, 0, 14);
    graphics.fill();
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  if (level === 6) {
    drawAdvancedAura(graphics, size, advanced);
    graphics.fillColor = hex("#f0c771");
    graphics.strokeColor = visual.stroke;
    graphics.roundRect(-30, -24, 26, 44, 5);
    graphics.fill();
    graphics.stroke();
    graphics.roundRect(2, -18, 30, 52, 5);
    graphics.fill();
    graphics.stroke();
    drawAdvancedBadge(graphics, size, advanced);
    return;
  }

  drawAdvancedAura(graphics, size, advanced);
  graphics.fillColor = visual.fill;
  graphics.strokeColor = visual.stroke;
  graphics.roundRect(-30, -28, 60, 48, 6);
  graphics.fill();
  graphics.stroke();
  graphics.fillColor = hex("#3c7bc1");
  graphics.moveTo(-28, 20);
  graphics.lineTo(-18, 38);
  graphics.lineTo(-8, 20);
  graphics.close();
  graphics.fill();
  graphics.moveTo(8, 20);
  graphics.lineTo(18, 42);
  graphics.lineTo(30, 20);
  graphics.close();
  graphics.fill();
  drawAdvancedBadge(graphics, size, advanced);
}

function drawAdvancedAura(graphics: Graphics, size: number, advanced: boolean): void {
  if (!advanced) {
    return;
  }

  graphics.lineWidth = 4;
  graphics.strokeColor = hex("#ffe58a", 230);
  graphics.circle(0, 0, size / 2 - 3);
  graphics.stroke();
}

function drawAdvancedBadge(graphics: Graphics, size: number, advanced: boolean): void {
  if (!advanced) {
    return;
  }

  const x = size / 2 - 14;
  const y = size / 2 - 14;
  graphics.lineWidth = 3;
  graphics.fillColor = UI.colors.advancedGold;
  graphics.strokeColor = hex("#8b5a12");
  graphics.circle(x, y, 13);
  graphics.fill();
  graphics.stroke();

  graphics.fillColor = hex("#fff8c9");
  graphics.moveTo(x, y + 8);
  graphics.lineTo(x + 3, y + 2);
  graphics.lineTo(x + 9, y);
  graphics.lineTo(x + 3, y - 3);
  graphics.lineTo(x, y - 9);
  graphics.lineTo(x - 3, y - 3);
  graphics.lineTo(x - 9, y);
  graphics.lineTo(x - 3, y + 2);
  graphics.close();
  graphics.fill();
}

export function pieceVisual(level: number): PieceVisual {
  const visuals: Record<number, PieceVisual> = {
    1: { fill: UI.colors.grass, stroke: hex("#639b2f"), dark: hex("#507c2a"), light: hex("#fff1a8"), text: UI.colors.ink, shortName: "草" },
    2: { fill: UI.colors.flower, stroke: hex("#5f9434"), dark: hex("#4d7b29"), light: hex("#fff4c4"), text: UI.colors.ink, shortName: "花" },
    3: { fill: UI.colors.tree, stroke: hex("#4c822f"), dark: hex("#3e6828"), light: hex("#b9e674"), text: UI.colors.ink, shortName: "树" },
    4: { fill: UI.colors.house, stroke: hex("#965122"), dark: hex("#713b18"), light: hex("#f7d780"), text: UI.colors.ink, shortName: "屋" },
    5: { fill: UI.colors.courtyard, stroke: hex("#5a8d43"), dark: hex("#497034"), light: hex("#eadb9a"), text: UI.colors.ink, shortName: "院" },
    6: { fill: UI.colors.town, stroke: hex("#a86822"), dark: hex("#784715"), light: hex("#f1d083"), text: UI.colors.ink, shortName: "镇" },
    7: { fill: UI.colors.castle, stroke: hex("#667c9f"), dark: hex("#465977"), light: hex("#d7e2ef"), text: UI.colors.ink, shortName: "堡" }
  };

  return visuals[level] ?? { fill: UI.colors.cell, stroke: UI.colors.cellStroke, dark: UI.colors.ink, light: UI.colors.white, text: UI.colors.ink, shortName: "?" };
}
