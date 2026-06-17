import type { StageConfig } from '../types.js';
import { SAMPLE_STAGES, stagesByTier, type StageTier } from '../data/stages.js';
import { getAllLanguages } from '../language/index.js';

interface MenuProps {
  onStartStage: (stage: StageConfig) => void;
  onShowTutorial?: () => void;
}

const TIER_LABELS: Record<StageTier, string> = {
  0: 'Tier 0 · 문자',
  1: 'Tier 1 · 단어',
  2: 'Tier 2 · 단어 확장',
  3: 'Tier 3 · 짧은 문장',
  4: 'Tier 4 · 긴 문장',
  5: 'Tier 5 · 단락',
};

function StageCard({ stage, onStart }: { stage: StageConfig; onStart: (s: StageConfig) => void }) {
  return (
    <button className="stage-card" onClick={() => onStart(stage)}>
      <h3>
        {stage.name}
        <span className="tier-badge">T{stage.difficulty}</span>
      </h3>
      <p>{stage.description}</p>
      <small>
        {stage.wordCount}개 · {stage.id}
      </small>
    </button>
  );
}

function LanguageSection({
  code,
  label,
  supportsTier0,
  stages,
  onStart,
}: {
  code: string;
  label: string;
  supportsTier0: boolean;
  stages: StageConfig[];
  onStart: (s: StageConfig) => void;
}) {
  const byTier = stagesByTier(code);
  return (
    <section className="language-section">
      <h2>
        {label}
        <small> · {stages.length}개 스테이지</small>
      </h2>
      {supportsTier0 && (
        <div className="tier-group">
          <h3 className="tier-title">{TIER_LABELS[0]}</h3>
          <div className="stage-grid">
            {byTier[0].map((s) => (
              <StageCard key={s.id} stage={s} onStart={onStart} />
            ))}
          </div>
        </div>
      )}
      {([1, 2, 3, 4, 5] as StageTier[]).map((tier) => {
        const tierStages = byTier[tier];
        if (tierStages.length === 0) return null;
        return (
          <div key={tier} className="tier-group">
            <h3 className="tier-title">{TIER_LABELS[tier]}</h3>
            <div className="stage-grid">
              {tierStages.map((s) => (
                <StageCard key={s.id} stage={s} onStart={onStart} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function Menu({ onStartStage, onShowTutorial }: MenuProps) {
  const allLanguages = getAllLanguages();
  
  return (
    <div className="menu">
      <header className="menu-header">
        <h1>Typing Language</h1>
        <p>외국어를 실제 입력하듯 타자하며 적을 격파하라</p>
        {onShowTutorial && (
          <button className="tutorial-btn" onClick={onShowTutorial}>
            📚 튜토리얼 다시 보기
          </button>
        )}
      </header>

      {allLanguages.map((lang) => (
        <LanguageSection
          key={lang.code}
          code={lang.code}
          label={`${lang.name} (${lang.code.toUpperCase()}) — ${lang.nativeName}`}
          supportsTier0={lang.supportsTier0}
          stages={SAMPLE_STAGES}
          onStart={onStartStage}
        />
      ))}

      <footer className="menu-footer">
        <p>
          단어부터 장문까지 6 티어 · 총 {SAMPLE_STAGES.length}개 스테이지 · {allLanguages.length}개 언어 지원
        </p>
      </footer>
    </div>
  );
}