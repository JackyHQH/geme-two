import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "assets/art/generated-ui");
const srcDir = join(outDir, "svg");
mkdirSync(srcDir, { recursive: true });

const C = {
  parchment: "#fff3d8",
  panel: "#fff8e7",
  panel2: "#fff0c8",
  stroke: "#d3ad61",
  ink: "#5a2d10",
  wood: "#a96424",
  woodDark: "#704217",
  grass: "#88c446",
  green: "#87b842",
  blue: "#5a91c7",
  gold: "#eeb43c",
  red: "#d96948",
  brown: "#a87439",
  white: "#fffaf0",
  cell: "#fff4d6",
  cellStroke: "#dcc48e",
  advanced: "#ffd45a"
};

function svg(width, height, body, extraDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#7a4a14" flood-opacity="0.24"/>
    </filter>
    <linearGradient id="panelGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fffaf0"/>
      <stop offset="1" stop-color="#f5dfaa"/>
    </linearGradient>
    <linearGradient id="woodGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#c77b31"/>
      <stop offset="1" stop-color="#8f541f"/>
    </linearGradient>
    ${extraDefs}
  </defs>
  ${body}
</svg>
`;
}

function text(x, y, value, size, fill = C.ink, weight = 800, anchor = "middle") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, PingFang SC, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" stroke="${fill === C.white ? C.ink : "none"}" stroke-width="${fill === C.white ? 4 : 0}" paint-order="stroke">${value}</text>`;
}

function panel(width, height, radius = 18) {
  return `<rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="${radius}" fill="url(#panelGrad)" stroke="${C.stroke}" stroke-width="5" filter="url(#softShadow)"/>
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="${Math.max(8, radius - 5)}" fill="none" stroke="#fffaf0" stroke-width="2" opacity="0.7"/>`;
}

function ribbon(width, color, label) {
  return `<path d="M18 8 H${width - 18} L${width - 34} 31 L${width - 18} 54 H18 L34 31 Z" fill="${color}" stroke="${C.ink}" stroke-width="4" filter="url(#softShadow)"/>
  ${text(width / 2, 39, label, 26, C.white)}`;
}

function advancedMark(cx = 94, cy = 26) {
  return `<circle cx="${cx}" cy="${cy}" r="17" fill="${C.advanced}" stroke="#8b5a12" stroke-width="4"/>
  <path d="M${cx} ${cy - 11} L${cx + 4} ${cy - 3} L${cx + 13} ${cy} L${cx + 4} ${cy + 4} L${cx} ${cy + 13} L${cx - 4} ${cy + 4} L${cx - 13} ${cy} L${cx - 4} ${cy - 3} Z" fill="#fff8c9"/>`;
}

