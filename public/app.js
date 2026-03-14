// AI Trust Research — App
(async function() {
  const dataDir = './data';

  // Load all data
  async function loadJSON(file) {
    try {
      const res = await fetch(`${dataDir}/${file}?t=${Date.now()}`);
      return await res.json();
    } catch(e) {
      console.warn(`Failed to load ${file}:`, e);
      return null;
    }
  }

  const [meta, logData, papersData, themesData, toolsData] = await Promise.all([
    loadJSON('meta.json'),
    loadJSON('research-log.json'),
    loadJSON('papers.json'),
    loadJSON('themes.json'),
    loadJSON('tools.json'),
  ]);

  // --- Stats ---
  document.getElementById('stat-papers').textContent = meta?.stats?.totalPapers || 0;
  document.getElementById('stat-insights').textContent = meta?.stats?.totalThemes || 0;
  document.getElementById('stat-hours').textContent = meta?.stats?.totalResearchHours || 0;
  document.getElementById('stat-days').textContent = daysSince(meta?.stats?.lastSessionDate);

  // --- Phase ---
  const phase = meta?.currentPhase || 'Initialising';
  document.getElementById('phase-name').textContent = phase.startsWith('Phase') ? phase : `Phase: ${phase}`;
  document.getElementById('phase-desc').textContent = meta?.phaseDescription || '';

  // --- Navigation ---
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      sections.forEach(s => {
        s.classList.toggle('active', s.id === target);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // --- Latest Research (overview) ---
  renderLatestLog(logData);

  // --- Research Log ---
  renderLog(logData);

  // --- Papers ---
  renderPapers(papersData);

  // --- Themes ---
  renderThemes(themesData);

  // --- Tools ---
  renderTools(toolsData);

  // --- Research Questions ---
  renderRQ(meta);

  // === RENDER FUNCTIONS ===

  function renderLatestLog(data) {
    const container = document.getElementById('latest-log');
    if (!container) return;
    const entries = (data?.entries || []).sort((a, b) => b.date.localeCompare(a.date));
    if (entries.length === 0) return; // keep placeholder

    const entry = entries[0];
    container.innerHTML = `
      <div class="log-entry">
        <div class="log-date">
          ${entry.date}
          <span class="session-tag">${entry.sessionType || 'Research Session'}</span>
          ${entry.duration ? `<span class="session-tag">${entry.duration}</span>` : ''}
        </div>
        <h3>${entry.title}</h3>
        <div class="summary">${entry.summary}</div>
      </div>`;
  }

  function renderLog(data) {
    const container = document.getElementById('log-container');
    const entries = data?.entries || [];
    document.getElementById('log-count').textContent = `${entries.length} entries`;

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📖</div>
          <h3>Research begins tonight</h3>
          <p>The first research session runs 1am–5am AEDT. Check back tomorrow morning for the inaugural entry.</p>
        </div>`;
      return;
    }

    container.innerHTML = entries.sort((a, b) => b.date.localeCompare(a.date)).map(entry => `
      <div class="log-entry">
        <div class="log-date">
          ${entry.date}
          <span class="session-tag">${entry.sessionType || 'Research Session'}</span>
          ${entry.duration ? `<span class="session-tag">${entry.duration}</span>` : ''}
        </div>
        <h3>${entry.title}</h3>
        <div class="summary">${entry.summary}</div>
        ${renderSubsections(entry.sections || [])}
      </div>
    `).join('');
  }

  function renderSubsections(sections) {
    return sections.map(s => `
      <div class="log-subsection">
        <h4>${s.title}</h4>
        <ul>${(s.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  function renderPapers(data) {
    const container = document.getElementById('papers-container');
    const papers = data?.papers || [];
    document.getElementById('papers-count').textContent = `${papers.length} papers`;

    if (papers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>No papers yet</h3>
          <p>Papers will be analysed and annotated here as research progresses.</p>
        </div>`;
      return;
    }

    container.innerHTML = papers.sort((a, b) => (b.dateRead || '').localeCompare(a.dateRead || '')).map(p => `
      <div class="paper-card">
        <div class="paper-meta">
          <span class="paper-year">${p.year || 'N/A'}</span>
          <span class="paper-source">${p.source || ''}</span>
          ${p.dateRead ? `<span class="paper-source">Read: ${p.dateRead}</span>` : ''}
        </div>
        <h3>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</h3>
        <div class="paper-authors">${p.authors || ''}</div>
        <div class="paper-analysis">${p.analysis || p.abstract || ''}</div>
        <div class="paper-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          ${p.relevance ? `<span class="tag tag-primary">${p.relevance}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderThemes(data) {
    const container = document.getElementById('themes-container');
    const themes = data?.themes || [];
    document.getElementById('themes-count').textContent = `${themes.length} themes`;

    if (themes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧬</div>
          <h3>Themes emerging</h3>
          <p>As research progresses, recurring themes and patterns will be identified and tracked here.</p>
        </div>`;
      return;
    }

    container.innerHTML = themes.map(t => `
      <div class="theme-card">
        <div class="theme-header">
          <div class="theme-icon" style="background:${t.color || 'var(--accent-soft)'}">${t.icon || '🔍'}</div>
          <h3>${t.title}</h3>
        </div>
        <div class="description">${t.description || ''}</div>
        ${t.keyQuestions ? `
          <div class="key-questions">
            <h4>Key Questions</h4>
            <ul class="rq-list">${t.keyQuestions.map((q, i) => `
              <li><span class="rq-number">${i + 1}</span>${q}</li>
            `).join('')}</ul>
          </div>` : ''}
        ${t.keyPapers ? `
          <div class="log-subsection" style="margin-top:1rem">
            <h4>Key Papers</h4>
            <ul>${t.keyPapers.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>` : ''}
      </div>
    `).join('');
  }

  function renderTools(data) {
    const container = document.getElementById('tools-container');
    const tools = data?.tools || [];
    document.getElementById('tools-count').textContent = `${tools.length} tools`;

    if (tools.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔧</div>
          <h3>Tools landscape</h3>
          <p>AI trust tools, frameworks, and implementations will be catalogued here.</p>
        </div>`;
      return;
    }

    container.innerHTML = tools.map(t => `
      <div class="tool-card">
        <div class="tool-icon">${t.icon || '🛠'}</div>
        <div class="tool-info">
          <h3>${t.url ? `<a href="${t.url}" target="_blank" rel="noopener">${t.name}</a>` : t.name}</h3>
          <div class="tool-desc">${t.description || ''}</div>
          ${t.tags ? `<div class="paper-tags" style="margin-top:0.75rem">${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderRQ(meta) {
    const container = document.getElementById('rq-container');
    const questions = meta?.researchQuestions || [];

    if (questions.length === 0) return;

    container.innerHTML = questions.map((q, i) => `
      <li><span class="rq-number">RQ${i + 1}</span>${q}</li>
    `).join('');
  }

  function daysSince(dateStr) {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const now = new Date();
    return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }
})();
