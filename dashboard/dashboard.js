/* ============================================================
   Language Content Dashboard — Client Logic
   ============================================================
   - Loads JSON data from data/*.json
   - Renders overview + per-language detail views
   - Supports filtering, search, expansion of wiki materials and stages
   ============================================================ */

const DATA_BASE = './data';
const STATE = {
  activeTab: 'overview',
  activeLang: null,
  detailTab: 'corpus',
  filterText: '',
  filterTier: null,
  expandedSections: new Set(),
};

let DATA = { overview: null, langs: {} };

/* ---------- Data Loading ---------- */

async function loadData() {
  try {
    // Load overview
    const overviewRes = await fetch(`${DATA_BASE}/overview.json`);
    DATA.overview = await overviewRes.json();

    // Load all language data in parallel
    const langCodes = ['en', 'jp', 'es', 'kr'];
    await Promise.all(
      langCodes.map(async (code) => {
        const res = await fetch(`${DATA_BASE}/${code}.json`);
        DATA.langs[code] = await res.json();
      })
    );

    render();
  } catch (err) {
    console.error('Failed to load data:', err);
    document.getElementById('content').innerHTML = `
      <div class="empty">
        ❌ 데이터를 불러올 수 없습니다.<br />
        <code>python dashboard/generate_data.py</code>를 먼저 실행하세요.
      </div>`;
  }
}

/* ---------- Top-level tabs ---------- */

function renderTabs() {
  const tabsEl = document.getElementById('tabs');
  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'en', label: '🇺🇸 English', flag: true },
    { key: 'jp', label: '🇯🇵 日本語', flag: true },
    { key: 'es', label: '🇪🇸 Español', flag: true },
    { key: 'kr', label: '🇰🇷 한국어', flag: true },
  ];

  tabsEl.innerHTML = tabs
    .map(
      (t) => `
      <button class="tab ${STATE.activeTab === t.key ? 'active' : ''}" data-tab="${t.key}">
        ${t.label}
      </button>
    `
    )
    .join('');

  tabsEl.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      STATE.activeTab = btn.dataset.tab;
      STATE.activeLang = btn.dataset.tab === 'overview' ? null : btn.dataset.tab;
      render();
    });
  });
}

/* ---------- Render dispatcher ---------- */

function render() {
  renderTabs();
  renderMeta();

  const contentEl = document.getElementById('content');
  if (STATE.activeTab === 'overview') {
    contentEl.innerHTML = renderOverview();
    attachOverviewEvents();
  } else {
    contentEl.innerHTML = renderLangDetail(STATE.activeTab);
    attachLangDetailEvents();
  }
}

function renderMeta() {
  const meta = document.getElementById('meta');
  if (!DATA.overview) {
    meta.textContent = 'Loading...';
    return;
  }
  meta.innerHTML = `
    생성: ${new Date(DATA.overview.generated_at).toLocaleString('ko-KR')}
    · ${DATA.overview.totals.stages} 스테이지
    · ${DATA.overview.totals.corpus} 코퍼스
    · ${DATA.overview.totals.wiki_materials} 학습자료
    · ${DATA.overview.totals.raw_sources} 원본소스
  `;
}

/* ============================================================
   Overview view
   ============================================================ */

