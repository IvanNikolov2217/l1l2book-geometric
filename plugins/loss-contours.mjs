// Loss Contours — training error as a landscape
// Exports default { render }. render(container) mounts the widget and returns
// a cleanup function. Theme switches via a .dark class toggle button.

const HTML = `
<div class="lc-root">
  <style>
    .lc-root {
      --bg: #eef4fb;
      --fg: #1a2230;
      --muted: #5f6b7d;
      --border: #c2d3e8;
      --grid: #c2d3e8;
      --axis: #8fa6c2;
      --ellipse: #2563eb;
      --optimum: #2563eb;
    }
    .lc-root.dark {
      --bg: #1b2433;
      --fg: #e6ecf5;
      --muted: #9aa7bb;
      --border: #364964;
      --grid: #2c3a52;
      --axis: #54678a;
      --ellipse: #60a5fa;
      --optimum: #60a5fa;
    }
    .lc-root *, .lc-root *::before, .lc-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .lc-root {
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 1.25rem;
      font-size: 14px;
      border-radius: 10px;
      transition: background .25s, color .25s;
    }
    .lc-root .caption {
      font-size: 11px; font-weight: 600; letter-spacing: .08em;
      text-transform: uppercase; color: var(--muted); margin-bottom: .85rem;
    }
    .lc-root .stage { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start; justify-content: center; }
    .lc-root .plot-wrap { width: 100%; max-width: 360px; margin: 0 auto; }
    .lc-root svg { width: 100%; height: auto; display: block; }
    .lc-root .legend {
      display: flex; gap: 1.1rem; flex-wrap: wrap; margin-top: .8rem; font-size: 12px; color: var(--muted);
    }
    .lc-root .legend span { display: inline-flex; align-items: center; gap: .35rem; }
    .lc-root .swatch { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
    .lc-root .swatch.dot { width: 9px; height: 9px; border-radius: 50%; }
    .lc-root .note { margin-top: .85rem; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
  </style>

  <div class="caption">Figure 1: Loss contours — training error as a landscape</div>

  <div class="stage">
    <div class="plot-wrap">
      <svg class="plot" viewBox="0 0 360 360" aria-label="Concentric loss contours centred on the unregularized optimum, like elevation lines on a map.">
        <g class="grid"></g>
        <g class="axes"></g>
        <g class="ellipses"></g>
        <circle class="optimum" r="6" stroke="#fff" stroke-width="1.5"></circle>
        <text class="lbl-w1" font-size="12" font-style="italic">w₁</text>
        <text class="lbl-w2" font-size="12" font-style="italic">w₂</text>
        <text class="lbl-opt" font-size="11">w&#770;</text>
      </svg>
    </div>
  </div>

  <div class="legend">
    <span><i class="swatch" style="background:var(--ellipse)"></i> equal-loss contours</span>
    <span><i class="swatch dot" style="background:var(--optimum)"></i> unregularized optimum</span>
  </div>
</div>
`;

