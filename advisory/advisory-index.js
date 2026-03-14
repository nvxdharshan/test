/* Advisory Hub: client-side render + filters (no build step) */

let ADVISORIES = [];
let CURRENT_PAGE = 1;
const PAGE_SIZE = 10;

const SEVERITY_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function uniqSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function matchesQuery(advisory, query) {
  if (!query) return true;
  const q = normalize(query);
  const haystack = [
    advisory.id,
    advisory.cve,
    advisory.title,
    advisory.product,
    advisory.severity,
    advisory.excerpt,
    ...(advisory.tags || []),
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(q);
}

function severityClass(sev) {
  const s = normalize(sev);
  if (s === "critical") return "severity-critical";
  if (s === "high") return "severity-high";
  if (s === "medium") return "severity-medium";
  return "severity-low";
}

function formatDate(iso) {
  // ISO -> "13 March 2026" (match advisory pages)
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, String(v));
  }
  for (const child of children) node.append(child);
  return node;
}

function advisoryCard(advisory) {
  const badges = el("div", { class: "advisory-row-title-top" }, [
    el("span", { class: `advisory-pill ${severityClass(advisory.severity)}` }, [advisory.severity]),
    el("span", { class: "advisory-pill" }, [`${advisory.id}`]),
    advisory.cve ? el("span", { class: "advisory-pill" }, [advisory.cve]) : document.createTextNode(""),
  ]);

  const title = el("div", { class: "advisory-row-title" }, [
    badges,
    el("a", { href: advisory.href, "aria-label": `Open ${advisory.id}` }, [advisory.title]),
    el("div", { class: "advisory-row-meta" }, [
      el("div", {}, [el("span", {}, ["Product: "]), document.createTextNode(advisory.product || "—")]),
      typeof advisory.cvss === "number"
        ? el("div", {}, [el("span", {}, ["CVSS: "]), document.createTextNode(advisory.cvss.toFixed(1))])
        : document.createTextNode(""),
      advisory.tags && advisory.tags.length
        ? el("div", {}, [el("span", {}, ["Tags: "]), document.createTextNode(advisory.tags.slice(0, 3).join(", "))])
        : document.createTextNode(""),
    ]),
  ]);

  const sev = el("div", { class: "advisory-row-sev" }, [
    el("span", { class: "advisory-mobile-label" }, ["Severity"]),
    el("span", { class: `advisory-pill ${severityClass(advisory.severity)}` }, [advisory.severity]),
  ]);

  const date = el("div", { class: "advisory-row-date" }, [
    el("span", { class: "advisory-mobile-label" }, ["Published"]),
    document.createTextNode(formatDate(advisory.date)),
  ]);

  return el("div", { class: "advisory-row", role: "row" }, [title, sev, date]);
}

function getFilters() {
  const severity = document.getElementById("filterSeverity").value;
  const product = document.getElementById("filterProduct").value;
  const query = document.getElementById("filterQuery").value;
  const sortBy = document.getElementById("sortBy").value;
  const activeTags = [...document.querySelectorAll(".advisory-chip[aria-pressed='true']")].map((b) =>
    b.getAttribute("data-tag")
  );
  return { severity, product, query, sortBy, activeTags };
}

function applyFilters(items, filters) {
  let out = items.slice();

  if (filters.severity) out = out.filter((a) => a.severity === filters.severity);
  if (filters.product) out = out.filter((a) => (a.product || "") === filters.product);
  if (filters.activeTags.length)
    out = out.filter((a) => filters.activeTags.every((t) => (a.tags || []).includes(t)));
  if (filters.query) out = out.filter((a) => matchesQuery(a, filters.query));

  if (filters.sortBy === "date_asc") out.sort((a, b) => a.date.localeCompare(b.date));
  else if (filters.sortBy === "severity_desc")
    out.sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) || b.date.localeCompare(a.date));
  else out.sort((a, b) => b.date.localeCompare(a.date));

  return out;
}