function renderOverview() {
  const o = DATA.overview;
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">언어</div>
        <div class="value">${o.languages.length}</div>
        <div class="delta">${o.languages.map((l) => l.flag).join(' ')}</div>
      </div>
      <div class="stat-card">
        <div class="label">스테이지</div>
        <div class="value">${o.totals.stages}</div>
        <div class="delta">6 티어 × 4 언어</div>
      </div>
      <div class="stat-card">
        <div class="label">게임 코퍼스</div>
        <div class="value">${o.totals.corpus}</div>
        <div class="delta">단어 + 문장 + 캐릭터</div>
      </div>
      <div class="stat-card">
        <div class="label">학습 자료</div>
        <div class="value">${o.totals.wiki_materials}</div>
        <div class="delta">위키 페이지</div>
      </div>
      <div class="stat-card">
        <div class="label">원본 소스</div>
        <div class="value">${o.totals.raw_sources}</div>
        <div class="delta">언어별 자료</div>
      </div>
      <div class="stat-card">
        <div class="label">단어장</div>
        <div class="value">${o.totals.vocab_words}</div>
        <div class="delta">위키 vocabulary/</div>
      </div>
      <div class="stat-card">
        <div class="label">표현집</div>
        <div class="value">${o.totals.expressions}</div>
        <div class="delta">위키 expressions/</div>
      </div>
      <div class="stat-card">
        <div class="label">문화 노트</div>
        <div class="value">${o.totals.culture}</div>
        <div class="delta">위키 culture/</div>
      </div>
    </div>

    <div class="section-title">
      <span class="icon">📚</span>
      언어별 현황
    </div>

    <div class="lang-grid">
      ${o.languages.map((lang) => renderLangTile(lang)).join('')}
    </div>

    ${renderCrossLangStageMap()}

    <div class="section-title">
      <span class="icon">🎮</span>
      티어별 스테이지 분포
    </div>
    <div class="lang-grid">
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (tier) => `
        <div class="stat-card">
          <div class="label">Tier ${tier}</div>
          <div class="value">${o.tiers[tier] || 0}</div>
          <div class="delta">${getTierName(tier)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function getTierName(tier) {
  const names = {
    0: '문자',
    1: '단어',
    2: '단어 확장',
    3: '짧은 문장',
    4: '긴 문장',
    5: '단락',
  };
  return names[tier] || '';
}

function renderLangTile(lang) {
  const s = lang.stats;
  return `
    <div class="lang-tile" data-code="${lang.code}">
      <div class="lang-tile-head">
        <div>
          <span class="flag">${lang.flag}</span>
          <span class="name">${lang.name}</span>
          <span class="native">${lang.native}</span>
        </div>
      </div>
      <div class="lang-tile-stats">
        <div class="lang-tile-stat">
          <strong>${s.stages}</strong>스테이지
        </div>
        <div class="lang-tile-stat">
          <strong>${s.corpus_total}</strong>코퍼스
        </div>
        <div class="lang-tile-stat">
          <strong>${s.coverage_percent}%</strong>커버리지
        </div>
        <div class="lang-tile-stat">
          <strong>${s.vocab_wiki}</strong>단어장
        </div>
        <div class="lang-tile-stat">
          <strong>${s.expressions_wiki}</strong>표현
        </div>
        <div class="lang-tile-stat">
          <strong>${s.culture_wiki}</strong>문화
        </div>
      </div>
      ${
        s.gaps > 0
          ? `<div style="margin-top:8px;font-size:11px;color:var(--warn)">⚠️ ${s.gaps}개 스테이지 코퍼스 부족</div>`
          : ''
      }
    </div>
  `;
}

function attachOverviewEvents() {
  document.querySelectorAll('.lang-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      STATE.activeTab = tile.dataset.code;
      STATE.activeLang = tile.dataset.code;
      render();
    });
  });
}

/* ============================================================
   Language detail view
   ============================================================ */

function renderLangDetail(code) {
  const data = DATA.langs[code];
  if (!data) return '<div class="empty">데이터 없음</div>';

  const m = data.meta;
  const c = data.coverage;

  return `
    <div class="lang-detail">
      <div class="lang-detail-head">
        <span class="flag">${m.flag}</span>
        <div>
          <span class="name">${m.name}</span>
          <span class="native">${m.native}</span>
        </div>
        <div class="back" data-action="back">← Overview로 돌아가기</div>
      </div>

      ${renderGapsWarning(data)}

      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">스테이지</div>
          <div class="value">${c.total_stages}</div>
        </div>
        <div class="stat-card">
          <div class="label">게임 코퍼스</div>
          <div class="value">${data.corpus.total}</div>
          <div class="delta">
            단어 ${data.corpus.by_type.words} · 문장 ${data.corpus.by_type.sentences}
          </div>
        </div>
        <div class="stat-card">
          <div class="label">학습 자료</div>
          <div class="value">${c.wiki_materials}</div>
          <div class="delta">
            단어 ${data.wiki.vocabulary.length} · 표현 ${data.wiki.expressions.length}
          </div>
        </div>
        <div class="stat-card">
          <div class="label">원본 소스</div>
          <div class="value">${data.raw_sources.length}</div>
          <div class="delta">${data.wiki.sources.length} 위키 + ${data.raw_sources.length} raw</div>
        </div>
        <div class="stat-card">
          <div class="label">코퍼스 커버리지</div>
          <div class="value">${c.coverage_percent}%</div>
          <div class="coverage-bar">
            <div class="fill" style="width:${Math.min(c.coverage_percent, 100)}%"></div>
          </div>
        </div>
      </div>

      <!-- Detail sub-tabs -->
      <div class="detail-tabs" id="detailTabs">
        <button class="detail-tab ${STATE.detailTab === 'structure' ? 'active' : ''}" data-dtab="structure">
          🗺️ 구조
        </button>
        <button class="detail-tab ${STATE.detailTab === 'corpus' ? 'active' : ''}" data-dtab="corpus">
          📖 코퍼스 vs 학습자료
        </button>
        <button class="detail-tab ${STATE.detailTab === 'stages' ? 'active' : ''}" data-dtab="stages">
          🎮 스테이지
        </button>
        <button class="detail-tab ${STATE.detailTab === 'wiki' ? 'active' : ''}" data-dtab="wiki">
          📚 위키 학습자료
        </button>
        <button class="detail-tab ${STATE.detailTab === 'sources' ? 'active' : ''}" data-dtab="sources">
          📄 원본 소스
        </button>
      </div>

      <div id="detailContent">
        ${renderDetailTab(data)}
      </div>
    </div>
  `;
}

function renderGapsWarning(data) {
  const gaps = data.coverage.gaps;
  if (gaps.length === 0) return '';

  return `
    <div class="gaps-warning">
      <div class="title">⚠️ 코퍼스 부족 스테이지 (${gaps.length}개)</div>
      ${gaps
        .slice(0, 5)
        .map(
          (g) => `
        <div class="gap-item">
          <strong>${g.stage_name}</strong>: ${g.available}/${g.needed} (부족: ${g.shortfall})
          ${g.categories.length ? `[${g.categories.join(', ')}]` : ''}
        </div>
      `
        )
        .join('')}
      ${gaps.length > 5 ? `<div class="gap-item">… 외 ${gaps.length - 5}개</div>` : ''}
    </div>
  `;
}

function renderDetailTab(data) {
  switch (STATE.detailTab) {
    case 'structure':
      return renderStageStructure(data);
    case 'corpus':
      return renderCorpusCompare(data);
    case 'stages':
      return renderStages(data);
    case 'wiki':
      return renderWiki(data);
    case 'sources':
      return renderSources(data);
    default:
      return '';
  }
}

/* ----- Corpus vs Learning materials comparison ----- */

function renderCorpusCompare(data) {
  const corpus = data.corpus;
  const wiki = data.wiki;

  return `
    <div class="compare-grid">
      <!-- Game corpus column -->
      <div class="compare-col">
        <div class="compare-col-head">
          <div class="title">🎮 게임 코퍼스 후보</div>
          <div class="count">${corpus.total}개</div>
        </div>
        <div class="compare-col-body">
          <div style="margin-bottom:12px">
            <div style="font-size:11px;color:var(--text-3);margin-bottom:6px">레벨별 분포</div>
            ${Object.entries(corpus.by_level)
              .map(
                ([lvl, count]) => `
              <div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:12px">
                <span>Lv ${lvl}</span>
                <strong>${count}개</strong>
              </div>
            `
              )
              .join('')}
          </div>

          <div style="margin-bottom:12px">
            <div style="font-size:11px;color:var(--text-3);margin-bottom:6px">카테고리</div>
            ${Object.entries(corpus.by_category)
              .slice(0, 10)
              .map(
                ([cat, count]) => `
              <div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:12px">
                <span>${cat}</span>
                <strong>${count}</strong>
              </div>
            `
              )
              .join('')}
          </div>

          <div>
            <div style="font-size:11px;color:var(--text-3);margin-bottom:6px">샘플 (단어)</div>
            ${corpus.words_sample.length === 0 ? '<div class="empty">데이터 없음</div>' : ''}
            ${corpus.words_sample
              .map(
                (w) => `
              <div class="corpus-sample">
                <div class="display">${escapeHtml(w.display)}</div>
                <div class="meta">
                  ${w.meaning ? escapeHtml(w.meaning) : ''}
                  · Lv ${w.level || '?'}
                  · ${w.category || 'etc'}
                  · <code>${w.id}</code>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          ${
            corpus.sentences_sample.length > 0
              ? `
            <div style="margin-top:16px">
              <div style="font-size:11px;color:var(--text-3);margin-bottom:6px">샘플 (문장)</div>
              ${corpus.sentences_sample
                .map(
                  (s) => `
                <div class="corpus-sample">
                  <div class="display">${escapeHtml(s.display)}</div>
                  <div class="meta">
                    Lv ${s.level || '?'} · ${s.category || ''} · <code>${s.id}</code>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Wiki learning materials column -->
      <div class="compare-col">
        <div class="compare-col-head">
          <div class="title">📚 학습 자료 (위키)</div>
          <div class="count">${wiki.vocabulary.length + wiki.expressions.length}개</div>
        </div>
        <div class="compare-col-body">
          <div class="section-title" style="margin-top:0">
            <span class="icon">📖</span>
            어휘 (Vocabulary)
            <span class="badge">${wiki.vocabulary.length}</span>
          </div>
          ${renderFileList(wiki.vocabulary, 'wiki')}

          <div class="section-title">
            <span class="icon">💬</span>
            표현 (Expressions)
            <span class="badge">${wiki.expressions.length}</span>
          </div>
          ${renderFileList(wiki.expressions, 'wiki')}

          <div class="section-title">
            <span class="icon">🌏</span>
            문화 (Culture)
            <span class="badge">${wiki.culture.length}</span>
          </div>
          ${renderFileList(wiki.culture, 'wiki')}
        </div>
      </div>
    </div>
  `;
}

/* ----- Stage Structure view ----- */

function renderStageStructure(data) {
  const stages = data.stages;
  const tiers = [0, 1, 2, 3, 4, 5];

  // Group stages by tier
  const byTier = {};
  for (const t of tiers) {
    byTier[t] = stages.filter((s) => s.tier === t);
  }

  const tierLabels = {
    0: 'T0 · 문자 (Kana)',
    1: 'T1 · 단어 (Basic)',
    2: 'T2 · 확장 (Extended)',
    3: 'T3 · 문장 (Sentences)',
    4: 'T4 · 긴 문장 (Long)',
    5: 'T5 · 단락 (Passages)',
  };

  return `
    <div class="stage-structure-grid">
      ${tiers
        .map((tier) => {
          const tierStages = byTier[tier] || [];
          return `
          <div class="stage-structure-tier tier-${tier}">
            <div class="stage-structure-tier-label">
              <span class="tier-dot"></span>
              ${tierLabels[tier] || `Tier ${tier}`}
              <span style="margin-left:auto;font-size:10px;color:var(--text-3)">${tierStages.length}개</span>
            </div>
            <div class="stage-structure-slots">
              ${tierStages.length === 0 ? `
                <div class="stage-structure-slot empty-slot">
                  <div class="slot-name">— 미정의 —</div>
                  <div class="slot-meta">이 티어에 스테이지가 없습니다</div>
                </div>
              ` : ''}
              ${tierStages
                .map((s) => `
                <div class="stage-structure-slot">
                  <div class="slot-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div>
                  <div class="slot-meta">${s.id} · ${s.corpus_type}</div>
                  <div class="slot-cats">
                    ${(s.corpus_filter.categories || []).map(
                      (c) => `<span class="slot-cat">${c}</span>`
                    ).join('')}
                    ${s.corpus_filter.minLevel ? `<span class="slot-cat">Lv${s.corpus_filter.minLevel}</span>` : ''}
                  </div>
                </div>
              `)
                .join('')}
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

/* ----- Cross-language stage map for overview ----- */

function renderCrossLangStageMap() {
  const langs = ['en', 'jp', 'es', 'kr'];
  const tiers = [0, 1, 2, 3, 4, 5];
  const tierLabels = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
  const tierColors = {
    0: '#818cf8',
    1: '#34d399',
    2: '#fbbf24',
    3: '#f472b6',
    4: '#60a5fa',
    5: '#c084fc',
  };

  return `
    <div class="cross-lang-stage-map">
      <div class="cross-lang-stage-map-title">🗺️ 언어별 스테이지 구조 (한눈에)</div>
      <div class="cross-lang-grid">
        <!-- Header row -->
        <div class="cross-lang-header"></div>
        ${tiers.map((t) => `
          <div class="cross-lang-header" style="color:${tierColors[t]}">
            ${tierLabels[t]}
          </div>
        `).join('')}

        <!-- Language rows -->
        ${langs.map((code) => {
          const langData = DATA.langs[code];
          if (!langData) return '';
          const meta = langData.meta;
          const byTier = {};
          for (const t of tiers) {
            byTier[t] = langData.stages.filter((s) => s.tier === t);
          }
          return `
            <div class="cross-lang-lang-cell">
              <span>${meta.flag}</span>
            </div>
            ${tiers.map((t) => {
              const tierStages = byTier[t] || [];
              if (tierStages.length === 0) {
                return `<div class="cross-lang-cell empty tier-${t}"><span class="cell-name">—</span></div>`;
              }
              // Show first stage name in cell
              const first = tierStages[0];
              const cats = (first.corpus_filter.categories || []).join(', ');
              return `
                <div class="cross-lang-cell tier-${t}" title="${tierStages.map((s) => `${s.id}: ${s.name}`).join('\n')}">
                  <div class="cell-name">${escapeHtml(first.name)}</div>
                  ${cats ? `<div class="cell-cats">${cats}</div>` : ''}
                  ${tierStages.length > 1 ? `<div class="cell-cats" style="color:var(--accent)">+${tierStages.length - 1}</div>` : ''}
                </div>
              `;
            }).join('')}
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ----- Stages view ----- */

function renderStages(data) {
  const stages = data.stages;

  // Filter
  const filtered = stages.filter((s) => {
    if (STATE.filterTier !== null && s.tier !== STATE.filterTier) return false;
    if (STATE.filterText) {
      const q = STATE.filterText.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return `
    <div class="filter-bar">
      <input type="text" placeholder="🔍 스테이지 검색 (이름, 설명, ID)" id="stageSearch" value="${escapeAttr(STATE.filterText)}" />
      <span class="filter-chip ${STATE.filterTier === null ? 'active' : ''}" data-tier="">전체</span>
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (t) => `
        <span class="filter-chip ${STATE.filterTier === t ? 'active' : ''}" data-tier="${t}">
          T${t}
        </span>
      `
        )
        .join('')}
      <span style="margin-left:auto;font-size:11px;color:var(--text-3)">
        ${filtered.length} / ${stages.length} 표시 중
      </span>
    </div>

    <table class="stage-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tier</th>
          <th>이름</th>
          <th>설명</th>
          <th>단어수</th>
          <th>코퍼스</th>
          <th>필터</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length === 0
            ? `<tr><td colspan="7" class="empty">스테이지 없음</td></tr>`
            : ''
        }
        ${filtered
          .map(
            (s) => `
          <tr>
            <td><code>${s.id}</code></td>
            <td><span class="tier-pill tier-${s.tier}">T${s.tier}</span></td>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td style="color:var(--text-2);font-size:12px">${escapeHtml(s.description)}</td>
            <td>${s.word_count}</td>
            <td><code style="font-size:11px">${s.corpus_type}</code></td>
            <td>
              <div class="cat-list">
                ${(s.corpus_filter.categories || [])
                  .map((c) => `<span class="cat-tag">${c}</span>`)
                  .join('')}
                ${
                  s.corpus_filter.minLevel
                    ? `<span class="cat-tag">Lv${s.corpus_filter.minLevel}-${s.corpus_filter.maxLevel || '?'}</span>`
                    : ''
                }
              </div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

/* ----- Wiki view ----- */

function renderWiki(data) {
  const sections = [
    { key: 'sources', title: '📄 원본 자료 (Sources)', icon: '📄', desc: 'Language/raw/에서 가져온 학습용 원본 텍스트' },
    { key: 'vocabulary', title: '📖 어휘 (Vocabulary)', icon: '📖', desc: '개별 단어 학습 자료' },
    { key: 'expressions', title: '💬 표현 (Expressions)', icon: '💬', desc: '관용구·숙어·표현 학습 자료' },
    { key: 'culture', title: '🌏 문화 (Culture)', icon: '🌏', desc: '문화적 맥락·배경지식' },
    { key: 'study_plan', title: '📅 학습 계획 (Study Plan)', icon: '📅', desc: '주간·월간 학습 계획' },
  ];

  return sections
    .map((section) => {
      const items = data.wiki[section.key] || [];
      const isExpanded = STATE.expandedSections.has(`${STATE.activeTab}-${section.key}`);
      return `
        <div class="section-title" style="cursor:pointer" data-section="${section.key}">
          <span class="icon">${isExpanded ? '▼' : '▶'}</span>
          ${section.title}
          <span class="badge">${items.length}</span>
          <span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:auto">
            ${section.desc}
          </span>
        </div>
        ${isExpanded ? renderFileList(items, 'wiki') : ''}
      `;
    })
    .join('');
}

/* ----- Sources view ----- */

function renderSources(data) {
  return `
    <div class="compare-grid">
      <div class="compare-col">
        <div class="compare-col-head">
          <div class="title">📁 Language/raw/</div>
          <div class="count">${data.raw_sources.length}개</div>
        </div>
        <div class="compare-col-body">
          ${renderFileList(data.raw_sources, 'raw')}
        </div>
      </div>

      <div class="compare-col">
        <div class="compare-col-head">
          <div class="title">📚 Language/wiki/sources/</div>
          <div class="count">${data.wiki.sources.length}개</div>
        </div>
        <div class="compare-col-body">
          ${renderFileList(data.wiki.sources, 'wiki')}
        </div>
      </div>
    </div>
  `;
}

/* ---------- Reusable renderers ---------- */

function renderFileList(items, type) {
  if (!items || items.length === 0) {
    return '<div class="empty">파일 없음</div>';
  }
  return `
    <ul class="file-list">
      ${items
        .map(
          (item) => `
        <li>
          <div class="file-info">
            <div class="file-name">${escapeHtml(item.title || item.name)}</div>
            <div class="file-title"><code>${item.filename}</code></div>
          </div>
          <div class="file-meta">
            <span>${item.size_kb} KB</span>
            <span title="${item.modified || ''}">${formatDate(item.modified)}</span>
          </div>
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

/* ============================================================
   Detail view event handlers
   ============================================================ */

function attachLangDetailEvents() {
  // Back button
  document.querySelectorAll('[data-action="back"]').forEach((el) => {
    el.addEventListener('click', () => {
      STATE.activeTab = 'overview';
      STATE.activeLang = null;
      render();
    });
  });

  // Detail sub-tabs
  document.querySelectorAll('#detailTabs .detail-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      STATE.detailTab = btn.dataset.dtab;
      document.getElementById('detailContent').innerHTML = renderDetailTab(
        DATA.langs[STATE.activeTab]
      );
      // Re-attach
      document.querySelectorAll('#detailTabs .detail-tab').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      attachLangDetailInnerEvents();
    });
  });

  attachLangDetailInnerEvents();
}

function attachLangDetailInnerEvents() {
  // Section expand/collapse (wiki view)
  document.querySelectorAll('[data-section]').forEach((el) => {
    el.addEventListener('click', () => {
      const key = el.dataset.section;
      const fullKey = `${STATE.activeTab}-${key}`;
      if (STATE.expandedSections.has(fullKey)) {
        STATE.expandedSections.delete(fullKey);
      } else {
        STATE.expandedSections.add(fullKey);
      }
      document.getElementById('detailContent').innerHTML = renderDetailTab(
        DATA.langs[STATE.activeTab]
      );
      attachLangDetailInnerEvents();
    });
  });

  // Stage search
  const search = document.getElementById('stageSearch');
  if (search) {
    search.addEventListener('input', (e) => {
      STATE.filterText = e.target.value;
      // Only refresh if in stages tab
      if (STATE.detailTab === 'stages') {
        document.getElementById('detailContent').innerHTML = renderStages(
          DATA.langs[STATE.activeTab]
        );
        attachLangDetailInnerEvents();
        // Restore focus
        document.getElementById('stageSearch').focus();
        document.getElementById('stageSearch').setSelectionRange(
          STATE.filterText.length,
          STATE.filterText.length
        );
      }
    });
  }

  // Tier filter chips
  document.querySelectorAll('.filter-chip[data-tier]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const tier = chip.dataset.tier;
      STATE.filterTier = tier === '' ? null : parseInt(tier, 10);
      if (STATE.detailTab === 'stages') {
        document.getElementById('detailContent').innerHTML = renderStages(
          DATA.langs[STATE.activeTab]
        );
        attachLangDetailInnerEvents();
      }
    });
  });
}

/* ---------- Top bar actions ---------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reloadBtn').addEventListener('click', () => {
    location.reload();
  });
  document.getElementById('expandAllBtn').addEventListener('click', () => {
    // Toggle: if any expanded, collapse all; else expand all
    const all = ['sources', 'vocabulary', 'expressions', 'culture', 'study_plan'];
    const codes = ['en', 'jp', 'es', 'kr'];
    const isAnyExpanded = codes.some((c) =>
      all.some((s) => STATE.expandedSections.has(`${c}-${s}`))
    );
    if (isAnyExpanded) {
      STATE.expandedSections.clear();
    } else {
      all.forEach((s) => codes.forEach((c) => STATE.expandedSections.add(`${c}-${s}`)));
    }
    if (STATE.activeLang) {
      document.getElementById('detailContent').innerHTML = renderDetailTab(
        DATA.langs[STATE.activeTab]
      );
      attachLangDetailInnerEvents();
    }
  });

  loadData();
});
