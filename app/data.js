// Statline UK — every figure in the site, in one place.
// Each figure carries its source bulletin and year. Figures are from the
// Office for National Statistics (ONS) unless a note says otherwise.
// One vintage per series: population uses the mid-2025 release (1 Oct 2026),
// pay uses ASHE 2025 (Apr 2025), prices use the October 2026 CPIH bulletin.

const STATLINE = {
  site: {
    name: "Statline UK",
    tagline: "The UK in numbers, from the Office for National Statistics",
    updated: "26 November 2026",
    note: "Independent site. Figures are from the Office for National Statistics (ONS); this site is not affiliated with the ONS."
  },

  // Headline indicators shown on the home page KPI strip.
  kpis: [
    { id: "population", label: "UK population", value: "69.5m", detail: "69,483,900 people",
      change: "▲ up 0.3%", changeNote: "+227,700 on mid-2024", period: "Mid-2025",
      source: "ONS, Population estimates" },
    { id: "gdp", label: "GDP, nominal", value: "£3.03tn", detail: "£3,035 billion in 2025",
      change: "▲ up 1.2% real", changeNote: "Real growth in 2025; nominal +4.8%", period: "2025",
      source: "ONS, GDP estimate" },
    { id: "cpih", label: "Inflation (CPIH)", value: "3.7%", detail: "12-month rate",
      change: "▲ up 0.1pp", changeNote: "On Sep 2026 (3.6%)", period: "Oct 2026",
      source: "ONS, CPIH bulletin" },
    { id: "unemployment", label: "Unemployment rate", value: "4.6%", detail: "Aged 16+, seasonally adjusted",
      change: "▼ down 0.3pp", changeNote: "On the year (5.0% in Jul–Sep 2025)", period: "Jul–Sep 2026",
      source: "ONS, Labour market" },
    { id: "employment", label: "Employment rate", value: "75.4%", detail: "Aged 16–64, seasonally adjusted",
      change: "▲ up 0.4pp", changeNote: "On the year (75.1% in Jul–Sep 2025)", period: "Jul–Sep 2026",
      source: "ONS, Labour market" },
    { id: "pay", label: "Median full-time pay", value: "£766.60", detail: "Per week, before tax",
      change: "▲ up 5.3%", changeNote: "On Apr 2024 (£728.27); +1.1% real", period: "Apr 2025",
      source: "ONS, ASHE 2025" }
  ],

  // UK population, mid-year estimates (ONS, Population estimates: mid-2025,
  // released 1 Oct 2026). Headline is rounded to the nearest 100 by the ONS
  // (69,483,900); the series below uses the unrounded table values.
  population: {
    headline: 69483900,
    headlineText: "69,483,900",
    change: 227700,
    changePct: 0.33,
    medianAge: 40.9,
    series: [
      { year: 2015, value: 65086958 }, { year: 2016, value: 65605841 },
      { year: 2017, value: 65964292 }, { year: 2018, value: 66286727 },
      { year: 2019, value: 66627507 }, { year: 2020, value: 66739867 },
      { year: 2021, value: 66977988 }, { year: 2022, value: 67679974 },
      { year: 2023, value: 68588048 }, { year: 2024, value: 69256274 },
      { year: 2025, value: 69483939 }
    ],
    source: "Source: ONS, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025 (1 Oct 2026)",
    // Components of change, year to mid-2025 (same release).
    components: [
      { label: "Births", value: 652400, note: "Lowest annual total in the ONS series shown (back to 1982)" },
      { label: "Deaths", value: 647500, note: "Natural change (births minus deaths): +4,900" },
      { label: "Net migration and other changes", value: 222700, note: "Arrivals minus departures, plus other adjustments" },
      { label: "Total change", value: 227700, note: "Population grew 0.3% in the year to mid-2025 — the slowest since mid-2020" }
    ],
    // Nations, mid-2025 (ONS Table 1 of the same release).
    nations: [
      { name: "England", pop: 58834800, change: 227600, changePct: 0.39, share: 84.7, medianAge: 40.6 },
      { name: "Scotland", pop: 5545500, change: 2200, changePct: 0.04, share: 8.0, medianAge: 43.1 },
      { name: "Wales", pop: 3175200, change: -2800, changePct: -0.09, share: 4.6, medianAge: 43.2 },
      { name: "Northern Ireland", pop: 1928400, change: 600, changePct: 0.03, share: 2.8, medianAge: 40.6 }
    ],
    // ONS 2024-based principal projection (28 Apr 2026) — a projection, not a count.
    projection: { peak: "72.5 million", peakYear: "mid-2054", later: "64.7 million in mid-2124",
      note: "ONS principal projection (2024-based, 28 Apr 2026) assumes net migration of 230,000 a year from mid-2027." },
    sourceNations: "Source: ONS, Population estimates: mid-2025, Table 1 (1 Oct 2026)"
  },

  // Life expectancy at birth, 2022–24 (ONS, National life tables, UK: 2022 to 2024).
  lifeExpectancy: {
    uk: { men: 79.2, women: 83.0, healthyMen: 60.7, healthyWomen: 60.9 },
    byNation: [
      { nation: "England", men: 79.5, women: 83.3 },
      { nation: "Scotland", men: 77.2, women: 81.1 },
      { nation: "Wales", men: 78.3, women: 82.2 },
      { nation: "Northern Ireland", men: 78.8, women: 82.6 }
    ],
    source: "Source: ONS, National life tables — life expectancy in the UK: 2022 to 2024 (2025); healthy life expectancy from ONS, 2022–24"
  },

  // Economy: GDP (ONS, GDP first quarterly estimate, Q3 2026, 12 Nov 2026;
  // annual growth from the Blue Book 2026 / National accounts).
  gdp: {
    nominal2025: "£3,035 billion",
    realGrowth2025: 1.2,
    nominalGrowth2025: 4.8,
    perHeadGrowth2025: 0.9,
    annualGrowth: [
      { year: 2019, growth: 1.6 }, { year: 2020, growth: -10.4 },
      { year: 2021, growth: 8.7 }, { year: 2022, growth: 4.3 },
      { year: 2023, growth: 0.4 }, { year: 2024, growth: 1.1 },
      { year: 2025, growth: 1.2 }
    ],
    quarterly: [
      { q: "Q1 2025", growth: 0.6 }, { q: "Q2 2025", growth: 0.0 },
      { q: "Q3 2025", growth: 0.2 }, { q: "Q4 2025", growth: 0.0 },
      { q: "Q1 2026", growth: 0.6 }, { q: "Q2 2026", growth: 0.5 },
      { q: "Q3 2026", growth: 0.7 }
    ],
    latestQuarter: { label: "Q3 2026 (Jul–Sep)", growth: 0.7, yoy: 1.9,
      perHead: 0.7, monthly: "Sep 2026 +0.2%, Aug 0.0%, Jul +0.4%",
      sectors: "Services +0.9%, production +0.1%, construction −0.7% in Q3 2026" },
    source: "Source: ONS, GDP first quarterly estimate, UK: Jul–Sep 2026 (12 Nov 2026); annual growth from ONS, UK National Accounts, The Blue Book: 2026"
  },

  // Prices: CPIH 12-month rate, monthly (ONS, Consumer price inflation, UK:
  // October 2026, 18 Nov 2026, Table 1).
  prices: {
    cpih: 3.7, cpi: 3.6, coreCpih: 3.1, goods: 3.5, services: 3.9,
    target: 2.0,
    monthly: [
      { m: "Nov 24", v: 3.5 }, { m: "Dec 24", v: 3.5 }, { m: "Jan 25", v: 3.9 },
      { m: "Feb 25", v: 3.7 }, { m: "Mar 25", v: 3.4 }, { m: "Apr 25", v: 4.1 },
      { m: "May 25", v: 4.0 }, { m: "Jun 25", v: 4.1 }, { m: "Jul 25", v: 4.2 },
      { m: "Aug 25", v: 4.1 }, { m: "Sep 25", v: 4.1 }, { m: "Oct 25", v: 3.8 },
      { m: "Nov 25", v: 3.5 }, { m: "Dec 25", v: 3.6 }, { m: "Jan 26", v: 3.2 },
      { m: "Feb 26", v: 3.2 }, { m: "Mar 26", v: 3.4 }, { m: "Apr 26", v: 3.0 },
      { m: "May 26", v: 3.0 }, { m: "Jun 26", v: 2.8 }, { m: "Jul 26", v: 3.1 },
      { m: "Aug 26", v: 3.3 }, { m: "Sep 26", v: 3.6 }, { m: "Oct 26", v: 3.7 }
    ],
    drivers: "Housing and household services was the largest contributor to CPIH in October 2026 (1.40 percentage points), driven by owner occupiers’ housing costs. Motor fuel prices and a tobacco duty rise pushed the rate up; goods inflation rose to 3.5% while services held at 3.9%.",
    source: "Source: ONS, Consumer price inflation, UK: October 2026 (18 Nov 2026)"
  },

  // Work: labour market (ONS, Employment in the UK: November 2026, 17 Nov 2026)
  // and pay (ONS, ASHE 2025, 23 Oct 2025).
  work: {
    employmentRate: 75.4, employmentRateYearAgo: 75.1,
    employed: "34.62 million", unemployed: "1.68 million",
    unemploymentRate: 4.6, unemploymentRateYearAgo: 5.0,
    vacancies: 690000, vacanciesNote: "Aug–Oct 2026, down 22,000 on May–Jul 2026",
    youthUnemployment: 15.1, youthNote: "Aged 16–24, Jul–Sep 2026; about 688,000 young people",
    inactivity: 20.8, inactivityNote: "Economic inactivity rate, aged 16–64, Jul–Sep 2026",
    // Unemployment rate, aged 16+, seasonally adjusted, by calendar quarter
    // (ONS series MGSX, Labour Force Survey).
    unemploymentSeries: [
      { q: "Q1 2023", v: 4.0 }, { q: "Q2 2023", v: 4.2 }, { q: "Q3 2023", v: 4.1 }, { q: "Q4 2023", v: 3.9 },
      { q: "Q1 2024", v: 4.3 }, { q: "Q2 2024", v: 4.2 }, { q: "Q3 2024", v: 4.3 }, { q: "Q4 2024", v: 4.4 },
      { q: "Q1 2025", v: 4.6 }, { q: "Q2 2025", v: 4.7 }, { q: "Q3 2025", v: 5.0 }, { q: "Q4 2025", v: 5.2 },
      { q: "Q1 2026", v: 5.0 }, { q: "Q2 2026", v: 4.9 }, { q: "Q3 2026", v: 4.6 }
    ],
    sourceLabour: "Source: ONS, Employment in the UK: November 2026 (17 Nov 2026); unemployment series: ONS, series MGSX (Labour Force Survey)",
    pay: {
      weekly: 766.60, weeklyPrev: 728.27, weeklyChange: 5.3, realChange: 1.1,
      hourly: 19.67, annual: 39039, annualPrev: 37439, partTimeWeekly: 280.00,
      source: "Source: ONS, Employee earnings in the UK: 2025 (Annual Survey of Hours and Earnings, ASHE, 23 Oct 2025; 2025 provisional)"
    },
    // Median gross weekly pay, full-time employee jobs, by place of work,
    // April 2025 (ONS ASHE 2025, Table 3). UK median £766.60.
    payByRegion: [
      { region: "London", weekly: 958.20 },
      { region: "South East", weekly: 775.80 },
      { region: "Scotland", weekly: 773.80 },
      { region: "East", weekly: 766.60 },
      { region: "North West", weekly: 734.20 },
      { region: "West Midlands", weekly: 730.40 },
      { region: "South West", weekly: 728.70 },
      { region: "Northern Ireland", weekly: 713.10 },
      { region: "Yorkshire and the Humber", weekly: 708.20 },
      { region: "Wales", weekly: 704.30 },
      { region: "East Midlands", weekly: 703.80 },
      { region: "North East", weekly: 681.20 }
    ],
    englandPay: 770.70,
    sourcePayRegion: "Source: ONS, Annual Survey of Hours and Earnings 2025, Table 3 (workplace-based, April 2025)"
  },

  // Searchable indicator index (home page search box filters this list live).
  indicators: [
    { name: "UK population", value: "69,483,900 (mid-2025)", route: "#/people" },
    { name: "Population by nation", value: "England 58.8m · Scotland 5.5m · Wales 3.2m · N. Ireland 1.9m", route: "#/people" },
    { name: "Births and deaths", value: "652,400 births · 647,500 deaths (year to mid-2025)", route: "#/people" },
    { name: "Net migration", value: "+222,700 (year to mid-2025)", route: "#/people" },
    { name: "Life expectancy", value: "Men 79.2 yrs · Women 83.0 yrs (2022–24)", route: "#/people" },
    { name: "GDP (nominal)", value: "£3,035 billion (2025)", route: "#/economy" },
    { name: "GDP growth (real)", value: "+1.2% in 2025 · +0.7% in Q3 2026", route: "#/economy" },
    { name: "GDP per head", value: "+0.9% real in 2025", route: "#/economy" },
    { name: "Inflation — CPIH", value: "3.7% (Oct 2026)", route: "#/prices" },
    { name: "Inflation — CPI", value: "3.6% (Oct 2026)", route: "#/prices" },
    { name: "Employment rate", value: "75.4% (Jul–Sep 2026)", route: "#/work" },
    { name: "Unemployment rate", value: "4.6% (Jul–Sep 2026)", route: "#/work" },
    { name: "Median full-time pay", value: "£766.60 a week (Apr 2025)", route: "#/work" },
    { name: "Pay by region", value: "London £958.20 · North East £681.20 a week", route: "#/work" },
    { name: "Job vacancies", value: "690,000 (Aug–Oct 2026)", route: "#/work" },
    { name: "Median age", value: "40.9 years (mid-2025)", route: "#/people" }
  ],

  // Latest ONS releases the figures on this site come from.
  releases: [
    { title: "Consumer price inflation, UK: October 2026", date: "18 Nov 2026", what: "CPIH rose to 3.7%; CPI to 3.6%. Next release 16 Dec 2026.", route: "#/prices" },
    { title: "Employment in the UK: November 2026", date: "17 Nov 2026", what: "Employment rate 75.4%, unemployment 4.6% in Jul–Sep 2026.", route: "#/work" },
    { title: "GDP first quarterly estimate, UK: July to September 2026", date: "12 Nov 2026", what: "GDP grew 0.7% in Q3 2026; 1.9% higher than a year earlier.", route: "#/economy" },
    { title: "GDP monthly estimate, UK: September 2026", date: "12 Nov 2026", what: "GDP grew 0.2% in September 2026, after no growth in August.", route: "#/economy" },
    { title: "Employee earnings in the UK: 2025", date: "23 Oct 2025", what: "Median full-time weekly pay £766.60 in April 2025 (ASHE, provisional).", route: "#/work" },
    { title: "Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025", date: "1 Oct 2026", what: "UK population 69,483,900; growth slowed to 0.3%, the lowest since mid-2020.", route: "#/people" },
    { title: "UK National Accounts, The Blue Book: 2026", date: "Sep 2026", what: "Annual GDP: real growth +1.2% in 2025, nominal GDP £3,035 billion.", route: "#/economy" },
    { title: "Population estimates for England and Wales: mid-2025", date: "29 Jul 2026", what: "England and Wales reached 62.0 million people.", route: "#/people" },
    { title: "National population projections: 2024-based", date: "28 Apr 2026", what: "UK population projected to peak at 72.5 million in mid-2054.", route: "#/people" },
    { title: "National life tables — life expectancy in the UK: 2022 to 2024", date: "2025", what: "Life expectancy at birth: men 79.2 years, women 83.0 years.", route: "#/people" }
  ]
};
