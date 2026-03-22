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

  // --- Visual Views (lazy-rendered when toggled visible) ---
  let themesGraphRendered = false;
  let sowhatMatrixRendered = false;

  function ensureThemesGraph() {
    if (!themesGraphRendered) {
      themesGraphRendered = true;
      // Ensure container is momentarily visible so D3 can measure
      const c = document.getElementById('themes-graph-container');
      if (c) {
        c.style.visibility = 'hidden';
        c.classList.add('active');
        renderThemesGraph(themesData, papersData);
        c.style.visibility = '';
      }
    }
  }

  function ensureSoWhatMatrix() {
    if (!sowhatMatrixRendered) {
      sowhatMatrixRendered = true;
      renderSoWhatMatrix(sowhatData, papersData, themesData);
    }
  }

  initViewToggles(ensureThemesGraph, ensureSoWhatMatrix);

  // === SHARED HELPERS ===

  // Build global paper lookup map
  const _paperMap = {};
  (papersData?.papers || []).forEach(p => { _paperMap[p.id] = p; });

  // Render a paper ID or title as a hyperlink. Falls back to plain text.
  function paperLink(pidOrTitle, opts = {}) {
    const p = _paperMap[pidOrTitle];
    if (p) {
      const title = opts.short && p.title.length > 60 ? p.title.substring(0, 57) + '...' : p.title;
      const label = opts.showYear !== false ? `${title} (${p.year || ''})` : title;
      return `<a href="${p.url || '#'}" target="_blank" rel="noopener" class="paper-link" title="${p.title}">${label}</a>`;
    }
    // Not an ID — it's a plain title string. Try fuzzy match by title substring.
    const match = (papersData?.papers || []).find(pp =>
      pidOrTitle.toLowerCase().includes(pp.title.toLowerCase().substring(0, 30)) ||
      pp.title.toLowerCase().includes(pidOrTitle.toLowerCase().substring(0, 30))
    );
    if (match && match.url) {
      return `<a href="${match.url}" target="_blank" rel="noopener" class="paper-link" title="${match.title}">${pidOrTitle}</a>`;
    }
    return pidOrTitle; // plain text fallback
  }

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
            <ul>${t.keyPapers.map(p => `<li>${paperLink(p)}</li>`).join('')}</ul>
          </div>` : ''}
        ${!t.keyPapers && t.relatedPapers && t.relatedPapers.length ? `
          <div class="theme-papers" style="margin-top:1rem">
            <div class="sowhat-citations">
              ${t.relatedPapers.map(pid => {
                const p = _paperMap[pid];
                if (!p) return '';
                return `<a href="${p.url || '#'}" target="_blank" rel="noopener" class="citation-link" title="${p.title}">${p.title.length > 55 ? p.title.substring(0, 52) + '...' : p.title}</a>`;
              }).join('')}
            </div>
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
                  const p = _paperMap[cid];
                  if (!p) return '';
                  return `<a href="${p.url || '#'}" target="_blank" rel="noopener" class="citation-link" title="${p.title}">${p.title.length > 60 ? p.title.substring(0, 57) + '...' : p.title} (${p.year || ''})</a>`;
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

  // === THEMES NETWORK GRAPH ===
  function renderThemesGraph(data, papersData) {
    const container = document.getElementById('themes-graph-container');
    if (!container) return;
    const themes = data?.themes || [];
    if (themes.length === 0) return;

    const confidenceColor = {
      'very high': '#4ade80',
      'high': '#60a5fa',
      'medium-high': '#a78bfa',
      'medium': '#fbbf24',
      'low': '#f87171'
    };

    // Build nodes
    const nodes = themes.map(t => ({
      id: t.id,
      name: t.name || t.title,
      description: t.description || '',
      evidence: t.evidence || [],
      implications: t.implications || '',
      keyQuestions: t.keyQuestions || [],
      relatedPapers: t.relatedPapers || [],
      confidence: t.confidence || 'medium',
      radius: Math.max(12, Math.min(40, 8 + (t.relatedPapers || []).length * 4)),
      color: confidenceColor[t.confidence] || '#fbbf24'
    }));

    // Build edges — themes connected when they share relatedPapers
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const shared = nodes[i].relatedPapers.filter(p => nodes[j].relatedPapers.includes(p));
        if (shared.length > 0) {
          links.push({ source: nodes[i].id, target: nodes[j].id, weight: shared.length });
        }
      }
    }

    // Build graph HTML
    container.innerHTML = `
      <div class="themes-graph" id="themes-graph-svg-wrap">
        <div class="graph-tooltip" id="graph-tooltip"></div>
      </div>
      <div class="graph-legend">
        <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#4ade80"></div>Very High</div>
        <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#60a5fa"></div>High</div>
        <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#a78bfa"></div>Medium-High</div>
        <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#fbbf24"></div>Medium</div>
        <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#f87171"></div>Low</div>
        <div class="graph-legend-item" style="margin-left:auto;font-size:0.7rem;color:var(--text-muted)">Node size = paper count · Click a node for details</div>
      </div>
      <div id="graph-detail-panel"></div>
    `;

    const wrap = document.getElementById('themes-graph-svg-wrap');
    const tooltip = document.getElementById('graph-tooltip');
    const detailPanel = document.getElementById('graph-detail-panel');
    const width = wrap.clientWidth || 900;
    const height = wrap.clientHeight || 600;

    const svg = d3.select(wrap).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(d => d.weight * 0.15))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 6))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(124,107,240,0.2)')
      .attr('stroke-width', d => Math.max(1, d.weight))
      .attr('stroke-opacity', 0);

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.85)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3)
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Labels (short names)
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.name.length > 25 ? d.name.substring(0, 22) + '...' : d.name)
      .attr('font-size', '9px')
      .attr('fill', '#e8e8f0')
      .attr('fill-opacity', 0)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 14)
      .attr('pointer-events', 'none');

    // Animate in
    node.transition().duration(800).delay((d, i) => i * 30)
      .attr('r', d => d.radius);
    link.transition().duration(600).delay(400)
      .attr('stroke-opacity', 1);
    label.transition().duration(600).delay(800)
      .attr('fill-opacity', 0.7);

    // Hover
    node.on('mouseover', function(event, d) {
      tooltip.innerHTML = `<strong>${d.name}</strong><div class="tooltip-confidence">${d.confidence} confidence · ${d.relatedPapers.length} papers</div>`;
      tooltip.classList.add('visible');

      // Highlight connected
      const connected = new Set();
      links.forEach(l => {
        const sid = typeof l.source === 'object' ? l.source.id : l.source;
        const tid = typeof l.target === 'object' ? l.target.id : l.target;
        if (sid === d.id) connected.add(tid);
        if (tid === d.id) connected.add(sid);
      });
      connected.add(d.id);

      node.attr('fill-opacity', n => connected.has(n.id) ? 1 : 0.15)
        .attr('stroke-opacity', n => connected.has(n.id) ? 0.8 : 0.05);
      link.attr('stroke-opacity', l => {
        const sid = typeof l.source === 'object' ? l.source.id : l.source;
        const tid = typeof l.target === 'object' ? l.target.id : l.target;
        return (sid === d.id || tid === d.id) ? 0.8 : 0.05;
      });
      label.attr('fill-opacity', n => connected.has(n.id) ? 1 : 0.1);

      d3.select(this).attr('stroke-width', 4).attr('stroke-opacity', 1);
    })
    .on('mousemove', function(event) {
      const rect = wrap.getBoundingClientRect();
      tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (event.clientY - rect.top - 10) + 'px';
    })
    .on('mouseout', function() {
      tooltip.classList.remove('visible');
      node.attr('fill-opacity', 0.85).attr('stroke-width', 2).attr('stroke-opacity', 0.3);
      link.attr('stroke-opacity', 1);
      label.attr('fill-opacity', 0.7);
    });

    // Click — show detail panel
    node.on('click', function(event, d) {
      const relatedPaperLinks = d.relatedPapers.map(pid => paperLink(pid, { showYear: true }));

      detailPanel.innerHTML = `
        <div class="graph-detail-panel">
          <button class="graph-detail-close" onclick="this.closest('.graph-detail-panel').remove()">Close</button>
          <h3>${d.name}</h3>
          <div class="description">${d.description}</div>
          ${d.keyQuestions.length ? `
            <div class="detail-section">
              <h4>Key Questions</h4>
              <ul>${d.keyQuestions.map(q => `<li>${q}</li>`).join('')}</ul>
            </div>` : ''}
          ${d.evidence.length ? `
            <div class="detail-section">
              <h4>Evidence</h4>
              <ul>${d.evidence.map(e => `<li>${e}</li>`).join('')}</ul>
            </div>` : ''}
          ${relatedPaperLinks.length ? `
            <div class="detail-section">
              <h4>Related Papers (${relatedPaperLinks.length})</h4>
              <ul>${relatedPaperLinks.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>` : ''}
          ${d.implications ? `
            <div class="detail-section">
              <h4>Implications</h4>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.6;padding-left:0">${d.implications}</p>
            </div>` : ''}
        </div>`;
      detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Tick
    simulation.on('tick', () => {
      // Keep nodes within bounds
      nodes.forEach(d => {
        d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
        d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
      });

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);
      label.attr('x', d => d.x).attr('y', d => d.y);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }

  // === SO WHAT URGENCY MATRIX ===
  function renderSoWhatMatrix(data, papersData, themesData) {
    const container = document.getElementById('sowhat-matrix-container');
    if (!container) return;

    const sections = data?.sections || [];
    if (sections.length === 0) return;

    const paperMap = {};
    (papersData?.papers || []).forEach(p => { paperMap[p.id] = p; });
    const themeMap = {};
    (themesData?.themes || []).forEach(t => { themeMap[t.id] = t; });

    const sectionMeta = {};
    sections.forEach(s => { sectionMeta[s.id] = { title: s.title, icon: s.icon || '📌' }; });

    // Flatten all advice with section info
    const allAdvice = [];
    sections.forEach(section => {
      (section.advice || []).forEach(item => {
        allAdvice.push({ ...item, sectionId: section.id, sectionTitle: section.title, sectionIcon: section.icon || '📌' });
      });
    });

    // Group by urgency
    const byUrgency = { 'act-now': [], 'watch': [], 'awareness': [] };
    allAdvice.forEach(a => {
      const u = a.urgency || 'watch';
      if (!byUrgency[u]) byUrgency[u] = [];
      byUrgency[u].push(a);
    });

    // Counts
    const total = allAdvice.length;
    const urgencyCounts = { 'act-now': byUrgency['act-now'].length, 'watch': byUrgency['watch'].length, 'awareness': byUrgency['awareness'].length };
    const audienceCounts = {};
    sections.forEach(s => { audienceCounts[s.title] = (s.advice || []).length; });

    // Render stats
    const statsHTML = `
      <div class="matrix-stats">
        <div class="matrix-stat">
          <div class="stat-value" style="color:var(--text-primary)">${total}</div>
          <div class="stat-label">Total Recs</div>
        </div>
        <div class="matrix-stat">
          <div class="stat-value" style="color:var(--red)">${urgencyCounts['act-now']}</div>
          <div class="stat-label">Act Now</div>
        </div>
        <div class="matrix-stat">
          <div class="stat-value" style="color:var(--amber)">${urgencyCounts['watch']}</div>
          <div class="stat-label">Watch</div>
        </div>
        <div class="matrix-stat">
          <div class="stat-value" style="color:var(--green)">${urgencyCounts['awareness']}</div>
          <div class="stat-label">Awareness</div>
        </div>
        ${Object.entries(audienceCounts).map(([title, count]) => `
          <div class="matrix-stat">
            <div class="stat-value" style="color:var(--accent)">${count}</div>
            <div class="stat-label">${title.replace(/^For\s+/i, '').substring(0, 25)}</div>
          </div>
        `).join('')}
      </div>
    `;

    function renderColumn(urgency, label, items) {
      // Group items by section
      const bySec = {};
      items.forEach(item => {
        if (!bySec[item.sectionId]) bySec[item.sectionId] = [];
        bySec[item.sectionId].push(item);
      });

      const groupsHTML = Object.entries(bySec).map(([secId, items]) => {
        const meta = sectionMeta[secId] || { title: secId, icon: '📌' };
        return `
          <div class="matrix-audience-group">
            <div class="matrix-audience-label">${meta.icon} ${meta.title.replace(/^For\s+/i, '')}</div>
            ${items.map(item => {
              const citationsHTML = (item.citations || []).map(cid => {
                const paper = paperMap[cid];
                if (!paper) return '';
                return `<a href="${paper.url || '#'}" target="_blank" rel="noopener" class="citation-link" title="${paper.title}">${paper.title.length > 50 ? paper.title.substring(0, 47) + '...' : paper.title} (${paper.year || ''})</a>`;
              }).join('');

              return `
              <div class="matrix-item" data-item-id="${item.id}">
                <div class="matrix-item-header">
                  <span class="matrix-item-icon">${meta.icon}</span>
                  <span class="matrix-item-headline">${item.headline}</span>
                </div>
                <div class="matrix-item-detail">
                  <p>${item.body}</p>
                  ${item.prompt ? `
                    <div class="sowhat-prompt">
                      <div class="prompt-label">Reflect</div>
                      <p class="prompt-text">${item.prompt}</p>
                    </div>` : ''}
                  ${citationsHTML ? `<div class="sowhat-citations">${citationsHTML}</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>`;
      }).join('');

      return `
        <div class="matrix-column ${urgency}">
          <div class="matrix-column-header">
            <span>${label}</span>
            <span class="col-count">${items.length}</span>
          </div>
          <div class="matrix-column-body">
            ${groupsHTML || '<div style="padding:1rem;color:var(--text-muted);font-size:0.8rem;text-align:center">No items</div>'}
          </div>
        </div>`;
    }

    container.innerHTML = `
      ${statsHTML}
      <div class="matrix-columns">
        ${renderColumn('act-now', 'Act Now', byUrgency['act-now'])}
        ${renderColumn('watch', 'Watch', byUrgency['watch'])}
        ${renderColumn('awareness', 'Awareness', byUrgency['awareness'])}
      </div>
    `;

    // Click to expand/collapse items
    container.querySelectorAll('.matrix-item').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('expanded');
      });
    });
  }

  // === VIEW TOGGLE WIRING ===
  function initViewToggles(onThemesVisual, onSowhatVisual) {
    setupToggle('themes', 'themes-view-toggle', 'themes-container', 'themes-graph-container', onThemesVisual);
    setupToggle('sowhat', 'sowhat-view-toggle', 'sowhat-container', 'sowhat-matrix-container', onSowhatVisual);
  }

  function setupToggle(key, toggleId, listContainerId, visualContainerId, onVisualCb) {
    const toggle = document.getElementById(toggleId);
    const listContainer = document.getElementById(listContainerId);
    const visualContainer = document.getElementById(visualContainerId);
    if (!toggle || !listContainer || !visualContainer) return;

    const storageKey = `aitrust-view-${key}`;
    const saved = localStorage.getItem(storageKey);

    function setView(view) {
      const buttons = toggle.querySelectorAll('button');
      buttons.forEach(b => b.classList.toggle('active', b.dataset.view === view));

      if (view === 'visual') {
        if (onVisualCb) onVisualCb();
        listContainer.style.display = 'none';
        visualContainer.classList.add('active');
      } else {
        listContainer.style.display = '';
        visualContainer.classList.remove('active');
      }
      localStorage.setItem(storageKey, view);
    }

    // Wire buttons
    toggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    // Restore saved view
    if (saved === 'visual') {
      setView('visual');
    }
  }

})();