const pieces = {
  grass: {
    name: "草地",
    body: `<rect x="24" y="52" width="80" height="44" rx="10" fill="${C.grass}" stroke="#639b2f" stroke-width="5"/>
    <circle cx="53" cy="65" r="6" fill="#fff4c4"/><circle cx="74" cy="76" r="6" fill="#fff4c4"/><circle cx="89" cy="62" r="4" fill="#fff4c4"/>`
  },
  flower: {
    name: "花丛",
    body: `<circle cx="64" cy="62" r="39" fill="#9ac958" stroke="#5f9434" stroke-width="5"/>
    <circle cx="45" cy="56" r="8" fill="#fff4c4"/><circle cx="73" cy="48" r="8" fill="#fff4c4"/><circle cx="84" cy="72" r="8" fill="#fff4c4"/><circle cx="57" cy="80" r="8" fill="#fff4c4"/>
    <circle cx="45" cy="56" r="3" fill="#e7a52f"/><circle cx="73" cy="48" r="3" fill="#e7a52f"/><circle cx="84" cy="72" r="3" fill="#e7a52f"/><circle cx="57" cy="80" r="3" fill="#e7a52f"/>`
  },
  tree: {
    name: "小树",
    body: `<rect x="57" y="66" width="15" height="38" rx="6" fill="#8a5b2b"/>
    <circle cx="64" cy="48" r="40" fill="#78b948" stroke="#4c822f" stroke-width="5"/>
    <circle cx="47" cy="42" r="14" fill="#a7d85e" opacity="0.7"/><circle cx="79" cy="50" r="13" fill="#a7d85e" opacity="0.7"/>`
  },
  house: {
    name: "木屋",
    body: `<rect x="32" y="60" width="64" height="44" rx="7" fill="#f5d37d" stroke="#965122" stroke-width="5"/>
    <path d="M25 62 L64 29 L103 62 Z" fill="#d98839" stroke="#965122" stroke-width="5"/>
    <rect x="56" y="78" width="16" height="26" rx="3" fill="#71421b"/><rect x="78" y="68" width="12" height="12" rx="2" fill="#77b8d7"/>`
  },
  courtyard: {
    name: "小院",
    body: `<ellipse cx="64" cy="77" rx="43" ry="24" fill="#eadb9a" stroke="#5a8d43" stroke-width="5"/>
    <circle cx="64" cy="64" r="18" fill="#72b8dd" stroke="#4d86a4" stroke-width="4"/>
    <path d="M64 38 V64" stroke="#d0a76a" stroke-width="5"/><circle cx="64" cy="37" r="7" fill="#d0a76a"/>
    <circle cx="30" cy="72" r="12" fill="#65a84d"/><circle cx="98" cy="74" r="12" fill="#65a84d"/>`
  },
  town: {
    name: "小镇",
    body: `<rect x="28" y="62" width="34" height="42" rx="5" fill="#f0c771" stroke="#a86822" stroke-width="5"/>
    <path d="M24 63 L45 42 L67 63 Z" fill="#d98839" stroke="#a86822" stroke-width="4"/>
    <rect x="66" y="48" width="36" height="56" rx="6" fill="#deaa55" stroke="#a86822" stroke-width="5"/>
    <path d="M62 50 L84 27 L106 50 Z" fill="#d85f3a" stroke="#a86822" stroke-width="4"/>`
  },
  castle: {
    name: "城堡",
    body: `<rect x="30" y="56" width="68" height="48" rx="7" fill="#9eb8d8" stroke="#667c9f" stroke-width="5"/>
    <path d="M29 56 L43 28 L58 56 Z" fill="#3c7bc1" stroke="#667c9f" stroke-width="4"/>
    <path d="M72 56 L87 25 L103 56 Z" fill="#3c7bc1" stroke="#667c9f" stroke-width="4"/>
    <rect x="56" y="82" width="18" height="22" rx="8" fill="#704217"/>`
  }
};

function pieceAsset(key, advanced = false) {
  const piece = pieces[key];
  const mark = advanced ? `<circle cx="64" cy="62" r="51" fill="none" stroke="#ffe58a" stroke-width="6"/>${advancedMark(102, 26)}` : "";
  return svg(128, 128, `${mark}${piece.body}${text(64, 121, advanced ? `高级${piece.name}` : piece.name, 17)}`);
}

