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

  const [meta, logData, papersData, themesData, toolsData, sowhatData] = await Promise.all([
    loadJSON('meta.json'),
    loadJSON('research-log.json'),
    loadJSON('papers.json'),
    loadJSON('themes.json'),
    loadJSON('tools.json'),
    loadJSON('sowhat.json'),
  ]);

  // --- Determine latest session date for NEW badges ---
  const logEntries = (logData?.entries || []).sort((a, b) => b.date.localeCompare(a.date));
  const latestSessionDate = logEntries.length > 0 ? logEntries[0].date : null;

  // --- Stats ---
  document.getElementById('stat-papers').textContent = meta?.stats?.totalPapers || 0;
  document.getElementById('stat-insights').textContent = meta?.stats?.totalThemes || 0;
  document.getElementById('stat-hours').textContent = meta?.stats?.totalResearchHours || 0;
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
  renderPapers(papersData, latestSessionDate);

  // --- Themes ---
  renderThemes(themesData, latestSessionDate);

  // --- Tools ---
  renderTools(toolsData, latestSessionDate);

  // --- Research Questions ---
  renderRQ(meta);

  // --- So What ---
  renderSoWhat(sowhatData, papersData, themesData);

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

  function renderPapers(data, latestDate) {
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

    container.innerHTML = papers.sort((a, b) => (b.dateRead || '').localeCompare(a.dateRead || '')).map(p => {
      const isNew = latestDate && p.dateRead === latestDate;
      return `
      <div class="paper-card${isNew ? ' is-new' : ''}">
        <div class="paper-meta">
          <span class="paper-year">${p.year || 'N/A'}</span>
          <span class="paper-source">${p.source || ''}</span>
          ${p.dateRead ? `<span class="paper-source">Read: ${p.dateRead}</span>` : ''}
          ${isNew ? '<span class="new-badge">NEW</span>' : ''}
        </div>
        <h3>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</h3>
        <div class="paper-authors">${p.authors || ''}</div>
        <div class="paper-analysis">${p.analysis || p.abstract || ''}</div>
        <div class="paper-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          ${p.relevance ? `<span class="tag tag-primary">${p.relevance}</span>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function renderThemes(data, latestDate) {
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

    container.innerHTML = themes.map(t => {
      const isNew = latestDate && (t.dateAdded === latestDate || t.lastUpdated === latestDate);
      return `
      <div class="theme-card${isNew ? ' is-new' : ''}">
        <div class="theme-header">
          <div class="theme-icon" style="background:${t.color || 'var(--accent-soft)'}">${t.icon || '🔍'}</div>
          <h3>${t.title || t.name}${isNew ? ' <span class="new-badge">NEW</span>' : ''}</h3>
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
      </div>`;
    }).join('');
  }

  function renderTools(data, latestDate) {
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

    container.innerHTML = tools.map(t => {
      const isNew = latestDate && (t.dateAdded === latestDate || t.lastUpdated === latestDate);
      return `
      <div class="tool-card${isNew ? ' is-new' : ''}">
        <div class="tool-icon">${t.icon || '🛠'}</div>
        <div class="tool-info">
          <h3>${t.url ? `<a href="${t.url}" target="_blank" rel="noopener">${t.name}</a>` : t.name}${isNew ? ' <span class="new-badge">NEW</span>' : ''}</h3>
          <div class="tool-desc">${t.description || ''}</div>
          ${t.tags ? `<div class="paper-tags" style="margin-top:0.75rem">${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function renderRQ(meta) {
    const container = document.getElementById('rq-container');
    const questions = meta?.researchQuestions || [];

    if (questions.length === 0) return;

    container.innerHTML = questions.map((q, i) => `
      <li><span class="rq-number">RQ${i + 1}</span>${q}</li>
    `).join('');
  }

  function renderSoWhat(data, papersData, themesData) {
    const container = document.getElementById('sowhat-container');
    const updatedEl = document.getElementById('sowhat-updated');
    if (!container) return;

    const sections = data?.sections || [];
    if (sections.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>Coming soon</h3>
          <p>Actionable insights will appear here as the research corpus grows.</p>
        </div>`;
      return;
    }

    const paperMap = {};
    (papersData?.papers || []).forEach(p => { paperMap[p.id] = p; });
    const themeMap = {};
    (themesData?.themes || []).forEach(t => { themeMap[t.id] = t; });

    const urgencyLabel = {
      'act-now': '🔴 Act Now',
      'watch': '🟡 Watch',
      'awareness': '🟢 Awareness'
    };

    const totalAdvice = sections.reduce((sum, s) => sum + (s.advice?.length || 0), 0);
    document.getElementById('sowhat-count').textContent = `${totalAdvice} recommendations`;

    container.innerHTML = sections.map(section => `
      <div class="sowhat-section">
        <div class="sowhat-section-header">
          <span class="sowhat-icon">${section.icon || '📌'}</span>
          <div>
            <h3>${section.title}</h3>
            <p class="sowhat-section-intro">${section.intro}</p>
          </div>
        </div>
        <div class="sowhat-cards">
          ${(section.advice || []).map(item => `
            <div class="sowhat-card urgency-${item.urgency || 'watch'}">
              <div class="sowhat-card-header">
                <span class="urgency-badge ${item.urgency || 'watch'}">${urgencyLabel[item.urgency] || '🟡 Watch'}</span>
              </div>
              <h4>${item.headline}</h4>
              <p>${item.body}</p>
              ${item.prompt ? `
              <div class="sowhat-prompt">
                <div class="prompt-label">💬 Reflect</div>
                <p class="prompt-text">${item.prompt}</p>
              </div>` : ''}
              <div class="sowhat-citations">
                ${(item.citations || []).map(cid => {
                  const paper = paperMap[cid];
                  if (!paper) return '';
                  return `<a href="${paper.url || '#'}" target="_blank" rel="noopener" class="citation-link" title="${paper.title}">${paper.title.length > 60 ? paper.title.substring(0, 57) + '...' : paper.title} (${paper.year || ''})</a>`;
                }).join('')}
              </div>
              ${(item.themes || []).length > 0 ? `
                <div class="sowhat-themes">
                  ${item.themes.map(tid => {
                    const theme = themeMap[tid];
                    return theme ? `<span class="tag">${theme.title || theme.name}</span>` : '';
                  }).join('')}
                </div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    if (updatedEl && data?.lastUpdated) {
      updatedEl.textContent = `Last updated: ${data.lastUpdated}`;
    }
  }

})();
