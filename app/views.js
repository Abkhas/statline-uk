// Statline UK — page renderers. One function per route; every page is built
// from STATLINE (data.js) and Charts (charts.js). Chart cards carry a
// chart/table toggle and, where the data allows it, a period toggle that
// re-renders the chart from the same data.

const Views = (function () {
  const D = STATLINE;

  function esc(s) { return Charts.esc(s); }
  function fmt(n, d) { return Charts.fmt(n, d); }
  function money(n, decimals) { return "£" + fmt(n, decimals === undefined ? 2 : decimals); }
  function src(t) { return '<p class="source">' + esc(t) + '</p>'; }

  // A KPI tile: big number, change line, period, source.
  function kpiTile(k) {
    return '<div class="kpi"><div class="kpi-label">' + esc(k.label) + '</div>' +
      '<div class="kpi-value">' + esc(k.value) + '</div>' +
      '<div class="kpi-detail">' + esc(k.detail) + '</div>' +
      '<div class="kpi-change">' + esc(k.change) + '</div>' +
      '<div class="kpi-note">' + esc(k.changeNote) + '</div>' +
      '<div class="kpi-source">' + esc(k.source) + '</div></div>';
  }

  // Chart card shell. bodyId is the registry key main.js uses to swap the
  // chart for its table and to re-render on period/unit changes.
  function chartCard(bodyId, title, takeaway, bodyHtml, sourceText, controlsHtml) {
    return '<section class="card" aria-label="' + esc(title) + '">' +
      '<h3 class="chart-title">' + esc(title) + '</h3>' +
      '<p class="takeaway">' + takeaway + '</p>' +
      (controlsHtml || "") +
      '<div data-chart-body="' + bodyId + '">' + bodyHtml + '</div>' +
      '<div class="toggle-row"><button type="button" class="btn linklike" data-toggle="' + bodyId + '">View as table</button></div>' +
      src(sourceText) + '</section>';
  }

  function periodControls(bodyId, options, current) {
    let s = '<div class="controls"><span class="ctl-label">Period:</span>';
    options.forEach(function (o) {
      s += '<button type="button" class="btn" data-period-for="' + bodyId + '" data-range="' + o.key + '" aria-pressed="' + (o.key === current) + '">' + esc(o.label) + '</button>';
    });
    return s + '</div>';
  }

  function unitControls(bodyId, current) {
    return '<div class="controls"><span class="ctl-label">Show pay as:</span>' +
      '<button type="button" class="btn" data-unit-for="' + bodyId + '" data-unit="week" aria-pressed="' + (current === "week") + '">£ per week</button>' +
      '<button type="button" class="btn" data-unit-for="' + bodyId + '" data-unit="hour" aria-pressed="' + (current === "hour") + '">£ per hour</button>' +
      '<button type="button" class="btn" data-unit-for="' + bodyId + '" data-unit="year" aria-pressed="' + (current === "year") + '">£ per year</button></div>';
  }

  // ---- Chart builders: each returns {chart, table} for a card id. ----
  // main.js calls these on period/unit changes; the first call builds the
  // card's initial content too.

  function gdpAnnual(range, height) {
    const pts = D.gdp.annualGrowth.filter(function (p) { return range === "5y" ? p.year >= 2021 : true; })
      .map(function (p) { return { label: String(p.year), value: p.growth, highlight: p.year === 2025 }; });
    const chart = Charts.vbar(pts, { unit: "%", decimals: 1, height: height || 260, aria: "Real GDP growth by year, percent" });
    const table = Charts.dataTable(["Year", "Real GDP growth"],
      D.gdp.annualGrowth.map(function (p) { return [String(p.year), (p.growth > 0 ? "+" : "") + p.growth.toFixed(1) + "%"]; }),
      "Real GDP growth, year on year. 2020 is the pandemic contraction; 2021 the rebound.");
    return { chart: chart, table: table };
  }

  function cpihLine(range, height) {
    const pts = D.prices.monthly.filter(function (p, i) { return range === "12m" ? i >= 12 : true; })
      .map(function (p) { return { label: p.m, value: p.v }; });
    const chart = Charts.line(pts, { unit: "%", decimals: 1, height: height || 260, target: D.prices.target, targetLabel: "Bank target 2%",
      aria: "CPIH 12-month inflation rate by month, percent" });
    const table = Charts.dataTable(["Month", "CPIH 12-month rate"],
      D.prices.monthly.map(function (p) { return [p.m, p.v.toFixed(1) + "%"]; }),
      "CPIH 12-month rate, monthly. October 2026: 3.7%.");
    return { chart: chart, table: table };
  }

  function gdpQuarterly(range, height) {
    const pts = D.gdp.quarterly.filter(function (p) { return range === "2026" ? p.q.indexOf("2026") !== -1 : true; })
      .map(function (p) { return { label: p.q, value: p.growth }; });
    const chart = Charts.line(pts, { unit: "%", decimals: 1, height: height || 260, labelEvery: 1,
      aria: "Real GDP growth by quarter, percent on previous quarter" });
    const table = Charts.dataTable(["Quarter", "Real GDP growth (on previous quarter)"],
      D.gdp.quarterly.map(function (p) { return [p.q, (p.growth > 0 ? "+" : "") + p.growth.toFixed(1) + "%"]; }),
      "Real GDP, quarter on quarter. Q3 2026: +0.7%; 1.9% higher than a year earlier.");
    return { chart: chart, table: table };
  }

  function populationLine(range) {
    const pts = D.population.series.filter(function (p) { return range === "6y" ? p.year >= 2020 : true; })
      .map(function (p) { return { label: String(p.year), value: p.value / 1000000 }; });
    const chart = Charts.line(pts, { unit: "m", decimals: 1, labelEvery: 2,
      aria: "UK population at mid-year, millions" });
    const table = Charts.dataTable(["Mid-year", "Population"],
      D.population.series.map(function (p) { return [String(p.year), fmt(p.value)]; }),
      "UK population at mid-year. ONS headline rounds the 2025 figure to 69,483,900.");
    return { chart: chart, table: table };
  }

  function nationsBars() {
    const rows = D.population.nations.map(function (n) {
      return { label: n.name, value: n.pop, display: (n.pop / 1000000).toFixed(1) + "m", sub: n.share.toFixed(1) + "% of UK" };
    });
    const chart = Charts.hbar(rows, { labelWidth: 150, aria: "Population by nation, mid-2025" });
    const table = Charts.dataTable(["Nation", "Population (mid-2025)", "Change on mid-2024", "Share of UK"],
      D.population.nations.map(function (n) {
        return [n.name, fmt(n.pop), (n.change >= 0 ? "+" : "") + fmt(n.change) + " (" + (n.changePct >= 0 ? "+" : "") + n.changePct.toFixed(2) + "%)", n.share.toFixed(1) + "%"];
      }), "Population by nation, mid-2025.");
    return { chart: chart, table: table };
  }

  function lifeExpectancyBars() {
    const groups = D.lifeExpectancy.byNation.map(function (n) { return { label: n.nation, a: n.men, b: n.women }; });
    const chart = Charts.paired(groups, { labelA: "Men", labelB: "Women", aria: "Life expectancy at birth by nation, years" });
    const table = Charts.dataTable(["Nation", "Men", "Women"],
      D.lifeExpectancy.byNation.map(function (n) { return [n.nation, n.men.toFixed(1) + " years", n.women.toFixed(1) + " years"]; }),
      "Life expectancy at birth, 2022–24. UK: men 79.2 years, women 83.0 years.");
    return { chart: chart, table: table };
  }

  function unemploymentLine(range) {
    const pts = D.work.unemploymentSeries.filter(function (p) { return range === "2y" ? p.q.indexOf("2025") !== -1 || p.q.indexOf("2026") !== -1 : true; })
      .map(function (p) { return { label: p.q, value: p.v }; });
    const chart = Charts.line(pts, { unit: "%", decimals: 1, labelEvery: 2,
      aria: "Unemployment rate by quarter, percent" });
    const table = Charts.dataTable(["Quarter", "Unemployment rate (aged 16+)"],
      D.work.unemploymentSeries.map(function (p) { return [p.q, p.v.toFixed(1) + "%"]; }),
      "Unemployment rate, seasonally adjusted. Jul–Sep 2026: 4.6%.");
    return { chart: chart, table: table };
  }

  function payBars(unit) {
    unit = unit || "week";
    function convert(w) {
      if (unit === "hour") return w / 37.5;
      if (unit === "year") return w * 52;
      return w;
    }
    function unitLabel() { return unit === "hour" ? "£ per hour" : unit === "year" ? "£ per year" : "£ per week"; }
    const rows = D.work.payByRegion.map(function (r) {
      return { label: r.region, value: convert(r.weekly), display: money(convert(r.weekly)), highlight: r.region === "London" };
    });
    const chart = Charts.hbar(rows, { labelWidth: 168, reference: convert(D.work.pay.weekly), referenceLabel: "UK £" + fmt(convert(D.work.pay.weekly), unit === "week" ? 2 : 0),
      aria: "Median full-time weekly pay by region, pounds" });
    const table = Charts.dataTable(["Region", "Median pay (" + unitLabel() + ")", "Difference from UK median"],
      D.work.payByRegion.map(function (r) {
        const d = convert(r.weekly) - convert(D.work.pay.weekly);
        return [r.region, money(convert(r.weekly)), (d >= 0 ? "+" : "−") + money(Math.abs(d)).slice(1)];
      }), "Median gross weekly pay, full-time employee jobs, April 2025. Hourly = weekly ÷ 37.5 hours; yearly = weekly × 52.");
    return { chart: chart, table: table };
  }

  // Registry main.js uses to rebuild a card after a control change.
  const ChartBuilders = {
    "home-gdp": function (range) { return gdpAnnual(range || "7y", 200); },
    "home-cpih": function (range) { return cpihLine(range || "24m", 200); },
    "home-nations": function () { return nationsBars(); },
    "economy-gdp": function (range) { return gdpAnnual(range || "7y", 210); },
    "economy-quarterly": function (range) { return gdpQuarterly(range || "all", 210); },
    "people-pop": function (range) { return populationLine(range || "11y"); },
    "people-nations": function () { return nationsBars(); },
    "people-life": function () { return lifeExpectancyBars(); },
    "work-unemp": function (range) { return unemploymentLine(range || "all"); },
    "work-pay": function (range, unit) { return payBars(unit || "week"); },
    "prices-cpih": function (range) { return cpihLine(range || "24m"); },
    "regions-nations": function () { return nationsBars(); }
  };

  function cardFromBuilder(bodyId, title, takeaway, sourceText, controlsHtml, range, unit) {
    const built = ChartBuilders[bodyId](range, unit);
    return chartCard(bodyId, title, takeaway, built.chart, sourceText, controlsHtml);
  }

  // ---- Pages ----

  function home() {
    const gdp = ChartBuilders["home-gdp"]("7y");
    const cpih = ChartBuilders["home-cpih"]("24m");
    const nations = ChartBuilders["home-nations"]();
    const topics = [
      { route: "#/economy", title: "Economy", big: "GDP +1.2% in 2025", text: "Growth, GDP per head and the latest quarter, with the annual record back to 2019." },
      { route: "#/people", title: "People", big: "69.5 million", text: "Population by nation, births, deaths, migration and life expectancy." },
      { route: "#/work", title: "Work & pay", big: "£766.60 a week", text: "Employment, unemployment and median pay in every region." },
      { route: "#/prices", title: "Prices", big: "CPIH 3.7%", text: "Inflation month by month, what is driving it, and pay in real terms." },
      { route: "#/regions", title: "Nations & regions", big: "12 regions compared", text: "Sortable tables and a tile map of pay and population across the UK." },
      { route: "#/releases", title: "Latest releases", big: "10 ONS releases", text: "Every bulletin behind the figures on this site, dated and linked to its section." }
    ];
    let s = '<section class="hero"><h1>The UK in numbers</h1>' +
      '<p class="standfirst">Population, the economy, work and prices — from the latest ONS releases, in one place.</p>' +
      '<p class="updated"><strong>Updated ' + esc(D.site.updated) + '.</strong> ' + esc(D.site.note) + '</p></section>';
    s += '<div class="kpi-grid">' + D.kpis.map(kpiTile).join("") + '</div>';
    s += '<div class="grid-2">' +
      chartCard("home-gdp", "GDP grew 1.2% in 2025 — the fastest since 2022",
        "<strong>Real GDP rose 1.2% in 2025</strong>, after 1.1% in 2024.",
        gdp.chart, D.gdp.source, periodControls("home-gdp", [{ key: "7y", label: "2019–2025" }, { key: "5y", label: "2021–2025" }], "7y")) +
      chartCard("home-cpih", "Inflation is 3.7% — above the Bank of England’s 2% target",
        "<strong>CPIH rose 3.7%</strong> in the year to Oct 2026, up from 3.6% in Sep.",
        cpih.chart, D.prices.source, periodControls("home-cpih", [{ key: "24m", label: "24 months" }, { key: "12m", label: "12 months" }], "24m")) +
      '</div>';
    s += '<div class="grid-2">' +
      chartCard("home-nations", "England holds 84.7% of the UK’s people",
        "<strong>58.8 million people live in England</strong>; Scotland 5.5m, Wales 3.2m, Northern Ireland 1.9m (mid-2025).",
        nations.chart, D.population.sourceNations, "") +
      '<section class="card" aria-label="Latest releases"><h3 class="chart-title">Latest releases</h3>' +
      '<p class="takeaway">The newest ONS bulletins behind the figures above.</p><ul class="release-list">' +
      D.releases.slice(0, 5).map(function (r) {
        return '<li><span class="release-date">' + esc(r.date) + '</span><br><a href="' + r.route + '">' + esc(r.title) + '</a><p>' + esc(r.what) + '</p></li>';
      }).join("") + '</ul><p class="source"><a href="#/releases">All 10 releases →</a></p></section></div>';
    s += '<section class="card" aria-label="Find an indicator"><h3 class="chart-title">Find an indicator</h3>' +
      '<p class="takeaway">Search the figures on this site — the list filters as you type.</p>' +
      '<label for="indicator-search" class="ctl-label" style="position:absolute;left:-9999px">Search indicators</label>' +
      '<input id="indicator-search" class="search-box" type="search" placeholder="Try “pay”, “inflation” or “migration”…" autocomplete="off">' +
      '<ul class="indicator-list" id="indicator-list">' +
      D.indicators.map(function (ind) {
        return '<li><a href="' + ind.route + '">' + esc(ind.name) + '</a> — <span class="val">' + esc(ind.value) + '</span></li>';
      }).join("") + '</ul>' +
      '<p class="search-count" id="search-count">Showing all ' + D.indicators.length + ' indicators.</p></section>';
    s += '<section class="section"><div class="section-head"><h2>Explore by topic</h2></div><div class="topic-grid">' +
      topics.map(function (t) {
        return '<a class="topic-card" href="' + t.route + '"><h3>' + esc(t.title) + ' <span class="arrow">→</span></h3><div class="big">' + esc(t.big) + '</div><p>' + esc(t.text) + '</p></a>';
      }).join("") + '</div></section>';
    return s;
  }

  function economy() {
    const gdp = ChartBuilders["economy-gdp"]("7y");
    const q = ChartBuilders["economy-quarterly"]("all");
    let s = '<section class="hero"><h1>Economy</h1>' +
      '<p class="lede">How big the UK economy is, how fast it is growing, and what happened quarter by quarter.</p>' +
      '<p class="updated"><strong>Latest:</strong> GDP grew 0.7% in Q3 2026 (Jul–Sep) and is 1.9% higher than a year earlier.</p></section>';
    s += '<div class="grid-3">' +
      '<div class="card"><h3>GDP, nominal</h3><div class="kpi-value">£3.03tn</div><p>£3,035 billion in 2025; nominal growth +4.8% on 2024.</p></div>' +
      '<div class="card"><h3>Real growth, 2025</h3><div class="kpi-value">+1.2%</div><p>After +1.1% in 2024 and +0.4% in 2023. Real GDP per head rose 0.9% in 2025.</p></div>' +
      '<div class="card"><h3>Latest quarter</h3><div class="kpi-value">+0.7%</div><p>Q3 2026 on Q2 2026. Monthly: Sep +0.2%, Aug 0.0%, Jul +0.4%.</p></div></div>' +
      src(D.gdp.source);
    s += '<div class="grid-2">' +
      chartCard("economy-gdp", "GDP grew 1.2% in 2025 — the fastest since 2022",
        "Annual real GDP growth. <strong>2020 fell 10.4%</strong> in the pandemic; 2021 rebounded 8.7%.",
        gdp.chart, D.gdp.source, periodControls("economy-gdp", [{ key: "7y", label: "2019–2025" }, { key: "5y", label: "2021–2025" }], "7y")) +
      chartCard("economy-quarterly", "Growth picked up through 2026",
        "Quarterly real GDP growth. <strong>Q3 2026: +0.7%</strong>, after +0.5% in Q2 and +0.6% in Q1.",
        q.chart, D.gdp.source, periodControls("economy-quarterly", [{ key: "all", label: "Q1 2025 – Q3 2026" }, { key: "2026", label: "2026 only" }], "all")) +
      '</div>';
    s += '<div class="callout"><p><strong>What this means.</strong> The economy is growing again after a flat 2025 — four of the last seven quarters grew, none shrank. But growth is modest: 1.2% a year is well below the 2021–22 rebound, and GDP per head (output per person) rose only 0.9% in 2025, so living standards improved more slowly than headline GDP.</p>' +
      '<p>' + esc(D.gdp.latestQuarter.sectors) + ' — services did the growing in Q3 2026, while construction fell 0.7%.</p></div>';
    s += '<section class="card"><h3 class="chart-title">The annual record</h3>' +
      '<p class="takeaway">Real GDP growth by year, with what drove each year.</p>' +
      Charts.dataTable(["Year", "Real GDP growth", "What happened"], [
        ["2019", "+1.6%", "Steady growth before the pandemic"],
        ["2020", "−10.4%", "Pandemic contraction — the deepest in the series"],
        ["2021", "+8.7%", "Rebound as restrictions lifted"],
        ["2022", "+4.3%", "Recovery continued; energy prices surged"],
        ["2023", "+0.4%", "Near-flat year as high prices bit"],
        ["2024", "+1.1%", "Growth resumed"],
        ["2025", "+1.2%", "Fastest since 2022; nominal GDP £3,035 billion"]
      ], "Real GDP growth, year on year.") + src(D.gdp.source) + '</section>';
    return s;
  }

  function people() {
    const pop = ChartBuilders["people-pop"]("11y");
    const nations = ChartBuilders["people-nations"]();
    const life = ChartBuilders["people-life"]();
    let s = '<section class="hero"><h1>People &amp; population</h1>' +
      '<p class="lede">How many people live in the UK, where they live, and how the population is changing.</p>' +
      '<p class="updated"><strong>Headline:</strong> 69,483,900 people at mid-2025 — growth slowed to 0.3%, the lowest since mid-2020.</p></section>';
    s += '<div class="kpi-grid cols-4">' +
      '<div class="kpi"><div class="kpi-label">UK population</div><div class="kpi-value">69.5m</div><div class="kpi-detail">69,483,900 at mid-2025</div><div class="kpi-change">▲ up 0.3%</div><div class="kpi-note">+227,700 on mid-2024</div><div class="kpi-source">' + esc(D.population.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Median age</div><div class="kpi-value">40.9</div><div class="kpi-detail">Years at mid-2025</div><div class="kpi-change">Oldest: Wales 43.2</div><div class="kpi-note">Youngest: England and N. Ireland 40.6</div><div class="kpi-source">' + esc(D.population.sourceNations) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Births</div><div class="kpi-value">652,400</div><div class="kpi-detail">Year to mid-2025</div><div class="kpi-change">▼ down 9,700</div><div class="kpi-note">On the year to mid-2024; lowest in the series shown</div><div class="kpi-source">' + esc(D.population.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Deaths</div><div class="kpi-value">647,500</div><div class="kpi-detail">Year to mid-2025</div><div class="kpi-change">▲ up 1,600</div><div class="kpi-note">On the year to mid-2024; natural change +4,900</div><div class="kpi-source">' + esc(D.population.source) + '</div></div></div>';
    s += '<section class="card"><h3 class="chart-title">What changed the population in the year to mid-2025</h3>' +
      '<p class="takeaway">Births barely outnumbered deaths — <strong>almost all of the growth came from migration</strong>.</p>' +
      '<div class="flow">' +
      D.population.components.map(function (c) {
        var signed = c.label === "Net migration and other changes" || c.label === "Total change";
        return '<div class="flow-item"><div class="flow-num">' + (signed ? (c.value >= 0 ? "+" : "−") : "") + fmt(Math.abs(c.value)) + '</div><div class="flow-label">' + esc(c.label) + '</div><div class="flow-note">' + esc(c.note) + '</div></div>';
      }).join("") + '</div>' + src(D.population.source) + '</section>';
    s += '<div class="grid-2">' +
      chartCard("people-pop", "The UK has grown every year since 1982 — but growth is slowing",
        "UK population at mid-year. <strong>Growth peaked at +908,000 in the year to mid-2023</strong>, then fell to +228,000 by mid-2025.",
        pop.chart, D.population.source, periodControls("people-pop", [{ key: "11y", label: "2015–2025" }, { key: "6y", label: "2020–2025" }], "11y")) +
      chartCard("people-nations", "England holds 84.7% of the UK’s people",
        "<strong>England grew 0.4%</strong> in the year to mid-2025; Wales shrank slightly (−0.1%), Scotland and Northern Ireland were near flat.",
        nations.chart, D.population.sourceNations, "") +
      '</div>';
    s += '<div class="grid-2">' +
      chartCard("people-life", "Women live about four years longer than men",
        "Life expectancy at birth, 2022–24. <strong>Scotland is lowest</strong> (men 77.2, women 81.1); England highest (79.5 and 83.3).",
        life.chart, D.lifeExpectancy.source, "") +
      '<section class="card"><h3 class="chart-title">Healthy years, not just long lives</h3>' +
      '<p class="takeaway">How much of life is spent in good health.</p>' +
      '<p><strong>Healthy life expectancy at birth (2022–24):</strong> men 60.7 years, women 60.9 years. That leaves roughly 18 years of life in poorer health for men and 22 for women.</p>' +
      '<p>The gap between living longer and living well is why the ONS publishes healthy life expectancy alongside the headline figure.</p>' +
      '<div class="callout"><p><strong>Looking ahead.</strong> ' + esc(D.population.projection.note) + ' The UK population is projected to peak at ' + esc(D.population.projection.peak) + ' in ' + esc(D.population.projection.peakYear) + ', then fall to ' + esc(D.population.projection.later) + '.</p></div>' +
      src(D.lifeExpectancy.source) + '</section></div>';
    return s;
  }

  function work() {
    const unemp = ChartBuilders["work-unemp"]("all");
    const pay = ChartBuilders["work-pay"](null, "week");
    const ft = D.work.pay, pt = ft.partTimeWeekly;
    let s = '<section class="hero"><h1>Work &amp; pay</h1>' +
      '<p class="lede">Who has a job, who is looking for one, and what the typical worker earns — in every region.</p>' +
      '<p class="updated"><strong>Latest:</strong> 34.62 million people in work; 1.68 million unemployed; 690,000 vacancies.</p></section>';
    s += '<div class="kpi-grid cols-4">' +
      '<div class="kpi"><div class="kpi-label">Employment rate</div><div class="kpi-value">75.4%</div><div class="kpi-detail">Aged 16–64, seasonally adjusted</div><div class="kpi-change">▲ up 0.4pp</div><div class="kpi-note">On Jul–Sep 2025 (75.1%)</div><div class="kpi-source">' + esc(D.work.sourceLabour) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Unemployment rate</div><div class="kpi-value">4.6%</div><div class="kpi-detail">Aged 16+, seasonally adjusted</div><div class="kpi-change">▼ down 0.3pp</div><div class="kpi-note">On Jul–Sep 2025 (5.0%)</div><div class="kpi-source">' + esc(D.work.sourceLabour) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Job vacancies</div><div class="kpi-value">690,000</div><div class="kpi-detail">Aug–Oct 2026</div><div class="kpi-change">▼ down 22,000</div><div class="kpi-note">On May–Jul 2026; 2.4 unemployed people per vacancy</div><div class="kpi-source">' + esc(D.work.sourceLabour) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Median full-time pay</div><div class="kpi-value">£766.60</div><div class="kpi-detail">Per week, before tax (Apr 2025)</div><div class="kpi-change">▲ up 5.3%</div><div class="kpi-note">On Apr 2024; +1.1% after inflation (CPIH)</div><div class="kpi-source">' + esc(D.work.pay.source) + '</div></div></div>';
    s += '<div class="grid-2">' +
      chartCard("work-unemp", "Unemployment peaked at 5.2% — then fell to 4.6%",
        "Unemployment rate by quarter. <strong>It rose through 2025</strong> to 5.2% in Oct–Dec, then fell in every quarter of 2026.",
        unemp.chart, D.work.sourceLabour, periodControls("work-unemp", [{ key: "all", label: "2023–2026" }, { key: "2y", label: "2025–2026" }], "all")) +
      chartCard("work-pay", "London pay is 40% above the North East",
        "Median full-time weekly pay by region, April 2025. <strong>London £958.20</strong> tops the list; the <strong>North East £681.20</strong> is lowest. The dashed line is the UK median, £766.60.",
        pay.chart, D.work.sourcePayRegion, unitControls("work-pay", "week")) +
      '</div>';
    s += '<div class="grid-2">' +
      '<div class="card"><h3 class="chart-title">Full-time vs part-time</h3>' +
      '<p class="takeaway">The median part-time worker earns little more than a third of the full-time median.</p>' +
      '<p><strong>Full-time:</strong> ' + money(ft.weekly) + ' a week · ' + money(ft.hourly) + ' an hour · ' + money(ft.annual, 0) + ' a year.</p>' +
      '<p><strong>Part-time:</strong> ' + money(pt) + ' a week — ' + (100 * pt / ft.weekly).toFixed(1) + '% of the full-time weekly median.</p>' +
      '<p>Median pay is the middle earner: half earn more, half earn less. It is not the average, which is pulled up by very high earners.</p>' + src(D.work.pay.source) + '</div>' +
      '<div class="card"><h3 class="chart-title">Young workers have it hardest</h3>' +
      '<p class="takeaway">Unemployment among 16- to 24-year-olds is more than three times the overall rate.</p>' +
      '<p><strong>Youth unemployment: ' + D.work.youthUnemployment.toFixed(1) + '%</strong> in Jul–Sep 2026 — about 688,000 young people — against 4.6% overall.</p>' +
      '<p>Economic inactivity (people neither working nor looking) stands at ' + D.work.inactivity.toFixed(1) + '% of 16- to 64-year-olds, ' + esc(D.work.inactivityNote.split(",")[0]) + '.</p>' + src(D.work.sourceLabour) + '</div></div>';
    return s;
  }

  function prices() {
    const cpih = ChartBuilders["prices-cpih"]("24m");
    let s = '<section class="hero"><h1>Prices &amp; living costs</h1>' +
      '<p class="lede">How fast prices are rising, what is driving it, and whether pay is keeping up.</p>' +
      '<p class="updated"><strong>Latest:</strong> CPIH 3.7% in the year to October 2026; CPI 3.6%.</p></section>';
    s += '<div class="kpi-grid cols-5">' +
      '<div class="kpi"><div class="kpi-label">CPIH</div><div class="kpi-value">3.7%</div><div class="kpi-detail">12-month rate, Oct 2026</div><div class="kpi-change">▲ up 0.1pp</div><div class="kpi-note">On Sep 2026 (3.6%)</div><div class="kpi-source">' + esc(D.prices.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">CPI</div><div class="kpi-value">3.6%</div><div class="kpi-detail">12-month rate, Oct 2026</div><div class="kpi-change">▲ up 0.1pp</div><div class="kpi-note">On Sep 2026 (3.5%)</div><div class="kpi-source">' + esc(D.prices.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Core CPIH</div><div class="kpi-value">3.1%</div><div class="kpi-detail">Excluding energy, food, alcohol, tobacco</div><div class="kpi-change">Little changed</div><div class="kpi-note">On Sep 2026</div><div class="kpi-source">' + esc(D.prices.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Goods</div><div class="kpi-value">3.5%</div><div class="kpi-detail">CPIH goods, 12-month rate</div><div class="kpi-change">▲ up 0.3pp</div><div class="kpi-note">On Sep 2026 (3.2%)</div><div class="kpi-source">' + esc(D.prices.source) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Services</div><div class="kpi-value">3.9%</div><div class="kpi-detail">CPIH services, 12-month rate</div><div class="kpi-change">Little changed</div><div class="kpi-note">On Sep 2026</div><div class="kpi-source">' + esc(D.prices.source) + '</div></div></div>';
    s += chartCard("prices-cpih", "Inflation fell to 2.8% in June 2026 — then climbed back to 3.7%",
      "CPIH 12-month rate, monthly. <strong>October 2026: 3.7%</strong>. The dashed line is the Bank of England’s 2% CPI target.",
      cpih.chart, D.prices.source, periodControls("prices-cpih", [{ key: "24m", label: "24 months" }, { key: "12m", label: "12 months" }], "24m"));
    s += '<div class="grid-2">' +
      '<div class="card"><h3 class="chart-title">What pushed prices up in October</h3>' +
      '<p class="takeaway">The drivers behind the latest rise.</p><p>' + esc(D.prices.drivers) + '</p>' +
      '<p>On a monthly basis, CPIH rose 0.5% in October 2026, against 0.4% in October 2025.</p>' + src(D.prices.source) + '</div>' +
      '<div class="card"><h3 class="chart-title">Is pay keeping up?</h3>' +
      '<p class="takeaway">Just about — in real terms, pay rose slightly.</p>' +
      '<p>Median full-time weekly pay rose <strong>5.3% in cash terms</strong> to April 2025, which is <strong>+1.1% after inflation</strong> (CPIH). So the typical full-time worker could buy slightly more than a year earlier.</p>' +
      '<p>But with CPIH at 3.7% in October 2026, pay growth would need to stay above that rate for real pay to keep rising.</p>' + src(D.work.pay.source) + '</div></div>' +
      '<div class="callout"><p><strong>CPIH vs CPI.</strong> CPIH is the ONS’s lead measure: it is CPI plus owner occupiers’ housing costs (what it costs to own and live in a home) and council tax. CPI excludes those, which is why the two differ — CPIH 3.7% against CPI 3.6% in October 2026. The Bank of England’s 2% target is set on CPI.</p></div>';
    return s;
  }

  function regions() {
    const le = {};
    D.lifeExpectancy.byNation.forEach(function (n) { le[n.nation] = n; });
    const payByName = {};
    D.work.payByRegion.forEach(function (r) { payByName[r.region] = r.weekly; });
    // Nations table: every column has a real value for every row.
    const nationRows = D.population.nations.map(function (n) {
      const l = le[n.name];
      const pay = n.name === "England" ? D.work.englandPay : payByName[n.name];
      return { name: n.name, pop: n.pop, change: n.change, share: n.share, age: n.medianAge, pay: pay, leM: l.men, leW: l.women };
    });
    const engRegions = D.work.payByRegion; // all 12 regions and nations, ranked 1–12
    // Tile map: 12 tiles (9 English regions + 3 other nations), coloured by pay band.
    const tilePos = {
      "Scotland": "1 / 3", "North East": "2 / 2", "North West": "2 / 3", "Yorkshire and the Humber": "2 / 4",
      "Northern Ireland": "2 / 1", "Wales": "3 / 2", "West Midlands": "3 / 3", "East Midlands": "3 / 4", "East": "3 / 5",
      "South West": "4 / 2", "London": "4 / 3", "South East": "4 / 4"
    };
    function tileClass(w) {
      if (w >= 900) return "navy";
      if (w >= 760) return "teal";
      if (w >= 700) return "slate";
      return "amber";
    }
    let s = '<section class="hero"><h1>Nations &amp; regions</h1>' +
      '<p class="lede">The four nations and the nine English regions, compared side by side. Click any column heading to sort.</p></section>';
    s += '<section class="card"><h3 class="chart-title">The four nations</h3>' +
      '<p class="takeaway">Population at mid-2025, median age, median full-time pay (April 2025) and life expectancy (2022–24).</p>' +
      '<div class="tablewrap"><table id="nations-table"><caption>All figures from the ONS releases cited below the table.</caption><thead><tr>' +
      '<th scope="col" class="sortable" data-sort="name">Nation</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Population</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Change on year</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Share of UK</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Median age</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Median pay / week</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Life expectancy M / W</th>' +
      '</tr></thead><tbody>' +
      nationRows.map(function (r) {
        return '<tr><th scope="row">' + esc(r.name) + '</th><td class="num">' + fmt(r.pop) + '</td><td class="num">' + (r.change >= 0 ? "+" : "−") + fmt(Math.abs(r.change)) + '</td><td class="num">' + r.share.toFixed(1) + '%</td><td class="num">' + r.age.toFixed(1) + '</td><td class="num">' + money(r.pay) + '</td><td class="num">' + r.leM.toFixed(1) + ' / ' + r.leW.toFixed(1) + ' yrs</td></tr>';
      }).join("") +
      '<tr class="uk-row"><th scope="row">United Kingdom</th><td class="num">69,483,900</td><td class="num">+227,700</td><td class="num">100%</td><td class="num">40.9</td><td class="num">£766.60</td><td class="num">79.2 / 83.0 yrs</td></tr>' +
      '</tbody></table></div>' +
      src(D.population.sourceNations + "; pay: " + D.work.sourcePayRegion.replace(/^Source: /, "") + "; life expectancy: " + D.lifeExpectancy.source.replace(/^Source: /, "")) + '</section>';
    s += '<section class="card"><h3 class="chart-title">All regions — median pay</h3>' +
      '<p class="takeaway">Median gross weekly pay for full-time jobs, April 2025, for the nine English regions and the three other nations. Click a heading to sort.</p>' +
      '<div class="tablewrap"><table id="regions-table"><caption>Workplace-based ASHE figures; the UK median is £766.60 a week.</caption><thead><tr>' +
      '<th scope="col" class="sortable" data-sort="name">Region or nation</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Median pay / week</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Vs UK median</th>' +
      '<th scope="col" class="sortable num" data-sort="num">Rank (of 12)</th>' +
      '</tr></thead><tbody>' +
      engRegions.map(function (r) {
        const d = r.weekly - D.work.pay.weekly;
        const rank = D.work.payByRegion.findIndex(function (x) { return x.region === r.region; }) + 1;
        return '<tr><th scope="row">' + esc(r.region) + '</th><td class="num">' + money(r.weekly) + '</td><td class="num">' + (d >= 0 ? "+" : "−") + money(Math.abs(d)).slice(1) + '</td><td class="num">' + rank + '</td></tr>';
      }).join("") + '</tbody></table></div>' + src(D.work.sourcePayRegion) + '</section>';
    s += '<section class="card"><h3 class="chart-title">Tile map — median weekly pay by region</h3>' +
      '<p class="takeaway">Each tile is a region, placed roughly where it sits on the map. Darker tiles earn more.</p>' +
      '<div class="tilemap">' +
      D.work.payByRegion.map(function (r) {
        return '<div class="tile ' + tileClass(r.weekly) + '" style="grid-row:' + tilePos[r.region].split(" / ")[0] + ';grid-column:' + tilePos[r.region].split(" / ")[1] + '"><span class="t-name">' + esc(r.region) + '</span><span class="t-val">' + money(r.weekly) + '</span></div>';
      }).join("") + '</div>' +
      '<p class="tile-legend"><span class="swatch" style="background:#14213D"></span> £900+ &nbsp; <span class="swatch" style="background:#0E7C7B"></span> £760–£899 &nbsp; <span class="swatch" style="background:#5A6472"></span> £700–£759 &nbsp; <span class="swatch" style="background:#E8A317"></span> under £700 — median full-time weekly pay, April 2025.</p>' +
      src(D.work.sourcePayRegion) + '</section>';
    return s;
  }

  function releases() {
    let s = '<section class="hero"><h1>Latest releases</h1>' +
      '<p class="lede">The ONS bulletins behind every figure on this site, newest first. Each one links to the section that uses it.</p></section>' +
      '<section class="card"><ul class="release-list">' +
      D.releases.map(function (r) {
        return '<li><span class="release-date">' + esc(r.date) + '</span><br><a href="' + r.route + '">' + esc(r.title) + '</a><p>' + esc(r.what) + '</p></li>';
      }).join("") + '</ul>' +
      '<p class="source">Release dates are the ONS publication dates. Figures on this site are as published in these releases; later revisions are picked up in the next update.</p></section>';
    return s;
  }

  function methods() {
    let s = '<section class="hero"><h1>Sources &amp; methods</h1>' +
      '<p class="lede">Where every number comes from, what the terms mean, and how this site is built.</p></section>';
    s += '<section class="card"><h3 class="chart-title">Sources</h3>' +
      '<p class="takeaway">Every figure on this site is from the Office for National Statistics (ONS). This site is independent and is not affiliated with the ONS.</p><ul>' +
      '<li><strong>Population:</strong> ONS, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025 (1 Oct 2026). Headline 69,483,900; nations, births, deaths and migration from the same release.</li>' +
      '<li><strong>Life expectancy:</strong> ONS, National life tables — life expectancy in the UK: 2022 to 2024 (2025); healthy life expectancy, 2022–24.</li>' +
      '<li><strong>GDP:</strong> ONS, GDP first quarterly estimate, UK: July to September 2026 (12 Nov 2026); annual growth from ONS, UK National Accounts, The Blue Book: 2026 (Sep 2026).</li>' +
      '<li><strong>Prices:</strong> ONS, Consumer price inflation, UK: October 2026 (18 Nov 2026), Table 1.</li>' +
      '<li><strong>Labour market:</strong> ONS, Employment in the UK: November 2026 (17 Nov 2026); unemployment series MGSX, Labour Force Survey.</li>' +
      '<li><strong>Pay:</strong> ONS, Employee earnings in the UK: 2025 (Annual Survey of Hours and Earnings, ASHE, 23 Oct 2025; 2025 provisional). Regional pay: ASHE 2025, Table 3 (workplace-based).</li>' +
      '<li><strong>Projections:</strong> ONS, National population projections: 2024-based (28 Apr 2026) — a projection, not a count.</li>' +
      '</ul><p>All figures are quoted as published by the ONS at ons.gov.uk. One vintage per series: population uses the mid-2025 release, pay uses ASHE 2025. The ONS publishes its headline population rounded to the nearest 100 (69,483,900); charts use the unrounded table values.</p></section>';
    s += '<section class="card"><h3 class="chart-title">Definitions</h3><dl class="def-list">' +
      '<dt>CPIH vs CPI</dt><dd>CPIH is CPI plus owner occupiers’ housing costs and council tax. It is the ONS’s lead measure of inflation. The Bank of England’s 2% target is set on CPI.</dd>' +
      '<dt>Seasonally adjusted (SA)</dt><dd>Adjusted to remove regular seasonal patterns (for example, hiring before Christmas), so quarter-to-quarter changes can be compared fairly.</dd>' +
      '<dt>Median vs mean</dt><dd>The median is the middle earner: half earn more, half earn less. The mean (average) is pulled up by very high earners, so the ONS reports pay as a median.</dd>' +
      '<dt>Percentage-point changes</dt><dd>The ONS works out a change in percentage points from its unrounded estimates, then rounds the result. So the published change can differ by 0.1 points from subtracting two rounded figures: unemployment is 4.6%, down 0.3 points on the year, while the rounded rate a year earlier was 5.0%; employment is 75.4%, up 0.4 points, against 75.1% a year earlier.</dd>' +
      '<dt>Provisional</dt><dd>ASHE 2025 estimates are provisional and may be revised in the next annual release.</dd>' +
      '<dt>Real terms</dt><dd>Adjusted for inflation (here, CPIH), so a “real” rise means pay grew faster than prices.</dd>' +
      '<dt>Pay conversions</dt><dd>On the Work page, £ per hour is the weekly median divided by 37.5 hours and £ per year is the weekly median times 52. Those are conversions for comparison; the published ASHE figures are £19.67 an hour and £39,039 a year for full-time workers in post at least a year.</dd>' +
      '<dt>Net migration</dt><dd>People arriving to live in the UK minus people leaving, plus other adjustments the ONS groups with it.</dd>' +
      '</dl></section>';
    s += '<section class="card"><h3 class="chart-title">About this site</h3>' +
      '<p>Statline UK is an original design built in November 2026. All charts are drawn by hand in the site’s own code; there is no chart library, no webfont and no network request — every figure lives in the site’s own files, so the pages work offline once loaded.</p>' +
      '<p>Pay figures use ASHE 2025 (April 2025 pay). ASHE 2026 was published on 22 October 2026 and will be added in the next update, so that the whole pay series moves to the new vintage together.</p>' +
      '<p class="source">Built November 2026 · Figures: Office for National Statistics · Design and text: Statline UK</p></section>';
    return s;
  }

  return {
    home: home, economy: economy, people: people, work: work,
    prices: prices, regions: regions, releases: releases, methods: methods,
    ChartBuilders: ChartBuilders
  };
})();