const assets = {
  "title-sign.svg": svg(440, 140, `<path d="M60 48 C35 32 17 51 25 77 C5 82 7 113 38 119 H402 C432 113 434 82 415 76 C423 49 402 31 380 48 C334 16 274 22 247 46 C211 18 149 19 116 48 Z" fill="#6da33f" opacity="0.9"/>
  <rect x="55" y="36" width="330" height="80" rx="20" fill="url(#woodGrad)" stroke="${C.woodDark}" stroke-width="6" filter="url(#softShadow)"/>
  <path d="M82 61 H358 M96 88 H345" stroke="#d08a3e" stroke-width="5" opacity="0.8"/>
  ${text(220, 91, "童年小镇", 56, C.white)}
  <circle cx="94" cy="108" r="10" fill="#ffd45a"/><circle cx="346" cy="108" r="10" fill="#ffd45a"/>`),
  "windmill-card.svg": svg(180, 108, `${panel(180, 108, 18)}
  <rect x="34" y="68" width="106" height="24" rx="11" fill="${C.grass}" stroke="#639b2f" stroke-width="5"/>
  <path d="M55 70 L86 29 L115 70 Z" fill="${C.gold}" stroke="${C.woodDark}" stroke-width="5"/>
  <path d="M86 38 V8 M86 38 L51 22 M86 38 L121 22 M86 38 L71 73 M86 38 L101 73" stroke="${C.brown}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="86" cy="38" r="6" fill="#ffe7a6"/>`),
  "currency-coin.svg": svg(212, 64, `${panel(212, 64, 28)}<circle cx="42" cy="32" r="23" fill="${C.gold}" stroke="#a56b18" stroke-width="5"/>${text(42, 42, "★", 23, C.white)}${text(112, 42, "2456", 30)}<circle cx="184" cy="32" r="18" fill="#79b847" stroke="#4f7b2d" stroke-width="5"/>${text(184, 42, "+", 28, C.white)}`),
  "currency-star.svg": svg(212, 64, `${panel(212, 64, 28)}${text(42, 44, "★", 40, C.gold)}${text(112, 42, "128", 30)}<circle cx="184" cy="32" r="18" fill="#79b847" stroke="#4f7b2d" stroke-width="5"/>${text(184, 42, "+", 28, C.white)}`),
  "stat-score.svg": svg(240, 120, `${panel(240, 120, 18)}<g transform="translate(28 -2)">${ribbon(184, C.green, "分数")}</g>${text(120, 88, "1260", 46)}`),
  "stat-best.svg": svg(240, 120, `${panel(240, 120, 18)}<g transform="translate(28 -2)">${ribbon(184, C.gold, "最高")}</g>${text(82, 88, "🏆", 30, C.gold)}${text(145, 88, "8320", 46)}`),
  "stat-turn.svg": svg(240, 120, `${panel(240, 120, 18)}<g transform="translate(20 -2)">${ribbon(200, C.blue, "当前回合")}</g>${text(120, 88, "28", 46)}`),
  "board-frame.svg": svg(700, 700, `<rect x="8" y="8" width="684" height="684" rx="28" fill="#d2bc65" stroke="#b9993e" stroke-width="8" filter="url(#softShadow)"/>
  <path d="M24 92 C28 48 55 23 100 24 M615 674 C660 668 679 637 675 590" fill="none" stroke="#83aa36" stroke-width="16" stroke-linecap="round" opacity="0.85"/>`),
  "cell-empty.svg": svg(116, 116, `<rect x="6" y="6" width="104" height="104" rx="17" fill="${C.cell}" stroke="${C.cellStroke}" stroke-width="5" filter="url(#softShadow)"/><path d="M79 82 C83 70 88 72 89 86 M88 86 C95 77 100 80 98 90 M82 88 C74 78 69 82 72 93" fill="none" stroke="#cfc174" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`),
  "cell-highlight.svg": svg(116, 116, `<rect x="6" y="6" width="104" height="104" rx="17" fill="#fff0a7" stroke="${C.gold}" stroke-width="7" filter="url(#softShadow)"/><path d="M79 82 C83 70 88 72 89 86 M88 86 C95 77 100 80 98 90 M82 88 C74 78 69 82 72 93" fill="none" stroke="#cfc174" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`),
  "bottom-tray.svg": svg(700, 220, `<rect x="8" y="8" width="684" height="204" rx="28" fill="${C.panel}" stroke="${C.stroke}" stroke-width="6" filter="url(#softShadow)"/><rect x="30" y="30" width="640" height="160" rx="20" fill="none" stroke="#e6c984" stroke-width="3" stroke-dasharray="12 10"/>`),
  "button-undo.svg": svg(96, 84, `<rect x="8" y="8" width="80" height="68" rx="16" fill="${C.gold}" stroke="${C.ink}" stroke-width="5" filter="url(#softShadow)"/>${text(48, 57, "↶", 48, C.white)}`),
  "button-restart.svg": svg(96, 84, `<rect x="8" y="8" width="80" height="68" rx="16" fill="${C.red}" stroke="${C.ink}" stroke-width="5" filter="url(#softShadow)"/>${text(48, 57, "↻", 48, C.white)}`),
  "button-pause.svg": svg(82, 82, `<rect x="8" y="8" width="66" height="66" rx="16" fill="${C.blue}" stroke="${C.ink}" stroke-width="5" filter="url(#softShadow)"/>${text(41, 58, "Ⅱ", 42, C.white)}`),
  "button-sound.svg": svg(82, 82, `<rect x="8" y="8" width="66" height="66" rx="16" fill="#79b847" stroke="${C.ink}" stroke-width="5" filter="url(#softShadow)"/>${text(41, 58, "♪", 42, C.white)}`),
  "button-settings.svg": svg(82, 82, `<rect x="8" y="8" width="66" height="66" rx="16" fill="${C.brown}" stroke="${C.ink}" stroke-width="5" filter="url(#softShadow)"/>${text(41, 58, "⚙", 38, C.white)}`),
  "preview-current.svg": svg(150, 176, `${panel(150, 176, 18)}<g transform="translate(20 -4)">${ribbon(110, C.green, "当前")}</g><g transform="translate(11 34)">${pieceAsset("grass").replace(/^<svg[^>]*>|<\/svg>\s*$/g, "")}</g>`),
  "preview-next.svg": svg(150, 176, `${panel(150, 176, 18)}<g transform="translate(20 -4)">${ribbon(110, C.blue, "下一个")}</g><g transform="translate(11 34)">${pieceAsset("tree").replace(/^<svg[^>]*>|<\/svg>\s*$/g, "")}</g>`)
};

