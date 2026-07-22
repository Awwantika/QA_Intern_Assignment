const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

const bugs = require('./bugs-data');

const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'bug-report');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');
const OUTPUT = path.join(OUTPUT_DIR, 'index.html');

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function resolveSourcePath(candidate) {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const candidates = [
    path.join(ROOT, trimmed),
    path.join(ROOT, 'test-results', trimmed),
  ];

  if (IMAGE_EXT.test(trimmed)) {
    candidates.unshift(path.join(ROOT, path.basename(trimmed)));
  }

  for (const filePath of candidates) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }
  return null;
}

function findScreenshotForBug(bug) {
  const testResultsDir = path.join(ROOT, 'test-results');
  if (!fs.existsSync(testResultsDir)) return null;

  const hint = (bug.evidence || '').toLowerCase();
  if (!hint.includes('screenshot') && !hint.includes('test-results')) return null;

  const folders = fs
    .readdirSync(testResultsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const moduleHint = bug.module.toLowerCase();
  const match = folders.find((folder) => {
    const lower = folder.toLowerCase();
    return (
      lower.includes(moduleHint) ||
      (hint.includes('header') && lower.includes('header')) ||
      (hint.includes('footer') && lower.includes('footer')) ||
      (hint.includes('navigation') && lower.includes('navigation'))
    );
  });

  if (!match) return null;

  const screenshot = path.join(testResultsDir, match, 'test-failed-1.png');
  return fs.existsSync(screenshot) ? screenshot : null;
}

function collectImageSources(bug) {
  const sources = new Set();

  if (Array.isArray(bug.images)) {
    bug.images.forEach((img) => sources.add(img));
  }

  String(bug.evidence || '')
    .split(/[;,]/)
    .map((part) => part.trim())
    .forEach((part) => {
      const token = part.split(/\s+/).find((word) => IMAGE_EXT.test(word));
      if (token) sources.add(token);
    });

  const autoScreenshot = findScreenshotForBug(bug);
  if (autoScreenshot) sources.add(autoScreenshot);

  return [...sources]
    .map((src) => (path.isAbsolute(src) ? src : resolveSourcePath(src)))
    .filter(Boolean);
}

function prepareAssets() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // Clear old copied assets
  for (const file of fs.readdirSync(ASSETS_DIR)) {
    fs.unlinkSync(path.join(ASSETS_DIR, file));
  }

  const assetMap = new Map();

  bugs.forEach((bug) => {
    const sources = collectImageSources(bug);
    const assets = [];

    sources.forEach((sourcePath, index) => {
      const ext = path.extname(sourcePath).toLowerCase() || '.png';
      const assetName = `${bug.id.toLowerCase()}-${index}${ext}`;
      const dest = path.join(ASSETS_DIR, assetName);
      fs.copyFileSync(sourcePath, dest);
      assets.push({
        name: assetName,
        url: `assets/${assetName}`,
        label: path.basename(sourcePath),
      });
    });

    assetMap.set(bug.id, assets);
  });

  return assetMap;
}

function renderEvidenceImages(assets) {
  if (!assets.length) return '';

  const items = assets
    .map(
      (asset) => `
        <figure class="evidence-figure">
          <a href="${escapeHtml(asset.url)}" target="_blank" rel="noopener">
            <img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.label)}" loading="lazy" />
          </a>
          <figcaption>${escapeHtml(asset.label)}</figcaption>
        </figure>`
    )
    .join('');

  return `
        <section class="evidence-images">
          <h3>Screenshots / evidence</h3>
          <div class="evidence-gallery">${items}</div>
        </section>`;
}