function render() {
  const list = document.getElementById("advisoryList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageMeta = document.getElementById("pageMeta");
  const pagination = document.getElementById("pagination");

  const filters = getFilters();
  const results = applyFilters(ADVISORIES, filters);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  CURRENT_PAGE = Math.min(Math.max(1, CURRENT_PAGE), totalPages);

  const start = (CURRENT_PAGE - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  list.replaceChildren(...pageItems.map(advisoryCard));
  count.textContent = `${total} advisory${total === 1 ? "" : "ies"}`;

  empty.hidden = total !== 0;
  pagination.hidden = total === 0 || totalPages <= 1;
  prevBtn.disabled = CURRENT_PAGE <= 1;
  nextBtn.disabled = CURRENT_PAGE >= totalPages;
  pageMeta.textContent = total === 0 ? "" : `Page ${CURRENT_PAGE} of ${totalPages}`;
}

function buildProducts() {
  const products = uniqSorted(ADVISORIES.map((a) => a.product).filter(Boolean));
  const select = document.getElementById("filterProduct");
  for (const p of products) select.append(el("option", { value: p }, [p]));
}

function buildTags() {
  const tags = uniqSorted(ADVISORIES.flatMap((a) => a.tags || []));
  const root = document.getElementById("tagChips");
  for (const tag of tags) {
    const chip = el(
      "button",
      {
        type: "button",
        class: "advisory-chip",
        "aria-pressed": "false",
        "data-tag": tag,
        onclick: (e) => {
          const pressed = e.currentTarget.getAttribute("aria-pressed") === "true";
          e.currentTarget.setAttribute("aria-pressed", pressed ? "false" : "true");
          render();
        },
      },
      [tag]
    );
    root.append(chip);
  }
}

function resetFilters() {
  document.getElementById("filterSeverity").value = "";
  document.getElementById("filterProduct").value = "";
  document.getElementById("filterQuery").value = "";
  document.getElementById("sortBy").value = "date_desc";
  for (const chip of document.querySelectorAll(".advisory-chip")) chip.setAttribute("aria-pressed", "false");
  CURRENT_PAGE = 1;
  render();
}

function wire() {
  for (const id of ["filterSeverity", "filterProduct", "sortBy"]) {
    document.getElementById(id).addEventListener("change", () => {
      CURRENT_PAGE = 1;
      render();
    });
  }
  document.getElementById("filterQuery").addEventListener("input", () => {
    window.clearTimeout(wire._t);
    wire._t = window.setTimeout(() => {
      CURRENT_PAGE = 1;
      render();
    }, 120);
  });
  document.getElementById("resetFilters").addEventListener("click", resetFilters);
  document.getElementById("prevPage").addEventListener("click", () => {
    CURRENT_PAGE = Math.max(1, CURRENT_PAGE - 1);
    render();
  });
  document.getElementById("nextPage").addEventListener("click", () => {
    CURRENT_PAGE += 1;
    render();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdvisories()
    .then((items) => {
      ADVISORIES = items;
      buildProducts();
      buildTags();
      wire();
      render();
    })
    .catch(() => {
      ADVISORIES = [];
      buildProducts();
      buildTags();
      wire();
      render();
    });
});

async function loadAdvisories() {
  const res = await fetch("advisories.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load advisories.json: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("advisories.json must be an array");
  // Minimal normalization so bad entries don't break rendering.
  return data
    .filter((a) => a && typeof a === "object")
    .map((a) => ({
      id: String(a.id || "").trim(),
      cve: a.cve ? String(a.cve).trim() : "",
      title: String(a.title || "").trim(),
      date: String(a.date || "").trim(),
      severity: String(a.severity || "").trim(),
      cvss: typeof a.cvss === "number" ? a.cvss : a.cvss != null ? Number(a.cvss) : undefined,
      product: a.product ? String(a.product).trim() : "",
      tags: Array.isArray(a.tags) ? a.tags.map((t) => String(t)) : [],
      excerpt: a.excerpt ? String(a.excerpt) : "",
      href: a.href ? String(a.href) : "",
    }))
    .filter((a) => a.id && a.title && a.date && a.severity && a.href);
}
