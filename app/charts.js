// Statline UK — hand-rolled SVG charts. No chart library, no network.
// Every builder takes plain data and returns an SVG string with labelled
// axes, direct value labels and a title baked into the surrounding card.

const Charts = (function () {
  const NAVY = "#14213D", TEAL = "#0E7C7B", AMBER = "#E8A317", SLATE = "#5A6472",
        GRID = "#E3E0D8", LIGHT = "#F1EFEA";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fmt(n, decimals) {
    return n.toLocaleString("en-GB", { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
  }

  function niceMax(values, steps) {
    const m = Math.max.apply(null, values.map(Math.abs));
    if (m === 0) return 1;
    const raw = m / (steps || 4);
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * pow * (steps || 4);
  }

  // Vertical bar chart. points: [{label, value, note?}] — value labels on
  // every bar; negative bars in amber, positive in teal.
  function vbar(points, opts) {
    opts = opts || {};
    const W = opts.width || 560, H = opts.height || 260;
    const padL = 46, padR = 10, padT = 26, padB = 30;
    const values = points.map(function (p) { return p.value; });
    const max = niceMax(values.concat([opts.zeroLine === undefined ? 0 : opts.zeroLine]), 4);
    const min = Math.min(0, Math.min.apply(null, values));
    const span = max - min;
    const iw = W - padL - padR, ih = H - padT - padB;
    const y = function (v) { return padT + ih - ((v - min) / span) * ih; };
    const bw = Math.min(44, (iw / points.length) * 0.62);
    const step = iw / points.length;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(opts.aria || "Bar chart") + '">';
    // gridlines + y labels
    for (let g = 0; g <= 4; g++) {
      const gv = min + (span * g) / 4, gy = y(gv);
      s += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" font-size="12" fill="' + SLATE + '" text-anchor="end">' + fmt(gv, opts.decimals || 0) + (opts.unit || "") + '</text>';
    }
    s += '<line x1="' + padL + '" y1="' + y(0).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y(0).toFixed(1) + '" stroke="' + NAVY + '" stroke-width="1.5"/>';
    points.forEach(function (p, i) {
      const cx = padL + step * i + step / 2;
      const top = y(Math.max(p.value, 0)), bot = y(Math.min(p.value, 0));
      const fill = p.value < 0 ? AMBER : (p.highlight ? NAVY : TEAL);
      s += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, bot - top).toFixed(1) + '" fill="' + fill + '" rx="2"/>';
      if (p.value < 0) {
        // Negative bar: label inside the bar, just below the zero line, in
        // white — a label below the bar would collide with the axis labels.
        s += '<text x="' + cx.toFixed(1) + '" y="' + (top + 17).toFixed(1) + '" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">' + fmt(p.value, opts.decimals || 0) + (opts.unit || "") + '</text>';
      } else {
        s += '<text x="' + cx.toFixed(1) + '" y="' + (top - 7).toFixed(1) + '" font-size="13" font-weight="700" fill="' + NAVY + '" text-anchor="middle">' + (p.value > 0 ? "+" : "") + fmt(p.value, opts.decimals || 0) + (opts.unit || "") + '</text>';
      }
      s += '<text x="' + cx.toFixed(1) + '" y="' + (H - 10) + '" font-size="12" fill="' + SLATE + '" text-anchor="middle">' + esc(p.label) + '</text>';
    });
    return s + '</svg>';
  }

  // Line chart with dots on every point and a labelled last point.
  // points: [{label, value}]. opts.target draws a dashed reference line.
  function line(points, opts) {
    opts = opts || {};
    const W = opts.width || 560, H = opts.height || 260;
    const padL = 46, padR = 54, padT = 26, padB = 30;
    const values = points.map(function (p) { return p.value; });
    let lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
    if (opts.target !== undefined) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
    const pad = (hi - lo) * 0.15 || 1;
    lo -= pad; hi += pad;
    const iw = W - padL - padR, ih = H - padT - padB;
    const x = function (i) { return padL + (iw * i) / (points.length - 1); };
    const y = function (v) { return padT + ih - ((v - lo) / (hi - lo)) * ih; };
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(opts.aria || "Line chart") + '">';
    for (let g = 0; g <= 4; g++) {
      const gv = lo + ((hi - lo) * g) / 4, gy = y(gv);
      s += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" font-size="12" fill="' + SLATE + '" text-anchor="end">' + fmt(gv, opts.decimals === undefined ? 1 : opts.decimals) + (opts.unit || "") + '</text>';
    }
    if (opts.target !== undefined) {
      s += '<line x1="' + padL + '" y1="' + y(opts.target).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y(opts.target).toFixed(1) + '" stroke="' + AMBER + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
      s += '<text x="' + (padL + 4) + '" y="' + (y(opts.target) - 6).toFixed(1) + '" font-size="12" font-weight="700" fill="#8A6400">' + esc(opts.targetLabel || "") + '</text>';
    }
    const d = points.map(function (p, i) { return (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(p.value).toFixed(1); }).join(" ");
    s += '<path d="' + d + '" fill="none" stroke="' + TEAL + '" stroke-width="2.5" stroke-linejoin="round"/>';
    points.forEach(function (p, i) {
      const showLabel = opts.labelEvery ? (i % opts.labelEvery === 0) : (i === points.length - 1);
      s += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.value).toFixed(1) + '" r="3.5" fill="#FAF9F6" stroke="' + TEAL + '" stroke-width="2"/>';
      if (i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) {
        s += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" font-size="12" fill="' + SLATE + '" text-anchor="middle">' + esc(p.label) + '</text>';
      }
      if (showLabel) {
        if (i === 0) {
          // First point: label up and to the right of the dot, so it never
          // collides with the y-axis gridline labels at the left edge.
          s += '<text x="' + (x(i) + 8).toFixed(1) + '" y="' + (y(p.value) - 8).toFixed(1) + '" font-size="13" font-weight="700" fill="' + NAVY + '" text-anchor="start">' + fmt(p.value, opts.decimals === undefined ? 1 : opts.decimals) + (opts.unit || "") + '</text>';
        } else {
          s += '<text x="' + x(i).toFixed(1) + '" y="' + (y(p.value) - 9).toFixed(1) + '" font-size="13" font-weight="700" fill="' + NAVY + '" text-anchor="middle">' + fmt(p.value, opts.decimals === undefined ? 1 : opts.decimals) + (opts.unit || "") + '</text>';
        }
      }
    });
    const last = points[points.length - 1];
    s += '<text x="' + (x(points.length - 1) + 8).toFixed(1) + '" y="' + (y(last.value) + 4).toFixed(1) + '" font-size="12" font-weight="700" fill="' + NAVY + '">' + esc(last.label) + '</text>';
    return s + '</svg>';
  }

  // Horizontal bar chart. rows: [{label, value, display, sub?}]
  function hbar(rows, opts) {
    opts = opts || {};
    const W = opts.width || 560, rowH = opts.rowHeight || 34, padL = opts.labelWidth || 150, padR = 76;
    const padT = opts.reference ? 24 : 8;
    const H = padT + rows.length * rowH + 8;
    const max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    const iw = W - padL - padR;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(opts.aria || "Horizontal bar chart") + '">';
    rows.forEach(function (r, i) {
      const cy = padT + i * rowH + rowH / 2;
      const bw = Math.max(2, (r.value / max) * iw);
      s += '<text x="' + (padL - 8) + '" y="' + (cy + 4).toFixed(1) + '" font-size="13" fill="' + NAVY + '" text-anchor="end">' + esc(r.label) + '</text>';
      s += '<rect x="' + padL + '" y="' + (cy - 9).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="18" fill="' + (r.highlight ? NAVY : TEAL) + '" rx="2"/>';
      s += '<text x="' + (padL + bw + 6).toFixed(1) + '" y="' + (cy + 4).toFixed(1) + '" font-size="13" font-weight="700" fill="' + NAVY + '">' + esc(r.display) + '</text>';
      if (r.sub) {
        s += '<text x="' + (padL + bw + 6).toFixed(1) + '" y="' + (cy + 18).toFixed(1) + '" font-size="11" fill="' + SLATE + '">' + esc(r.sub) + '</text>';
      }
    });
    if (opts.reference) {
      const rx = padL + (opts.reference / max) * iw;
      s += '<line x1="' + rx.toFixed(1) + '" y1="' + padT + '" x2="' + rx.toFixed(1) + '" y2="' + (H - 8) + '" stroke="' + AMBER + '" stroke-width="2" stroke-dasharray="5 4"/>';
      s += '<text x="' + rx.toFixed(1) + '" y="' + (padT - 8) + '" font-size="12" font-weight="700" fill="#8A6400" text-anchor="middle">' + esc(opts.referenceLabel || "") + '</text>';
    }
    return s + '</svg>';
  }

  // Paired bars (two series side by side per group), e.g. men/women.
  function paired(groups, opts) {
    opts = opts || {};
    const W = opts.width || 560, H = opts.height || 240;
    const padL = 110, padR = 30, padT = 26, padB = 8;
    const all = [];
    groups.forEach(function (g) { all.push(g.a, g.b); });
    const max = niceMax(all, 4);
    const min = Math.floor(Math.min.apply(null, all) / 5) * 5;
    const iw = W - padL - padR, ih = H - padT - padB;
    const x = function (v) { return padL + ((v - min) / (max - min)) * iw; };
    const rowH = ih / groups.length;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(opts.aria || "Paired bar chart") + '">';
    for (let g = 0; g <= 4; g++) {
      const gv = min + ((max - min) * g) / 4, gx = x(gv);
      s += '<line x1="' + gx.toFixed(1) + '" y1="' + padT + '" x2="' + gx.toFixed(1) + '" y2="' + (H - padB) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + gx.toFixed(1) + '" y="' + (padT - 8) + '" font-size="12" fill="' + SLATE + '" text-anchor="middle">' + fmt(gv, 0) + '</text>';
    }
    groups.forEach(function (gr, i) {
      const cy = padT + i * rowH + rowH / 2;
      s += '<text x="' + (padL - 8) + '" y="' + (cy + 4).toFixed(1) + '" font-size="13" fill="' + NAVY + '" text-anchor="end">' + esc(gr.label) + '</text>';
      s += '<rect x="' + x(min).toFixed(1) + '" y="' + (cy - 13).toFixed(1) + '" width="' + (x(gr.a) - x(min)).toFixed(1) + '" height="11" fill="' + TEAL + '" rx="2"/>';
      s += '<rect x="' + x(min).toFixed(1) + '" y="' + (cy + 2).toFixed(1) + '" width="' + (x(gr.b) - x(min)).toFixed(1) + '" height="11" fill="' + AMBER + '" rx="2"/>';
      s += '<text x="' + (x(gr.a) + 5).toFixed(1) + '" y="' + (cy - 3).toFixed(1) + '" font-size="12" font-weight="700" fill="' + NAVY + '">' + fmt(gr.a, 1) + '</text>';
      s += '<text x="' + (x(gr.b) + 5).toFixed(1) + '" y="' + (cy + 12).toFixed(1) + '" font-size="12" font-weight="700" fill="' + NAVY + '">' + fmt(gr.b, 1) + '</text>';
    });
    s += '<text x="' + padL + '" y="' + (H - 0) + '" font-size="12" fill="' + TEAL + '">■ ' + esc(opts.labelA || "A") + '</text>';
    s += '<text x="' + (padL + 90) + '" y="' + (H - 0) + '" font-size="12" fill="#8A6400">■ ' + esc(opts.labelB || "B") + '</text>';
    return s + '</svg>';
  }

  // Simple HTML data table from headers + rows (arrays of strings).
  function dataTable(headers, rows, caption) {
    let s = '<div class="tablewrap"><table><caption>' + esc(caption || "") + '</caption><thead><tr>';
    headers.forEach(function (h) { s += '<th scope="col">' + esc(h) + '</th>'; });
    s += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      s += '<tr>';
      r.forEach(function (c, i) { s += i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; });
      s += '</tr>';
    });
    return s + '</tbody></table></div>';
  }

  return { vbar: vbar, line: line, hbar: hbar, paired: paired, dataTable: dataTable, fmt: fmt, esc: esc };
})();