function buildHtml(assetMap) {
  const modules = [...new Set(bugs.map((b) => b.module))].sort();
  const statuses = [...new Set(bugs.map((b) => b.status))].sort();
  const priorities = ['P0', 'P1', 'P2'];

  const openCount = bugs.filter((b) => b.status === 'Open').length;
  const p0Count = bugs.filter((b) => b.priority === 'P0' && b.status !== 'Closed').length;
  const imageCount = [...assetMap.values()].reduce((sum, list) => sum + list.length, 0);

  const moduleSummary = modules
    .map((mod) => {
      const modBugs = bugs.filter((b) => b.module === mod);
      const open = modBugs.filter((b) => b.status === 'Open').length;
      return `<button type="button" class="module-chip" data-module="${escapeHtml(mod)}">${escapeHtml(mod)} <span>${open}/${modBugs.length} open</span></button>`;
    })
    .join('\n');

  const bugCards = bugs
    .map((bug) => {
      const assets = assetMap.get(bug.id) || [];
      const evidenceHtml = renderEvidenceImages(assets);
      const evidenceText = assets.length
        ? `${bug.evidence}${bug.evidence ? ' · ' : ''}${assets.length} image(s) attached`
        : bug.evidence;

      return `
    <article class="bug-card ${priorityClass(bug.priority)} ${statusClass(bug.status)}"
      data-id="${escapeHtml(bug.id)}"
      data-module="${escapeHtml(bug.module)}"
      data-status="${escapeHtml(bug.status)}"
      data-priority="${escapeHtml(bug.priority)}"
      data-search="${escapeHtml(
        [bug.id, bug.module, bug.feature, bug.title, bug.type, bug.testCaseIds, bug.comments]
          .join(' ')
          .toLowerCase()
      )}">
      <header class="bug-header">
        <div class="bug-meta">
          <span class="bug-id">${escapeHtml(bug.id)}</span>
          <span class="badge module">${escapeHtml(bug.module)}</span>
          <span class="badge ${priorityClass(bug.priority)}">${escapeHtml(bug.priority)}</span>
          <span class="badge ${statusClass(bug.status)}">${escapeHtml(bug.status)}</span>
          <span class="badge severity">${escapeHtml(bug.severity)}</span>
          ${assets.length ? `<span class="badge photo">${assets.length} photo${assets.length > 1 ? 's' : ''}</span>` : ''}
        </div>
        <h2>${escapeHtml(bug.title)}</h2>
        <p class="feature">${escapeHtml(bug.feature)} · ${escapeHtml(bug.type)}</p>
      </header>
      <div class="bug-body">
        ${evidenceHtml}
        <div class="grid">
          <section>
            <h3>Steps to reproduce</h3>
            <p>${nl2br(bug.steps)}</p>
          </section>
          <section>
            <h3>Expected</h3>
            <p>${nl2br(bug.expected)}</p>
          </section>
          <section>
            <h3>Actual</h3>
            <p class="actual">${nl2br(bug.actual)}</p>
          </section>
          <section>
            <h3>Details</h3>
            <dl>
              <dt>Test case(s)</dt><dd>${escapeHtml(bug.testCaseIds)}</dd>
              <dt>Environment</dt><dd>${escapeHtml(bug.environment)}</dd>
              <dt>Browser</dt><dd>${escapeHtml(bug.browser)}</dd>
              <dt>Evidence</dt><dd>${escapeHtml(evidenceText)}</dd>
              <dt>Reported by</dt><dd>${escapeHtml(bug.reportedBy)}</dd>
              <dt>Date</dt><dd>${escapeHtml(bug.date)}</dd>
            </dl>
          </section>
        </div>
        ${
          bug.comments
            ? `<section class="comments"><h3>Comments</h3><p>${nl2br(bug.comments)}</p></section>`
            : ''
        }
      </div>
    </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HamroBazar Bug Report</title>
  <style>
    :root {
      --bg: #f4f6f9;
      --surface: #ffffff;
      --text: #1a1a2e;
      --muted: #5c6370;
      --border: #e2e8f0;
      --accent: #1565c0;
      --p0: #c62828;
      --p1: #ef6c00;
      --p2: #2e7d32;
      --open: #d32f2f;
      --blocked: #ed6c02;
      --pending: #1565c0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .topbar {
      background: linear-gradient(135deg, #0d47a1, #1565c0);
      color: #fff;
      padding: 1.25rem 1.5rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 12px rgba(0,0,0,.15);
    }
    .topbar h1 { margin: 0 0 .25rem; font-size: 1.5rem; }
    .topbar p { margin: 0; opacity: .9; font-size: .95rem; }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
      margin-top: 1rem;
    }
    .stat {
      background: rgba(255,255,255,.15);
      border-radius: 8px;
      padding: .5rem .85rem;
      font-size: .875rem;
    }
    .stat strong { display: block; font-size: 1.25rem; }
    .controls {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 9;
    }
    .controls label { font-size: .85rem; color: var(--muted); font-weight: 600; }
    .controls select, .controls input, .controls button {
      padding: .45rem .65rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: .9rem;
      background: #fff;
    }
    .controls input[type="search"] { min-width: 220px; flex: 1; }
    .module-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      padding: .75rem 1.5rem;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .module-chip {
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 999px;
      padding: .35rem .75rem;
      font-size: .8rem;
      cursor: pointer;
    }
    .module-chip:hover, .module-chip.active {
      border-color: var(--accent);
      background: #e3f2fd;
      color: var(--accent);
    }
    .module-chip span { opacity: .7; margin-left: .25rem; }
    main { max-width: 1100px; margin: 0 auto; padding: 1.25rem 1.5rem 2rem; }
    .bug-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 1rem;
      overflow: hidden;
      border-left: 4px solid var(--border);
    }
    .bug-card.priority-p0 { border-left-color: var(--p0); }
    .bug-card.priority-p1 { border-left-color: var(--p1); }
    .bug-card.priority-p2 { border-left-color: var(--p2); }
    .bug-header { padding: 1rem 1.25rem .75rem; cursor: pointer; }
    .bug-header:hover { background: #fafbfc; }
    .bug-meta { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .5rem; align-items: center; }
    .bug-id { font-weight: 700; font-size: .9rem; color: var(--accent); }
    .badge {
      font-size: .72rem;
      font-weight: 600;
      padding: .15rem .45rem;
      border-radius: 4px;
      background: #eceff1;
      color: #37474f;
      text-transform: uppercase;
      letter-spacing: .02em;
    }
    .badge.module { background: #e8eaf6; color: #283593; }
    .badge.photo { background: #f3e5f5; color: #6a1b9a; }
    .badge.priority-p0 { background: #ffebee; color: var(--p0); }
    .badge.priority-p1 { background: #fff3e0; color: var(--p1); }
    .badge.priority-p2 { background: #e8f5e9; color: var(--p2); }
    .badge.status-open { background: #ffebee; color: var(--open); }
    .badge.status-blocked { background: #fff3e0; color: var(--blocked); }
    .badge.status-pending { background: #e3f2fd; color: var(--pending); }
    .bug-header h2 { margin: 0; font-size: 1.05rem; }
    .feature { margin: .35rem 0 0; color: var(--muted); font-size: .875rem; }
    .bug-body {
      display: none;
      padding: 0 1.25rem 1.25rem;
      border-top: 1px solid var(--border);
    }
    .bug-card.expanded .bug-body { display: block; }
    .evidence-images {
      margin-top: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border);
    }
    .evidence-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-top: .5rem;
    }
    .evidence-figure {
      margin: 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: #fafafa;
    }
    .evidence-figure a { display: block; line-height: 0; }
    .evidence-figure img {
      width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: contain;
      background: #111;
    }
    .evidence-figure figcaption {
      padding: .45rem .65rem;
      font-size: .78rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
      background: #fff;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    section h3 {
      margin: 0 0 .35rem;
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--muted);
    }
    section p { margin: 0; font-size: .9rem; }
    section .actual { color: #b71c1c; }
    dl { margin: 0; font-size: .875rem; }
    dt { font-weight: 600; color: var(--muted); margin-top: .5rem; }
    dt:first-child { margin-top: 0; }
    dd { margin: .1rem 0 0; }
    .comments {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--border);
    }
    .empty {
      text-align: center;
      padding: 3rem;
      color: var(--muted);
    }
    .footer-note {
      text-align: center;
      color: var(--muted);
      font-size: .8rem;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>HamroBazar Bug Report</h1>
    <p>https://hamrobazaar.com · Generated ${new Date().toLocaleString()}</p>
    <div class="stats">
      <div class="stat"><strong>${bugs.length}</strong>Total bugs</div>
      <div class="stat"><strong>${openCount}</strong>Open</div>
      <div class="stat"><strong>${p0Count}</strong>P0 active</div>
      <div class="stat"><strong>${imageCount}</strong>Screenshots</div>
    </div>
  </div>

  <div class="controls">
    <label for="search">Search</label>
    <input id="search" type="search" placeholder="Search by ID, title, module…" />

    <label for="filter-module">Module</label>
    <select id="filter-module">
      <option value="">All modules</option>
      ${modules.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('')}
    </select>

    <label for="filter-status">Status</label>
    <select id="filter-status">
      <option value="">All statuses</option>
      ${statuses.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
    </select>

    <label for="filter-priority">Priority</label>
    <select id="filter-priority">
      <option value="">All priorities</option>
      ${priorities.map((p) => `<option value="${p}">${p}</option>`).join('')}
    </select>

    <button type="button" id="expand-all">Expand all</button>
    <button type="button" id="collapse-all">Collapse all</button>
  </div>

  <div class="module-chips" id="module-chips">
    <button type="button" class="module-chip active" data-module="">All</button>
    ${moduleSummary}
  </div>

  <main id="bug-list">
    ${bugCards}
    <p class="empty" id="empty-state" hidden>No bugs match your filters.</p>
  </main>

  <p class="footer-note">Regenerate: npm run qa:bugs:view · Local server: npm run qa:bugs:serve</p>

  <script>
    const cards = [...document.querySelectorAll('.bug-card')];
    const search = document.getElementById('search');
    const filterModule = document.getElementById('filter-module');
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');
    const emptyState = document.getElementById('empty-state');
    const moduleChips = document.getElementById('module-chips');

    function applyFilters() {
      const q = search.value.trim().toLowerCase();
      const mod = filterModule.value;
      const status = filterStatus.value;
      const priority = filterPriority.value;
      let visible = 0;

      cards.forEach((card) => {
        const match =
          (!q || card.dataset.search.includes(q)) &&
          (!mod || card.dataset.module === mod) &&
          (!status || card.dataset.status === status) &&
          (!priority || card.dataset.priority === priority);

        card.hidden = !match;
        if (match) visible++;
      });

      emptyState.hidden = visible > 0;
    }

    [search, filterModule, filterStatus, filterPriority].forEach((el) => {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });

    moduleChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.module-chip');
      if (!chip) return;
      moduleChips.querySelectorAll('.module-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      filterModule.value = chip.dataset.module || '';
      applyFilters();
    });

    cards.forEach((card) => {
      card.querySelector('.bug-header').addEventListener('click', () => {
        card.classList.toggle('expanded');
      });
    });

    document.getElementById('expand-all').addEventListener('click', () => {
      cards.forEach((c) => { if (!c.hidden) c.classList.add('expanded'); });
    });
    document.getElementById('collapse-all').addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('expanded'));
    });

    cards.forEach((card) => {
      if (card.dataset.priority === 'P0' && card.dataset.status === 'Open') {
        card.classList.add('expanded');
      }
    });
  </script>
</body>
</html>`;
}

function openInBrowser(url) {
  if (process.platform === 'darwin') {
    execSync(`open "${url}"`);
  } else if (process.platform === 'win32') {
    execSync(`start "" "${url}"`, { shell: true });
  } else {
    execSync(`xdg-open "${url}"`);
  }
}

function startServer(port = 9324) {
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(
      OUTPUT_DIR,
      urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '')
    );

    if (!filePath.startsWith(OUTPUT_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('Serving bug report at:', url);
    openInBrowser(url);
  });

  return server;
}

function main() {
  const useServer = !process.argv.includes('--file');
  const assetMap = prepareAssets();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT, buildHtml(assetMap), 'utf8');

  const imageCount = [...assetMap.values()].reduce((sum, list) => sum + list.length, 0);
  console.log('Created:', OUTPUT);
  console.log('Bugs:', bugs.length);
  console.log('Images copied:', imageCount);

  if (useServer) {
    startServer();
    return;
  }

  openInBrowser(path.resolve(OUTPUT));
  console.log('Opened in browser.');
  if (imageCount === 0) {
    console.log('Tip: add images: ["your-screenshot.png"] to bugs in scripts/bugs-data.js');
  }
}

main();
