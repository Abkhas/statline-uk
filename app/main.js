// Statline UK — hash router + controls. One job: render the route named by
// the hash, then wire the controls on that page (chart/table toggles,
// period toggles, pay unit toggle, region sorting, indicator search).

(function () {
  var ROUTES = {
    "": { view: Views.home, title: "Statline UK — The UK in numbers" },
    "economy": { view: Views.economy, title: "Economy — Statline UK" },
    "people": { view: Views.people, title: "People & population — Statline UK" },
    "work": { view: Views.work, title: "Work & pay — Statline UK" },
    "prices": { view: Views.prices, title: "Prices & living costs — Statline UK" },
    "regions": { view: Views.regions, title: "Nations & regions — Statline UK" },
    "releases": { view: Views.releases, title: "Latest releases — Statline UK" },
    "methods": { view: Views.methods, title: "Sources & methods — Statline UK" }
  };

  // Per-card state: which range/unit is active and whether the table is shown.
  var cardState = {};

  function routeName() {
    var h = window.location.hash || "#/";
    var name = h.replace(/^#\/?/, "").split("?")[0];
    return ROUTES.hasOwnProperty(name) ? name : "";
  }

  function render() {
    var name = routeName();
    var route = ROUTES[name];
    cardState = {};
    document.getElementById("app").innerHTML = route.view() +
      '<footer class="site-footer"><nav>' +
      '<a href="#/">Home</a><a href="#/economy">Economy</a><a href="#/people">People</a>' +
      '<a href="#/work">Work</a><a href="#/prices">Prices</a><a href="#/regions">Regions</a>' +
      '<a href="#/releases">Releases</a><a href="#/methods">Sources &amp; methods</a></nav>' +
      '<p>Statline UK — an independent site. All figures from the Office for National Statistics (ONS); this site is not affiliated with the ONS. Built November 2026.</p></footer>';
    document.title = route.title;
    var links = document.querySelectorAll(".main-nav a");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href === "#/" + name || (name === "" && href === "#/")) {
        links[i].setAttribute("aria-current", "page");
      } else {
        links[i].removeAttribute("aria-current");
      }
    }
    window.scrollTo(0, 0);
  }

  function cardBody(id) {
    return document.querySelector('[data-chart-body="' + id + '"]');
  }

  function toggleButton(id) {
    return document.querySelector('[data-toggle="' + id + '"]');
  }

  function setCard(id, range, unit) {
    var built = Views.ChartBuilders[id](range, unit);
    var st = cardState[id] || {};
    cardBody(id).innerHTML = st.showTable ? built.table : built.chart;
    var btn = toggleButton(id);
    if (btn) btn.textContent = st.showTable ? "View as chart" : "View as table";
  }

  // Chart/table toggle.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle]");
    if (t) {
      var id = t.getAttribute("data-toggle");
      var st = cardState[id] || {};
      st.showTable = !st.showTable;
      cardState[id] = st;
      setCard(id, st.range, st.unit);
      return;
    }
    // Period toggle: re-render that card's chart from the data.
    var p = e.target.closest("[data-period-for]");
    if (p) {
      var pid = p.getAttribute("data-period-for");
      var range = p.getAttribute("data-range");
      var pst = cardState[pid] || {};
      pst.range = range;
      pst.showTable = false;
      cardState[pid] = pst;
      var sibs = document.querySelectorAll('[data-period-for="' + pid + '"]');
      for (var i = 0; i < sibs.length; i++) sibs[i].setAttribute("aria-pressed", String(sibs[i] === p));
      setCard(pid, range, pst.unit);
      return;
    }
    // Pay unit toggle: recompute the pay chart and table from the data.
    var u = e.target.closest("[data-unit-for]");
    if (u) {
      var uid = u.getAttribute("data-unit-for");
      var unit = u.getAttribute("data-unit");
      var ust = cardState[uid] || {};
      ust.unit = unit;
      ust.showTable = false;
      cardState[uid] = ust;
      var usibs = document.querySelectorAll('[data-unit-for="' + uid + '"]');
      for (var j = 0; j < usibs.length; j++) usibs[j].setAttribute("aria-pressed", String(usibs[j] === u));
      setCard(uid, ust.range, unit);
      return;
    }
    // Sortable table header: sort that table's rows by the clicked column.
    var th = e.target.closest("th.sortable");
    if (th) {
      var table = th.closest("table");
      var col = Array.prototype.indexOf.call(th.parentNode.children, th);
      var kind = th.getAttribute("data-sort");
      var dir = th.classList.contains("sorted-asc") ? -1 : 1;
      var heads = table.querySelectorAll("th.sortable");
      for (var k = 0; k < heads.length; k++) heads[k].classList.remove("sorted-asc", "sorted-desc");
      th.classList.add(dir === 1 ? "sorted-asc" : "sorted-desc");
      var tbody = table.querySelector("tbody");
      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      var ukRow = rows.filter(function (r) { return r.classList.contains("uk-row"); });
      var data = rows.filter(function (r) { return !r.classList.contains("uk-row"); });
      data.sort(function (a, b) {
        var av = a.children[col].textContent.trim(), bv = b.children[col].textContent.trim();
        if (kind === "num") {
          var an = parseFloat(av.replace(/[^0-9.\-]/g, "")), bn = parseFloat(bv.replace(/[^0-9.\-]/g, ""));
          if (isNaN(an)) an = -Infinity;
          if (isNaN(bn)) bn = -Infinity;
          return (an - bn) * dir;
        }
        return av.localeCompare(bv) * dir;
      });
      data.forEach(function (r) { tbody.appendChild(r); });
      ukRow.forEach(function (r) { tbody.appendChild(r); });
    }
  });

  // Indicator search: filters the list live, no re-render.
  document.addEventListener("input", function (e) {
    if (e.target.id !== "indicator-search") return;
    var q = e.target.value.trim().toLowerCase();
    var items = document.querySelectorAll("#indicator-list li");
    var shown = 0;
    for (var i = 0; i < items.length; i++) {
      var hit = !q || items[i].textContent.toLowerCase().indexOf(q) !== -1;
      items[i].style.display = hit ? "" : "none";
      if (hit) shown++;
    }
    var count = document.getElementById("search-count");
    if (count) count.textContent = q ? ("Showing " + shown + " of " + items.length + " indicators matching “" + e.target.value.trim() + "”.") : ("Showing all " + items.length + " indicators.");
  });

  window.addEventListener("hashchange", render);
  render();
})();