for (const [key, piece] of Object.entries(pieces)) {
  assets[`piece-${key}.svg`] = pieceAsset(key);
  assets[`piece-${key}-advanced.svg`] = pieceAsset(key, true);
}

for (const [name, content] of Object.entries(assets)) {
  writeFileSync(join(srcDir, name), content);
}

const names = Object.keys(assets).sort();
const tileW = 190;
const tileH = 190;
const cols = 5;
const rows = Math.ceil(names.length / cols);
const previewBody = names.map((name, index) => {
  const x = 36 + (index % cols) * tileW;
  const y = 76 + Math.floor(index / cols) * tileH;
  const content = assets[name].replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
  return `<g transform="translate(${x} ${y})"><rect x="-12" y="-40" width="170" height="170" rx="14" fill="#fff8e7" stroke="#d3ad61" stroke-width="3"/><g transform="translate(10 -24) scale(0.72)">${content}</g>${text(73, 148, name.replace(".svg", ""), 12, C.ink, 700)}</g>`;
}).join("\n");

writeFileSync(join(outDir, "ui-assets-preview.svg"), svg(cols * tileW + 44, rows * tileH + 96, `<rect width="100%" height="100%" fill="${C.parchment}"/>${text(500, 42, "童年小镇 UI 单图资产预览", 30)}${previewBody}`));

writeFileSync(join(outDir, "README.md"), `# Generated UI Assets

This folder contains the second-pass fairy-tale town UI assets redrawn as separate source images based on the user's preferred reference.

- \`svg/\`: individual source UI images.
- \`ui-assets-preview.svg\`: overview sheet for quick review.

These are project-local source assets. Convert selected SVGs to PNG before wiring them into Cocos Sprite components if needed.
`);

console.log(`Generated ${names.length} UI SVG assets in ${srcDir}`);