export function render(arg) {
  // The host may call render() with a DOM element, an id string, or an options
  // object that carries the element under a common key. Normalize to an Element.
  function resolveEl(arg) {
    if (!arg) return null;
    if (typeof arg === "string")
      return document.getElementById(arg) || document.querySelector(arg);
    if (typeof arg.querySelector === "function") return arg; // already an Element
    if (arg.nodeType === 1) return arg;
    for (const k of [
      "el",
      "element",
      "container",
      "node",
      "target",
      "dom",
      "root",
      "mount",
    ]) {
      const v = arg[k];
      if (v && (typeof v.querySelector === "function" || v.nodeType === 1))
        return v;
      if (typeof v === "string") {
        const found = document.getElementById(v) || document.querySelector(v);
        if (found) return found;
      }
    }
    return null;
  }
  const container = resolveEl(arg);
  if (!container)
    throw new Error(
      "render(): could not resolve a mount element from argument",
    );
  container.innerHTML = HTML;
  const root = container.querySelector(".lc-root");
  const $ = (sel) => root.querySelector(sel);

  const SVG = 360,
    C = 180,
    SCALE = 42;
  function W2P(wx, wy) {
    return [C + wx * SCALE, C - wy * SCALE];
  }
  function cssvar(n) {
    return getComputedStyle(root).getPropertyValue(n).trim();
  }

  const opt = { x: 1.4, y: 0.9 };
  const Lxx = 1.0,
    Lyy = 1.7,
    Lxy = 0.45;

  function drawGrid() {
    const g = $(".grid");
    g.innerHTML = "";
    const ax = $(".axes");
    ax.innerHTML = "";
    const grid = cssvar("--grid"),
      axis = cssvar("--axis");
    for (let i = -4; i <= 4; i++) {
      const [x] = W2P(i, 0);
      g.insertAdjacentHTML(
        "beforeend",
        `<line x1="${x}" y1="0" x2="${x}" y2="${SVG}" stroke="${grid}" stroke-width="1"/>`,
      );
      const [, y] = W2P(0, i);
      g.insertAdjacentHTML(
        "beforeend",
        `<line x1="0" y1="${y}" x2="${SVG}" y2="${y}" stroke="${grid}" stroke-width="1"/>`,
      );
    }
    ax.insertAdjacentHTML(
      "beforeend",
      `<line x1="0" y1="${C}" x2="${SVG}" y2="${C}" stroke="${axis}" stroke-width="1.5"/>`,
    );
    ax.insertAdjacentHTML(
      "beforeend",
      `<line x1="${C}" y1="0" x2="${C}" y2="${SVG}" stroke="${axis}" stroke-width="1.5"/>`,
    );
  }

  function ellipsePath(levelL) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      const ux = Math.cos(t),
        uy = Math.sin(t);
      const a = Lxx * ux * ux + Lyy * uy * uy + 2 * Lxy * ux * uy;
      const r = Math.sqrt(levelL / a);
      const [px, py] = W2P(opt.x + r * ux, opt.y + r * uy);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return "M" + pts.join(" L") + " Z";
  }

  function render() {
    const ell = $(".ellipses");
    ell.innerHTML = "";
    const col = cssvar("--ellipse");
    const radii = [0.5, 1.0, 1.6, 2.3, 3.1];
    radii.forEach((rad, i) => {
      const levelL = rad * rad;
      const op = 0.7 - i * 0.1;
      ell.insertAdjacentHTML(
        "beforeend",
        `<path d="${ellipsePath(levelL)}" fill="none" stroke="${col}" ` +
          `stroke-width="${i === 0 ? 2 : 1.2}" opacity="${op.toFixed(2)}"/>`,
      );
    });

    const [ox, oy] = W2P(opt.x, opt.y);
    const o = $(".optimum");
    o.setAttribute("cx", ox);
    o.setAttribute("cy", oy);
    o.setAttribute("fill", cssvar("--optimum"));
    const lo = $(".lbl-opt");
    lo.setAttribute("x", ox + 9);
    lo.setAttribute("y", oy - 8);
    lo.setAttribute("fill", cssvar("--fg"));
  }

  function placeLabels() {
    $(".lbl-w1").setAttribute("x", SVG - 18);
    $(".lbl-w1").setAttribute("y", C - 6);
    $(".lbl-w2").setAttribute("x", C + 6);
    $(".lbl-w2").setAttribute("y", 14);
    $(".lbl-w1").setAttribute("fill", cssvar("--muted"));
    $(".lbl-w2").setAttribute("fill", cssvar("--muted"));
  }

  function redrawAll() {
    drawGrid();
    placeLabels();
    render();
  }

  // ---- follow the site's dark mode automatically ----
  // The MyST/Tailwind theme toggles a `dark` class (and some setups a
  // data-theme="dark") on <html> or <body>. Mirror whatever the site shows.
  function siteIsDark() {
    const el = document.documentElement,
      b = document.body;
    const hasDarkClass = (n) =>
      n && n.classList && n.classList.contains("dark");
    const dataDark = (n) =>
      n &&
      n.getAttribute &&
      (n.getAttribute("data-theme") === "dark" ||
        n.getAttribute("data-mode") === "dark" ||
        n.getAttribute("data-color-mode") === "dark");
    if (hasDarkClass(el) || hasDarkClass(b) || dataDark(el) || dataDark(b))
      return true;
    const hasLight = (n) =>
      n &&
      ((n.classList && n.classList.contains("light")) ||
        (n.getAttribute &&
          (n.getAttribute("data-theme") === "light" ||
            n.getAttribute("data-mode") === "light")));
    if (hasLight(el) || hasLight(b)) return false;
    return !!(
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
  function applySiteTheme() {
    const dark = siteIsDark();
    if (root.classList.contains("dark") !== dark) {
      root.classList.toggle("dark", dark);
    }
    redrawAll();
  }

  const themeObserver = new MutationObserver(applySiteTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-mode", "data-color-mode"],
  });
  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "data-color-mode"],
    });
  }
  let mql = null,
    onMql = null;
  if (window.matchMedia) {
    mql = window.matchMedia("(prefers-color-scheme: dark)");
    onMql = () => applySiteTheme();
    if (mql.addEventListener) mql.addEventListener("change", onMql);
    else if (mql.addListener) mql.addListener(onMql);
  }

  applySiteTheme();

  return function cleanup() {
    themeObserver.disconnect();
    if (mql && onMql) {
      if (mql.removeEventListener) mql.removeEventListener("change", onMql);
      else if (mql.removeListener) mql.removeListener(onMql);
    }
    container.innerHTML = "";
  };
}

export default { render };
