(async function () {
  const DATA_DIR = './data';
  const PLAYBOOKS_STORAGE_KEY = 'aiTrustReusablePatternsUnlocked';
  const PLAYBOOKS_PASSWORD_HASH = '85eb26be04b0ff35fc873c8c45b9f8d5b4b8060d9df83f8da3c287a4b030c50c';

  const state = {
    activeSection: 'home',
    activeEvidenceTab: 'sessions',
    evidenceQuery: '',
    playbooksUnlocked: localStorage.getItem(PLAYBOOKS_STORAGE_KEY) === '1',
    data: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item';
  }

  function truncate(text, max = 220) {
    const clean = String(text || '').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  function firstSentence(text) {
    const clean = String(text || '').trim();
    const match = clean.match(/^(.+?[.!?])\s/);
    return match ? match[1] : clean;
  }

  async function loadJSON(file) {
    try {
      const res = await fetch(`${DATA_DIR}/${file}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn(`Failed to load ${file}`, error);
      return null;
    }
  }

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function formatDate(dateString) {
    if (!dateString) return 'Undated';
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function friendlyAudienceTitle(section) {
    return String(section.title || section.id || 'Audience').replace(/^For\s+/i, '').trim();
  }

  function urgencyClass(value) {
    if (value === 'act-now') return 'urgency act-now';
    if (value === 'watch') return 'urgency watch';
    return 'urgency build';
  }

  function urgencyLabel(value) {
    if (value === 'act-now') return 'Act now';
    if (value === 'watch') return 'Watch';
    return 'Build';
  }

  function buildMaps(data) {
    return {
      paperMap: Object.fromEntries(data.papers.map((item) => [item.id, item])),
      themeMap: Object.fromEntries(data.themes.map((item) => [item.id, item])),
      toolMap: Object.fromEntries(data.tools.map((item) => [item.id, item])),
      playbookMap: Object.fromEntries(data.playbooks.map((item) => [item.id, item])),
    };
  }

  function normalizeLog(entries) {
    return toArray(entries)
      .map((entry, index) => ({
        raw: entry,
        id: entry.id || `session-${entry.date || 'undated'}-${index + 1}`,
        date: entry.date || '',
        title: entry.title || entry.session || entry.sessionTitle || `Research Session ${index + 1}`,
        summary: entry.summary || '',
        sessionType: entry.sessionType || '',
        duration: entry.duration || '',
        researchQuestions: toArray(entry.researchQuestions),
        sections: toArray(entry.sections || entry.subsections),
        papersRead: toArray(entry.papersRead || entry.sourcesRead),
        themesAdded: toArray(entry.themesAdded),
        toolsAdded: toArray(entry.toolsAdded),
        adviceAdded: entry.adviceAdded || {},
      }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  function getCurrentThesis(meta, latestSession) {
    return {
      statement: 'AI trust is a system of evidence, not a model property.',
      body: latestSession?.summary
        ? firstSentence(latestSession.summary)
        : 'It only holds when provenance, oversight, and monitoring hold.',
      hypotheses: [
        {
          title: 'Claims can certify once',
          body: 'Some properties are fixed enough to check at a point in time.',
        },
        {
          title: 'Behaviour drifts after deployment',
          body: 'Once the system enters the real world, context and workflow change the result.',
        },
        {
          title: 'Trust belongs to the institution',
          body: 'The model matters, but the evidence chain carries the real burden.',
        },
      ],
      falsifiers: [
        'If monitoring never changes the conclusion, the drift thesis is weak.',
        'If human review scales cleanly, the oversight argument gets stronger.',
        'If provenance does not matter, the evidence chain is too heavy.',
      ],
    };
  }

  function renderHome(data, thesis) {
    const latest = data.latestSession;
    const implicationSections = toArray(data.sowhat.sections).slice(0, 2);

    $('home-thesis').textContent = thesis.statement;
    $('home-thesis-body').textContent = 'A living program for institutions that need proof, not posture.';
    $('home-phase').textContent = data.meta.currentPhase || 'Current phase';
    $('home-stat-papers').textContent = `${data.meta.stats?.totalPapers || 0} papers`;
    $('home-stat-themes').textContent = `${data.meta.stats?.totalThemes || 0} themes`;
    $('home-shift').textContent = latest ? `Latest session · ${firstSentence(latest.summary)}` : thesis.body;

    $('home-insight-list').innerHTML = thesis.hypotheses.slice(0, 3).map((item) => `
      <li>
        <strong>${escapeHTML(item.title)}</strong>
        <span>${escapeHTML(item.body)}</span>
      </li>
    `).join('');

    $('home-implications-list').innerHTML = implicationSections.map((section) => {
      const advice = toArray(section.advice)[0];
      return `
        <article class="flat-item">
          <div class="card-kicker">${escapeHTML(friendlyAudienceTitle(section))}</div>
          <h3>${escapeHTML(advice?.headline || section.title)}</h3>
          <p>${escapeHTML(truncate(firstSentence(advice?.body || section.intro || ''), 140))}</p>
          <div class="item-links">
            <button class="text-link" data-target-section="implications" data-target-anchor="audience-${slugify(section.id || section.title)}">Open audience view →</button>
          </div>
        </article>
      `;
    }).join('');

    $('home-latest-session').innerHTML = latest ? `
      <article class="flat-item">
        <div class="session-meta-line">
          <span>${escapeHTML(formatDate(latest.date))}</span>
          ${latest.sessionType ? `<span class="tag">${escapeHTML(latest.sessionType)}</span>` : ''}
          ${latest.duration ? `<span class="tag">${escapeHTML(latest.duration)}</span>` : ''}
        </div>
        <h3>${escapeHTML(latest.title)}</h3>
        <p>${escapeHTML(truncate(firstSentence(latest.summary), 170))}</p>
        <div class="item-links">
          <button class="text-link" data-target-section="thesis">Read the thesis →</button>
          <button class="text-link" data-target-section="evidence" data-target-tab="sessions" data-target-anchor="session-${escapeHTML(latest.id)}">Open session evidence →</button>
        </div>
      </article>
    ` : '<div class="empty-state">No session data found.</div>';
  }

  function renderThesis(thesis, data) {
    $('thesis-statement').textContent = thesis.statement;
    $('thesis-body').textContent = thesis.body;

    const questions = data.latestSession?.researchQuestions?.length ? data.latestSession.researchQuestions : toArray(data.meta.researchQuestions);
    $('thesis-questions').innerHTML = questions.map((question) => `
      <article class="flat-item">
        <p>${escapeHTML(question)}</p>
      </article>
    `).join('');

    $('thesis-hypotheses').innerHTML = thesis.hypotheses.map((item) => `
      <article class="flat-item">
        <h4>${escapeHTML(item.title)}</h4>
        <p>${escapeHTML(item.body)}</p>
      </article>
    `).join('');

    $('falsification-list').innerHTML = thesis.falsifiers.map((item) => `
      <article class="flat-item">
        <p>${escapeHTML(item)}</p>
      </article>
    `).join('');

    const latest = data.latestSession;
    const anchors = [
      ...toArray(latest?.papersRead).slice(0, 3).map((id) => ({ type: 'paper', item: data.maps.paperMap[id] })),
      ...toArray(latest?.themesAdded).slice(0, 2).map((id) => ({ type: 'theme', item: data.maps.themeMap[id] })),
      ...toArray(latest?.toolsAdded).slice(0, 2).map((id) => ({ type: 'tool', item: data.maps.toolMap[id] })),
    ].filter((entry) => entry.item);

    $('thesis-evidence-anchors').innerHTML = anchors.length ? anchors.map(({ type, item }) => {
      const title = type === 'paper' ? item.title : item.name;
      const summary = type === 'paper' ? item.summary : item.description || item.implications;
      const tab = type === 'paper' ? 'papers' : type === 'theme' ? 'themes' : 'tools';
      return `
        <article class="evidence-row">
          <div class="card-kicker">${escapeHTML(type)}</div>
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(truncate(summary || '', 200))}</p>
          <div class="item-links">
            <button class="text-link" data-target-section="evidence" data-target-tab="${tab}" data-target-anchor="${type}-${escapeHTML(item.id)}">Open in evidence →</button>
          </div>
        </article>
      `;
    }).join('') : '<div class="empty-state">No evidence anchors available.</div>';

    $('thesis-shift').innerHTML = latest ? `
      <article class="flat-item">
        <div class="session-meta-line">
          <span>${escapeHTML(formatDate(latest.date))}</span>
          ${latest.sessionType ? `<span class="tag">${escapeHTML(latest.sessionType)}</span>` : ''}
        </div>
        <h3>${escapeHTML(latest.title)}</h3>
        <p>${escapeHTML(truncate(firstSentence(latest.summary), 220))}</p>
        <div class="item-links">
          <button class="text-link" data-target-section="evidence" data-target-tab="sessions" data-target-anchor="session-${escapeHTML(latest.id)}">Open source session →</button>
        </div>
      </article>
    ` : '<div class="empty-state">No latest session found.</div>';
  }

  function renderImplicationCard(item, maps) {
    const paperLinks = toArray(item.citations).map((id) => maps.paperMap[id]).filter(Boolean).slice(0, 4);
    const themeLinks = toArray(item.themes).map((id) => maps.themeMap[id]).filter(Boolean).slice(0, 3);

    return `
      <article class="implication-item">
        <div class="item-title-row">
          <div>
            <h4>${escapeHTML(item.headline)}</h4>
            <div class="badge-row">
              <span class="${urgencyClass(item.urgency)}">${escapeHTML(urgencyLabel(item.urgency))}</span>
            </div>
          </div>
        </div>
        <p>${escapeHTML(item.body)}</p>
        ${item.prompt ? `
          <details class="mini-details">
            <summary class="mini-summary"><span>Why this matters in practice</span></summary>
            <p>${escapeHTML(item.prompt)}</p>
          </details>
        ` : ''}
        <div class="item-links">
          ${paperLinks.map((paper) => `<button class="link-chip" data-target-section="evidence" data-target-tab="papers" data-target-anchor="paper-${escapeHTML(paper.id)}">${escapeHTML(paper.id)}</button>`).join('')}
          ${themeLinks.map((theme) => `<button class="link-chip" data-target-section="evidence" data-target-tab="themes" data-target-anchor="theme-${escapeHTML(theme.id)}">${escapeHTML(theme.id)}</button>`).join('')}
        </div>
      </article>
    `;
  }

  function renderImplications(sections, maps) {
    $('implications-container').innerHTML = sections.map((section) => {
      const advice = toArray(section.advice);
      const primary = advice.slice(0, 2);
      const secondary = advice.slice(2);
      const audienceId = `audience-${slugify(section.id || section.title)}`;

      return `
        <article class="implication-group" id="${audienceId}">
          <div class="implication-group-header">
            <div>
              <div class="card-kicker">${escapeHTML(friendlyAudienceTitle(section))}</div>
              <h3>${escapeHTML(section.title)}</h3>
            </div>
            <button class="text-link" data-target-section="evidence" data-target-tab="themes">Open supporting themes →</button>
          </div>
          <p class="implication-group-intro">${escapeHTML(section.intro || '')}</p>
          <div class="dossier-list">
            ${primary.map((item) => renderImplicationCard(item, maps)).join('')}
          </div>
          ${secondary.length ? `
            <details class="details-block">
              <summary class="details-summary"><span>See ${secondary.length} more recommendations</span></summary>
              <div class="dossier-list">
                ${secondary.map((item) => renderImplicationCard(item, maps)).join('')}
              </div>
            </details>
          ` : ''}
        </article>
      `;
    }).join('');
  }

  function getEvidenceDataset(tab) {
    if (tab === 'papers') return state.data.papers.map((item) => ({ kind: 'paper', item }));
    if (tab === 'themes') return state.data.themes.map((item) => ({ kind: 'theme', item }));
    if (tab === 'tools') return state.data.tools.map((item) => ({ kind: 'tool', item }));
    return state.data.sessions.map((item) => ({ kind: 'session', item }));
  }

  function searchEvidenceItem(entry, query) {
    const { kind, item } = entry;
    const haystack = [];

    if (kind === 'session') {
      haystack.push(item.title, item.summary, item.date, ...item.researchQuestions, ...item.papersRead, ...item.themesAdded, ...item.toolsAdded);
      item.sections.forEach((section) => {
        haystack.push(section.title, ...(Array.isArray(section.items) ? section.items : []), section.body);
      });
    }

    if (kind === 'paper') {
      haystack.push(item.id, item.title, item.summary, item.authors, item.date, item.relevance, item.type);
    }

    if (kind === 'theme') {
      haystack.push(item.id, item.name, item.description, item.implications, ...(item.papers || []));
    }

    if (kind === 'tool') {
      haystack.push(item.id, item.name, item.description, item.source, item.type, item.applicability, item.maturity);
    }

    return haystack.filter(Boolean).join(' ').toLowerCase().includes(query);
  }

  function renderEvidence() {
    const query = state.evidenceQuery.trim().toLowerCase();
    const dataset = getEvidenceDataset(state.activeEvidenceTab);
    const filtered = query ? dataset.filter((item) => searchEvidenceItem(item, query)) : dataset;

    document.querySelectorAll('.evidence-tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === state.activeEvidenceTab);
    });

    $('evidence-summary').innerHTML = `${filtered.length} ${state.activeEvidenceTab} shown${query ? ` for <span class="mono">${escapeHTML(query)}</span>` : ''}`;
    $('evidence-container').innerHTML = filtered.length
      ? filtered.map((entry) => renderEvidenceItem(entry)).join('')
      : '<div class="empty-state">No entries matched that search.</div>';
  }

  function renderEvidenceItem(entry) {
    const { kind, item } = entry;
    if (kind === 'session') return renderSessionItem(item);
    if (kind === 'paper') return renderPaperItem(item);
    if (kind === 'theme') return renderThemeItem(item);
    return renderToolItem(item);
  }

  function renderSessionItem(item) {
    const questionBlock = item.researchQuestions.length ? `
      <details class="details-block">
        <summary class="details-summary"><span>Research questions addressed</span></summary>
        <ul class="bullet-list">${item.researchQuestions.map((question) => `<li>${escapeHTML(question)}</li>`).join('')}</ul>
      </details>
    ` : '';

    const sectionBlock = item.sections.length ? `
      <details class="details-block">
        <summary class="details-summary"><span>Open session notes</span></summary>
        <div class="dossier-list">
          ${item.sections.map((section) => `
            <article class="evidence-row">
              <h4>${escapeHTML(section.title || 'Session block')}</h4>
              ${Array.isArray(section.items) && section.items.length ? `<ul class="bullet-list">${section.items.map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul>` : section.body ? `<p>${escapeHTML(section.body)}</p>` : ''}
            </article>
          `).join('')}
        </div>
      </details>
    ` : '';

    return `
      <article class="evidence-row" id="session-${escapeHTML(item.id)}">
        <div class="session-meta-line">
          <span>${escapeHTML(formatDate(item.date))}</span>
          ${item.sessionType ? `<span class="tag">${escapeHTML(item.sessionType)}</span>` : ''}
          ${item.duration ? `<span class="tag">${escapeHTML(item.duration)}</span>` : ''}
        </div>
        <div class="item-title-row">
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(truncate(item.summary, 340))}</p>
          </div>
        </div>
        <div class="badge-row">
          ${item.papersRead.length ? `<span class="badge">${item.papersRead.length} papers</span>` : ''}
          ${item.themesAdded.length ? `<span class="badge">${item.themesAdded.length} themes</span>` : ''}
          ${item.toolsAdded.length ? `<span class="badge">${item.toolsAdded.length} tools</span>` : ''}
        </div>
        ${questionBlock}
        ${sectionBlock}
        <div class="item-links">
          ${item.papersRead.slice(0, 4).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="papers" data-target-anchor="paper-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
          ${item.themesAdded.slice(0, 4).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="themes" data-target-anchor="theme-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
          ${item.toolsAdded.slice(0, 3).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="tools" data-target-anchor="tool-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
        </div>
      </article>
    `;
  }

  function renderPaperItem(item) {
    return `
      <article class="evidence-row" id="paper-${escapeHTML(item.id)}">
        <div class="item-topline">
          <span>${escapeHTML(item.id)}</span>
          ${item.date ? `<span>${escapeHTML(item.date)}</span>` : ''}
          ${item.type ? `<span class="type-pill">${escapeHTML(item.type)}</span>` : ''}
          ${item.relevance ? `<span class="tag">${escapeHTML(item.relevance)}</span>` : ''}
        </div>
        <div class="item-title-row">
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.authors || '')}</p>
          </div>
        </div>
        <p>${escapeHTML(item.summary || '')}</p>
        <div class="item-links">
          ${item.url ? `<a class="text-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">Open source →</a>` : ''}
        </div>
      </article>
    `;
  }

  function renderThemeItem(item) {
    return `
      <article class="evidence-row" id="theme-${escapeHTML(item.id)}">
        <div class="item-topline">
          <span>${escapeHTML(item.id)}</span>
          ${item.dateAdded ? `<span>${escapeHTML(formatDate(item.dateAdded))}</span>` : ''}
        </div>
        <div class="item-title-row">
          <div>
            <h3>${escapeHTML(item.name)}</h3>
          </div>
        </div>
        <p>${escapeHTML(item.description || '')}</p>
        ${item.implications ? `<details class="details-block"><summary class="details-summary"><span>Implications</span></summary><p>${escapeHTML(item.implications)}</p></details>` : ''}
        <div class="item-links">
          ${toArray(item.papers).slice(0, 5).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="papers" data-target-anchor="paper-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
        </div>
      </article>
    `;
  }

  function renderToolItem(item) {
    return `
      <article class="evidence-row" id="tool-${escapeHTML(item.id)}">
        <div class="item-topline">
          <span>${escapeHTML(item.id)}</span>
          ${item.type ? `<span class="type-pill">${escapeHTML(item.type)}</span>` : ''}
          ${item.source ? `<span>${escapeHTML(item.source)}</span>` : ''}
        </div>
        <div class="item-title-row">
          <div>
            <h3>${escapeHTML(item.name)}</h3>
          </div>
        </div>
        <p>${escapeHTML(item.description || '')}</p>
        <div class="badge-row">
          ${item.maturity ? `<span class="badge">${escapeHTML(item.maturity)}</span>` : ''}
          ${item.applicability ? `<span class="badge">${escapeHTML(truncate(item.applicability, 120))}</span>` : ''}
        </div>
        <div class="item-links">
          ${item.url ? `<a class="text-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">Open source →</a>` : ''}
        </div>
      </article>
    `;
  }

  function renderPlaybooks(playbooks) {
    $('playbooks-container').innerHTML = playbooks.map((item) => `
      <article class="playbook-item" id="playbook-${escapeHTML(item.id)}">
        <div class="playbook-topline">
          <span class="type-pill">${escapeHTML(item.category || 'Pattern')}</span>
          <span class="tag">${escapeHTML(item.reusability || 'usable')}</span>
        </div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.summary || '')}</p>
        ${toArray(item.whenToUse).length ? `<details class="details-block"><summary class="details-summary"><span>When to use it</span></summary><ul class="bullet-list">${toArray(item.whenToUse).slice(0, 3).map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul></details>` : ''}
        <div class="item-links">
          ${toArray(item.evidencePapers).slice(0, 4).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="papers" data-target-anchor="paper-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
          ${toArray(item.themes).slice(0, 3).map((id) => `<button class="link-chip" data-target-section="evidence" data-target-tab="themes" data-target-anchor="theme-${escapeHTML(id)}">${escapeHTML(id)}</button>`).join('')}
        </div>
        ${state.playbooksUnlocked ? `
          <details class="details-block" open>
            <summary class="details-summary"><span>Detailed runbook</span></summary>
            ${toArray(item.howToRun).length ? `<div><p class="card-kicker">How to run</p><ul class="bullet-list">${toArray(item.howToRun).map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul></div>` : ''}
            ${toArray(item.outputs).length ? `<div><p class="card-kicker">Outputs</p><ul class="bullet-list">${toArray(item.outputs).map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul></div>` : ''}
            ${toArray(item.clientLines).length ? `<div><p class="card-kicker">Client lines</p><ul class="bullet-list">${toArray(item.clientLines).map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul></div>` : ''}
            ${toArray(item.watchouts).length ? `<div><p class="card-kicker">Watchouts</p><ul class="bullet-list">${toArray(item.watchouts).map((line) => `<li>${escapeHTML(line)}</li>`).join('')}</ul></div>` : ''}
          </details>
        ` : ''}
      </article>
    `).join('');

    renderPlaybookGate();
  }

  function renderPlaybookGate() {
    const gate = $('playbook-gate');
    if (state.playbooksUnlocked) {
      gate.innerHTML = `
        <div class="gate-panel">
          <p class="card-kicker">Detailed consultation kit</p>
          <p>The detailed runbook layer is visible above. You can lock it again on this browser if you want summary-only mode.</p>
          <div class="gate-form">
            <button class="gate-secondary" id="lock-playbooks">Lock detailed layer</button>
          </div>
        </div>
      `;
      $('lock-playbooks')?.addEventListener('click', () => {
        state.playbooksUnlocked = false;
        localStorage.removeItem(PLAYBOOKS_STORAGE_KEY);
        renderPlaybooks(state.data.playbooks);
      });
      return;
    }

    gate.innerHTML = `
      <div class="gate-panel">
        <p class="card-kicker">Detailed consultation kit</p>
        <p>Summary cards stay public. Detailed facilitation steps, outputs, client lines, and watchouts stay behind a password.</p>
        <form class="gate-form" id="playbook-gate-form">
          <input class="gate-input" id="playbook-password" type="password" autocomplete="current-password" placeholder="Enter password">
          <button class="gate-button" type="submit">Unlock</button>
        </form>
        <div class="gate-error" id="playbook-gate-error"></div>
      </div>
    `;

    $('playbook-gate-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = $('playbook-password').value;
      const hash = await sha256Hex(password);
      if (hash === PLAYBOOKS_PASSWORD_HASH) {
        state.playbooksUnlocked = true;
        localStorage.setItem(PLAYBOOKS_STORAGE_KEY, '1');
        renderPlaybooks(state.data.playbooks);
      } else {
        $('playbook-gate-error').textContent = 'Wrong password.';
      }
    });
  }

  function renderAbout(data) {
    $('about-container').innerHTML = `
      <article class="about-item">
        <p class="card-kicker">What this is</p>
        <p>A living research program on AI trust, assurance, governance, and accountability, aimed at building evidence that serious institutions can actually defend in practice.</p>
      </article>
      <article class="about-item">
        <p class="card-kicker">How it runs</p>
        <ul class="about-list">
          <li>Nightly research sessions pull in papers, standards, tools, and case studies.</li>
          <li>Findings become themes, implications, and reusable patterns.</li>
          <li>The site is updated as a living thesis, not a static archive.</li>
        </ul>
      </article>
      <article class="about-item">
        <p class="card-kicker">Current phase</p>
        <p>${escapeHTML(data.meta.currentPhase || 'Current phase')}</p>
        <p>${escapeHTML(data.meta.phaseDescription || '')}</p>
      </article>
      <article class="about-item">
        <p class="card-kicker">Supervisor direction</p>
        <p>${escapeHTML(data.meta.supervisorFeedback?.feedback || 'No supervisor note available.')}</p>
      </article>
      <article class="about-item">
        <p class="card-kicker">Scope</p>
        <ul class="about-list">
          <li>Trust provenance, certification chains, and proxy failure.</li>
          <li>Meaningful human control for agentic and high-scale systems.</li>
          <li>Liability design, monitoring architecture, and institutional accountability.</li>
          <li>Operational assurance for financial services and other regulated contexts.</li>
        </ul>
      </article>
      <article class="about-item">
        <p class="card-kicker">Next phase goals</p>
        <ul class="about-list">${toArray(data.meta.nextPhaseGoals).map((goal) => `<li>${escapeHTML(goal)}</li>`).join('')}</ul>
      </article>
    `;
  }

  function setMobileNav(open) {
    document.body.classList.toggle('nav-open', open);
    const toggle = document.querySelector('.nav-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  }

  function closeMobileNav() {
    setMobileNav(false);
  }

  function setActiveSection(sectionId, options = {}) {
    state.activeSection = sectionId;
    document.querySelectorAll('.nav-item').forEach((button) => {
      button.classList.toggle('active', button.dataset.section === sectionId);
    });
    document.querySelectorAll('.section').forEach((section) => {
      section.classList.toggle('active', section.id === sectionId);
    });

    if (options.tab) {
      state.activeEvidenceTab = options.tab;
      renderEvidence();
    }

    if (!options.skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeMobileNav();

    if (options.anchorId) {
      setTimeout(() => {
        document.getElementById(options.anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function bindInteractions() {
    document.querySelector('.nav-toggle')?.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('nav-open');
      setMobileNav(!isOpen);
    });

    document.querySelectorAll('.nav-item').forEach((button) => {
      button.addEventListener('click', () => setActiveSection(button.dataset.section));
    });

    document.querySelectorAll('[data-section-link]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setActiveSection(link.dataset.sectionLink || 'home');
      });
    });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-target-section]');
      if (!button) return;
      setActiveSection(button.dataset.targetSection, {
        tab: button.dataset.targetTab,
        anchorId: button.dataset.targetAnchor || null,
      });
    });

    document.querySelectorAll('.evidence-tab').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeEvidenceTab = button.dataset.tab;
        renderEvidence();
      });
    });

    $('evidence-search')?.addEventListener('input', (event) => {
      state.evidenceQuery = event.target.value || '';
      renderEvidence();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) closeMobileNav();
    });
  }

  async function init() {
    const [meta, logData, papersData, themesData, toolsData, sowhatData, playbookData] = await Promise.all([
      loadJSON('meta.json'),
      loadJSON('research-log.json'),
      loadJSON('papers.json'),
      loadJSON('themes.json'),
      loadJSON('tools.json'),
      loadJSON('sowhat.json'),
      loadJSON('reusable-patterns.json'),
    ]);

    const data = {
      meta: meta || {},
      sessions: normalizeLog(logData?.entries || []),
      papers: toArray(papersData?.papers),
      themes: toArray(themesData?.themes),
      tools: toArray(toolsData?.tools),
      sowhat: sowhatData || { sections: [] },
      playbooks: toArray(playbookData?.patterns),
    };

    data.latestSession = data.sessions[0] || { papersRead: [], themesAdded: [], toolsAdded: [], researchQuestions: [] };
    data.maps = buildMaps(data);
    state.data = data;

    const thesis = getCurrentThesis(data.meta, data.latestSession);

    renderHome(data, thesis);
    renderThesis(thesis, data);
    renderImplications(toArray(data.sowhat.sections), data.maps);
    renderEvidence();
    renderPlaybooks(data.playbooks);
    renderAbout(data);
    bindInteractions();
  }

  await init();
})();
