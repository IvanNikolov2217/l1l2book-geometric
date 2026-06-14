// Constraint Region Explorer — Ridge vs Lasso
// Exports default { render }. render(container) mounts the widget and returns
// a cleanup function. Theme switches between light and dark via a toggle button
// (driven by a .dark class on the root element rather than prefers-color-scheme).

const HTML = `
<div class="cre-root">
  <style>
    .cre-root {
      --bg: #eef4fb;
      --fg: #1a2230;
      --muted: #5f6b7d;
      --tab-bg: #dbe7f5;
      --tab-fg: #3a4759;
      --tab-hover: #c9daee;
      --border: #c2d3e8;
      --panel: #e2ecf8;
      --grid: #c2d3e8;
      --axis: #8fa6c2;
      --ellipse: #2563eb;
      --region: #e11d48;
      --solution: #1a2230;
      --optimum: #2563eb;
      --dense: #facc15;
      --sparse: #22c55e;
    }
    .cre-root.dark {
      --bg: #1b2433;
      --fg: #e6ecf5;
      --muted: #9aa7bb;
      --tab-bg: #27344a;
      --tab-fg: #c2ccdc;
      --tab-hover: #324158;
      --border: #364964;
      --panel: #222e42;
      --grid: #2c3a52;
      --axis: #54678a;
      --ellipse: #60a5fa;
      --region: #fb7185;
      --solution: #e6ecf5;
      --optimum: #60a5fa;
      --dense: #fde047;
      --sparse: #4ade80;
    }
    .cre-root *, .cre-root *::before, .cre-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .cre-root {
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 1.25rem;
      font-size: 14px;
      border-radius: 10px;
      transition: background .25s, color .25s;
    }
    .cre-root .caption {
      font-size: 11px; font-weight: 600; letter-spacing: .08em;
      text-transform: uppercase; color: var(--muted); margin-bottom: .85rem;
    }
    .cre-root .tab-row { display: flex; gap: 6px; margin-bottom: 1rem; flex-wrap: wrap; }
    .cre-root .tab-btn {
      padding: 5px 14px; border-radius: 4px; border: 1px solid var(--border);
      background: var(--tab-bg); font-size: 13px; cursor: pointer; color: var(--tab-fg);
      font-family: inherit; font-weight: 500; transition: background .15s, color .15s, border-color .15s;
    }
    .cre-root .tab-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    .cre-root .tab-btn.mb-lasso.active { background: #e11d48; border-color: #e11d48; }
    .cre-root .tab-btn:hover:not(.active) { background: var(--tab-hover); }
    .cre-root .stage { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start; }
    .cre-root .plot-wrap { flex: 1 1 320px; min-width: 280px; max-width: 360px; }
    .cre-root svg { width: 100%; height: auto; display: block; touch-action: none; }
    .cre-root .controls { flex: 1 1 200px; min-width: 200px; }
    .cre-root .slider-block { margin-bottom: 1rem; }
    .cre-root .slider-block label {
      display: flex; justify-content: space-between; font-size: 12.5px; color: var(--muted); margin-bottom: .35rem;
    }
    .cre-root .slider-block label b { color: var(--fg); font-variant-numeric: tabular-nums; }
    .cre-root input[type=range] { width: 100%; accent-color: #2563eb; cursor: pointer; }
    .cre-root.lasso input[type=range] { accent-color: #e11d48; }
    .cre-root .readout {
      background: var(--panel); border: 1px solid var(--border); border-radius: 6px;
      padding: .7rem .85rem; font-size: 12.5px; line-height: 1.6;
    }
    .cre-root .readout .row { display: flex; justify-content: space-between; }
    .cre-root .readout .row b { font-variant-numeric: tabular-nums; }
    .cre-root .zero-flag { color: var(--region); font-weight: 700; }
    .cre-root .legend {
      display: flex; gap: 1.1rem; flex-wrap: wrap; margin-top: .8rem; font-size: 12px; color: var(--muted);
    }
    .cre-root .legend span { display: inline-flex; align-items: center; gap: .35rem; }
    .cre-root .swatch { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
    .cre-root .swatch.dot { width: 9px; height: 9px; border-radius: 50%; }
    .cre-root .note { margin-top: .85rem; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
    .cre-root .hint { font-style: italic; }
  </style>

  <div class="caption">Figure 4: Constraint region — where the solution lands</div>

  <div class="tab-row">
    <button class="tab-btn mb-ridge active" type="button">Ridge (L2) — circle</button>
    <button class="tab-btn mb-lasso" type="button">Lasso (L1) — diamond</button>
  </div>

  <div class="stage">
    <div class="plot-wrap">
      <svg class="plot" viewBox="0 0 360 360" aria-label="Weight plane showing loss contours, the constraint region, the unregularized optimum, and the regularized solution.">
        <defs>
          <clipPath class="outsideRegion" clip-rule="evenodd">
            <path class="clipPath" clip-rule="evenodd"></path>
          </clipPath>
        </defs>
        <g class="grid"></g>
        <g class="axes"></g>
        <g class="pathring"></g>
        <g class="ellipses"></g>
        <path class="region" fill="none" stroke-width="2"></path>
        <circle class="solution" r="5.5"></circle>
        <circle class="optimum" r="6" stroke="#fff" stroke-width="1.5"></circle>
        <text class="lbl-w1" font-size="12" font-style="italic">w₁</text>
        <text class="lbl-w2" font-size="12" font-style="italic">w₂</text>
      </svg>
    </div>

    <div class="controls">
      <div class="slider-block">
        <label>Optimum position <b class="posVal">36°</b></label>
        <input type="range" class="pos" min="0" max="360" step="1" value="36">
      </div>
      <div class="slider-block">
        <label>Regularization strength λ <b class="lamVal">0.50</b></label>
        <input type="range" class="lam" min="0" max="1" step="0.01" value="0.5">
      </div>
      <div class="readout">
        <div class="row"><span>Solution w₁</span><b class="outW1">—</b></div>
        <div class="row"><span>Solution w₂</span><b class="outW2">—</b></div>
        <div class="row statusRow"><span>Solution</span><b class="status">—</b></div>
      </div>
      <div class="legend">
        <span><i class="swatch" style="background:var(--ellipse)"></i> loss contours</span>
        <span><i class="swatch" style="background:var(--region)"></i> constraint</span>
        <span><i class="swatch dot" style="background:var(--optimum)"></i> unreg. optimum</span>
        <span><i class="swatch dot" style="background:var(--solution)"></i> solution</span>
        <span><i class="swatch" style="background:var(--dense)"></i> path: dense</span>
        <span><i class="swatch" style="background:var(--sparse)"></i> path: sparse</span>
      </div>
    </div>
  </div>

  <p class="note">
    The unregularized optimum stays fixed — use the <span class="hint">position slider</span> to move it around
    its circle. As you raise <span class="hint">λ</span>, the constraint <em>budget shrinks</em>: the region
    contracts toward the origin, pulling the solution along the boundary. The loss circle just <em>touches</em>
    that shrinking region, and the touch point is the solution. The path is
    <span style="color:var(--dense);font-weight:600">yellow</span> where the result is dense and
    <span style="color:var(--sparse);font-weight:600">green</span> where Lasso drives a weight to exactly zero.
  </p>
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
  const root = container.querySelector(".cre-root");
  const $ = (sel) => root.querySelector(sel);

  const SVG = 360,
    C = 180,
    SCALE = 42;
  const svg = $(".plot");
  function W2P(wx, wy) {
    return [C + wx * SCALE, C - wy * SCALE];
  }
  function cssvar(n) {
    return getComputedStyle(root).getPropertyValue(n).trim();
  }

  let posDeg = 36;
  let method = "ridge";
  let lambda = 0.5;
  const OPT_DIST = 3.1;
  let opt = { x: 0, y: 0 };

  function updateOptimum() {
    const a = (posDeg * Math.PI) / 180;
    opt.x = OPT_DIST * Math.cos(a);
    opt.y = OPT_DIST * Math.sin(a);
  }

  const Lxx = 1.0,
    Lyy = 1.0,
    Lxy = 0.0;
  function lossAt(wx, wy, ox, oy) {
    const dx = wx - ox,
      dy = wy - oy;
    return Lxx * dx * dx + Lyy * dy * dy + 2 * Lxy * dx * dy;
  }
  function radius(lam) {
    return 2.4 - lam * 2.1;
  }

  function solveCore(c, ox, oy) {
    const insideR =
      method === "ridge"
        ? ox * ox + oy * oy <= c * c
        : Math.abs(ox) + Math.abs(oy) <= c;
    if (insideR) return { x: ox, y: oy, onBoundary: false };
    let best = null,
      bestL = Infinity;
    const N = 3000;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      let px, py;
      if (method === "ridge") {
        px = c * Math.cos(t);
        py = c * Math.sin(t);
      } else {
        const cx = Math.cos(t),
          sy = Math.sin(t);
        const k = c / (Math.abs(cx) + Math.abs(sy));
        px = k * cx;
        py = k * sy;
      }
      const l = lossAt(px, py, ox, oy);
      if (l < bestL) {
        bestL = l;
        best = { x: px, y: py };
      }
    }
    best.onBoundary = true;
    return best;
  }
  function solve() {
    const c = radius(lambda);
    const s = solveCore(c, opt.x, opt.y);
    s.c = c;
    return s;
  }

  function ellipsePath(levelL) {
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2;
      const ux = Math.cos(t),
        uy = Math.sin(t);
      const a = Lxx * ux * ux + Lyy * uy * uy + 2 * Lxy * ux * uy;
      const r = Math.sqrt(levelL / a);
      const [px, py] = W2P(opt.x + r * ux, opt.y + r * uy);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return "M" + pts.join(" L") + " Z";
  }

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

  function regionPath(c) {
    if (method === "ridge") {
      const [cx, cy] = W2P(0, 0);
      const r = c * SCALE;
      return `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
    }
    const p1 = W2P(c, 0),
      p2 = W2P(0, c),
      p3 = W2P(-c, 0),
      p4 = W2P(0, -c);
    return `M${p1[0]},${p1[1]} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]} L${p4[0]},${p4[1]} Z`;
  }

  function fmt(v, isZero) {
    if (isZero) return '<span class="zero-flag">0</span>';
    return v.toFixed(2);
  }

  function render() {
    const sol = solve();
    const ell = $(".ellipses");
    ell.innerHTML = "";
    const ellColor = cssvar("--ellipse");
    const rMain = Math.hypot(opt.x - sol.x, opt.y - sol.y);
    const radii = [rMain * 0.5, rMain * 0.75, rMain];
    radii.forEach((rad) => {
      const isMain = Math.abs(rad - rMain) < 1e-6;
      const levelL = rad * rad;
      ell.insertAdjacentHTML(
        "beforeend",
        `<path d="${ellipsePath(levelL)}" fill="none" stroke="${ellColor}" ` +
          `stroke-width="${isMain ? 2.2 : 1}" opacity="${isMain ? 0.95 : 0.32}"/>`,
      );
    });

    const reg = $(".region");
    reg.setAttribute("stroke", cssvar("--region"));
    reg.setAttribute("fill", cssvar("--region"));
    reg.setAttribute("fill-opacity", "0.07");
    const c = sol.c;
    const regPathStr = regionPath(c);
    reg.setAttribute("d", regPathStr);

    $(".clipPath").setAttribute("d", `M0,0 H${SVG} V${SVG} H0 Z ` + regPathStr);

    const [ox, oy] = W2P(opt.x, opt.y);
    const optEl = $(".optimum");
    optEl.setAttribute("cx", ox);
    optEl.setAttribute("cy", oy);
    optEl.setAttribute("fill", cssvar("--optimum"));

    const [sx, sy] = W2P(sol.x, sol.y);
    const solEl = $(".solution");
    solEl.setAttribute("cx", sx);
    solEl.setAttribute("cy", sy);
    solEl.setAttribute("fill", cssvar("--solution"));

    const zx = Math.abs(sol.x) < 0.04,
      zy = Math.abs(sol.y) < 0.04;
    $(".outW1").innerHTML = fmt(sol.x, zx && method === "lasso");
    $(".outW2").innerHTML = fmt(sol.y, zy && method === "lasso");
    const status =
      method === "lasso" && (zx || zy)
        ? '<span class="zero-flag">sparse</span>'
        : "dense";
    $(".status").innerHTML = status;
  }

  function isSparseAt(angleDeg) {
    if (method === "ridge") return false;
    const a = (angleDeg * Math.PI) / 180;
    const rx = OPT_DIST * Math.cos(a),
      ry = OPT_DIST * Math.sin(a);
    const s = solveCore(radius(lambda), rx, ry);
    return Math.abs(s.x) < 0.04 || Math.abs(s.y) < 0.04;
  }

  function drawPathRing() {
    const g = $(".pathring");
    g.innerHTML = "";
    const ringR = OPT_DIST * SCALE;
    const [cx, cy] = W2P(0, 0);
    const step = 2;
    for (let d = 0; d < 360; d += step) {
      const sparse = isSparseAt(d + step / 2);
      const a0 = (-d * Math.PI) / 180;
      const a1 = (-(d + step) * Math.PI) / 180;
      const x0 = cx + ringR * Math.cos(a0),
        y0 = cy + ringR * Math.sin(a0);
      const x1 = cx + ringR * Math.cos(a1),
        y1 = cy + ringR * Math.sin(a1);
      const color = sparse ? "var(--sparse)" : "var(--dense)";
      g.insertAdjacentHTML(
        "beforeend",
        `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} A${ringR.toFixed(2)},${ringR.toFixed(2)} 0 0,0 ${x1.toFixed(2)},${y1.toFixed(2)}" ` +
          `fill="none" stroke="${color}" stroke-width="3" stroke-linecap="butt" opacity="0.85"/>`,
      );
    }
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
    drawPathRing();
    render();
  }

  function setMethod(m) {
    if (method === m) return;
    method = m;
    root.classList.toggle("lasso", m === "lasso");
    $(".mb-ridge").classList.toggle("active", m === "ridge");
    $(".mb-lasso").classList.toggle("active", m === "lasso");
    drawPathRing();
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

  const ridgeBtn = $(".mb-ridge"),
    lassoBtn = $(".mb-lasso");
  const onRidge = () => setMethod("ridge");
  const onLasso = () => setMethod("lasso");
  ridgeBtn.addEventListener("click", onRidge);
  lassoBtn.addEventListener("click", onLasso);

  const posEl = $(".pos"),
    lamEl = $(".lam");
  const onPos = (e) => {
    posDeg = parseFloat(e.target.value);
    $(".posVal").textContent = posDeg.toFixed(0) + "°";
    updateOptimum();
    drawPathRing();
    render();
  };
  const onLam = (e) => {
    lambda = parseFloat(e.target.value);
    $(".lamVal").textContent = lambda.toFixed(2);
    drawPathRing();
    render();
  };
  posEl.addEventListener("input", onPos);
  lamEl.addEventListener("input", onLam);

  $(".posVal").textContent = posDeg.toFixed(0) + "°";
  $(".lamVal").textContent = lambda.toFixed(2);
  updateOptimum();
  applySiteTheme();

  return function cleanup() {
    themeObserver.disconnect();
    if (mql && onMql) {
      if (mql.removeEventListener) mql.removeEventListener("change", onMql);
      else if (mql.removeListener) mql.removeListener(onMql);
    }
    ridgeBtn.removeEventListener("click", onRidge);
    lassoBtn.removeEventListener("click", onLasso);
    posEl.removeEventListener("input", onPos);
    lamEl.removeEventListener("input", onLam);
    container.innerHTML = "";
  };
}

export default { render };
