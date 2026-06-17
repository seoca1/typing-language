import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameState } from './state/gameReducer.js';
import { gameReducer, initialState } from './state/gameReducer.js';
import { saveProgress, loadProgress } from './state/localStorage.js';
import { createInputHandler } from './input/index.js';
import type { InputHandler } from './input/index.js';
import { calculateScore, calculateWpm } from './combat/CombatSystem.js';
import {
  advanceStage,
  createStageState,
  getCurrentEnemy,
} from './stage/StageSystem.js';
import { evaluateAllMissions, type StageRunStats } from './mission/MissionSystem.js';
import { SAMPLE_STAGES } from './data/stages.js';
import { getLanguage } from './language/index.js';
import { Renderer } from './engine/Renderer.js';
import { Menu } from './ui/Menu.js';
import { StageScreen } from './ui/StageScreen.js';
import { ResultScreen } from './ui/ResultScreen.js';
import { Tutorial } from './ui/Tutorial.js';
import {
  createEffectsState,
  getLanguageAccent,
  spawnColorShower,
  spawnFlash,
  spawnHitBurst,
  spawnPopup,
  triggerShake,
  updateEffects,
  type EffectsState,
} from './effects/EffectsSystem.js';
import { Keyboard } from './engine/Keyboard.js';
import {
  applyCorrectKeystroke,
  applyEnemyDefeated,
  applyLanguageChange,
  applyStageCleared,
  createInitialCharacterState,
  resetForNewStage,
  tickPose,
  type CharacterState,
} from './character/CharacterController.js';
import type { Language, StageConfig } from './types.js';

const LANGUAGE_LABEL: Record<Language, string> = {
  en: 'EN',
  jp: 'JP',
  es: 'ES',
  kr: 'KR',
};

const CANVAS_W = 1024;

const TUTORIAL_KEY = 'typing-language-tutorial-completed';

export function App() {
  const [showTutorial, setShowTutorial] = useState(() => {
    // 튜토리얼을 이미 완료했는지 확인
    return !localStorage.getItem(TUTORIAL_KEY);
  });

  // 저장된 진행도 로드
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      return { ...initial, player: savedProgress };
    }
    return initial;
  });
  const handlerRef = useRef<InputHandler | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const stageStateRef = useRef<ReturnType<typeof createStageState> | null>(null);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;
  const effectsRef = useRef<EffectsState>(createEffectsState());
  const lastTickRef = useRef<number>(0);
  const keyboardRef = useRef<Keyboard | null>(null);
  const characterRef = useRef<CharacterState>(createInitialCharacterState());

  // 진행도 자동 저장
  useEffect(() => {
    saveProgress(state.player);
  }, [state.player]);

  useEffect(() => {
    if (state.phase !== 'stage' || !state.currentStage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!rendererRef.current) {
      rendererRef.current = new Renderer(canvas);
    }
    const renderer = rendererRef.current;
    renderer.resize(canvas.width, canvas.height);

    if (!keyboardRef.current) {
      keyboardRef.current = new Keyboard(
        state.currentStage.language,
        32,
        610,
        60,
        50,
        4,
      );
      rendererRef.current.setKeyboard(keyboardRef.current);
    } else {
      keyboardRef.current.setLanguage(state.currentStage.language);
    }

    let rafId: number;
    const tick = () => {
      const now = performance.now();
      const dt = lastTickRef.current === 0 ? 16 : now - lastTickRef.current;
      lastTickRef.current = now;

      updateEffects(effectsRef.current, dt);

      const s = stateRef.current;
      const enemy = s.currentEnemy;
      const ch = characterRef.current;
      tickPose(ch, now);
      renderer.render({
        currentEnemy: enemy,
        buffer: s.buffer,
        score: s.score,
        combo: s.combo,
        wpm: s.wpm,
        accuracy: s.accuracy,
        language: s.currentStage?.language ?? 'en',
        romajiHint: s.romajiHint,
        effects: effectsRef.current,
        lastHitCorrect: s.lastHitCorrect,
        lastHitCharIndex: s.lastHitCharIndex,
        lastHitTime: s.lastHitTime,
        character: ch,
      });
      rafId = requestAnimationFrame(tick);
    };
    lastTickRef.current = 0;
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [state.phase, state.currentStage]);

  useEffect(() => {
    if (state.phase !== 'stage' || !state.currentStage) return;
    const stage = state.currentStage;
    const handler = createInputHandler(stage.language);
    handlerRef.current = handler;

    if (state.currentEnemy) {
      handler.setTarget(state.currentEnemy.target);
      const next = handler.getExpectedChar();
      keyboardRef.current?.setHint(next || null);
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'BACK_TO_MENU' });
        return;
      }

      const kb = keyboardRef.current;
      const enemy = stateRef.current.currentEnemy;
      if (!enemy) return;

      // Enter 키로 판정 (수동 확정)
      if (event.key === 'Enter') {
        const currentBuffer = handler.getBuffer();
        const currentAccuracy = handler.getAccuracy();
        
        console.log('[Enter] buffer:', currentBuffer);
        console.log('[Enter] target:', enemy.target.text);
        console.log('[Enter] language:', stage.language);
        
        // InputHandler의 언어별 매칭 로직 사용
        const isCompleted = handler.checkCompletion();
        console.log('[Enter] completed:', isCompleted);
        
        if (isCompleted) {
          console.log('[Enter] SUCCESS! Moving to next word.');
          kb?.pressByEvent(event.key);

          const timeMs = Date.now() - stateRef.current.startTime;
          const scoreBreakdown = calculateScore(enemy, currentAccuracy, timeMs);
          const stageState = stageStateRef.current;
          if (!stageState) return;
          advanceStage(stageState);
          const nextEnemy = getCurrentEnemy(stageState);
          const cleared = !nextEnemy;
          const cx = CANVAS_W / 2;
          const cy = 290;
          const accents = getLanguageAccent(stage.language);

          const fx = effectsRef.current;
          spawnColorShower(fx, cx, cy, accents, 50);
          spawnHitBurst(fx, cx, cy, '#ffffff', 30);
          spawnPopup(fx, cx, cy - 60, `+${scoreBreakdown.total}`, '#ffd700', 44);
          spawnFlash(fx, '#ffffff', 0.25, 120);
          triggerShake(fx, 8, 180);

          const isPerfect =
            currentAccuracy === 100 && stateRef.current.totalErrors === 0;
          const newCombo = stateRef.current.combo + 1;
          applyEnemyDefeated(characterRef.current, newCombo, isPerfect, performance.now());

          if (isPerfect) {
            setTimeout(() => spawnPopup(fx, cx, cy + 20, 'PERFECT!', '#00ff88', 38), 80);
          } else if (newCombo >= 5) {
            setTimeout(() => spawnPopup(fx, cx, cy + 20, 'COMBO!', '#ff6b9d', 32), 80);
          }

          dispatch({
            type: 'ENEMY_DEFEATED',
            nextEnemy,
            scoreDelta: scoreBreakdown.total,
            cleared,
          });

          if (nextEnemy) {
            handler.setTarget(nextEnemy.target);
            keyboardRef.current?.setHint(handler.getExpectedChar() || null);
          } else {
            keyboardRef.current?.setHint(null);

            const stageEndTime = Date.now();
            const stats: StageRunStats = {
              enemiesDefeated: stateRef.current.enemiesDefeated + 1,
              totalEnemies: stageState.enemies.length,
              errors: stateRef.current.totalErrors,
              comboMax: stateRef.current.comboMax,
              comboCurrent: 0,
              totalKeystrokes: 0,
              correctKeystrokes: 0,
              startTime: stateRef.current.startTime,
              clearedTime: stageEndTime,
              defeatedEnemies: stageState.enemies.map((e) => ({
                category: e.target.category,
                level: e.target.level,
              })),
              allCompleted: cleared,
            };
            const results = evaluateAllMissions(stage.missions, stats).map((m) => ({
              missionId: m.missionId,
              cleared: m.status === 'cleared',
            }));
            dispatch({
              type: 'END_STAGE',
              missions: stage.missions,
              results,
            });
            const elapsed = stageEndTime - stateRef.current.startTime;
            const completedTexts = stageState.enemies.map((e) => e.target.text);
            const wpm = calculateWpm(completedTexts, elapsed);
            dispatch({ type: 'UPDATE_STATS', accuracy: currentAccuracy, wpm });

            spawnPopup(fx, cx, cy + 60, `STAGE CLEAR!`, '#00d9ff', 56);
            spawnColorShower(fx, cx, cy + 60, accents, 80);

            applyStageCleared(characterRef.current, performance.now());
          }
        }
        return;
      }

      kb?.pressByEvent(event.key);

      const result = handler.handleKey(event);
      const romajiHint =
        stage.language === 'jp' && handler.getHint ? handler.getHint() : undefined;
      dispatch({ type: 'KEY_INPUT', result, romajiHint });

      const nextKey = handler.getExpectedChar();
      kb?.setHint(nextKey || null);

      const ch = characterRef.current;
      if (result.buffer.length > 0) {
        applyCorrectKeystroke(ch, performance.now());
      }

      const fx = effectsRef.current;
      if (enemy && result.buffer.length > 0) {
        const targetText = enemy.target.text;
        const idx = result.buffer.length - 1;
        const correctChar = targetText[idx];
        const typedChar = result.buffer[idx];
        const charWidth = 22;
        const startX = CANVAS_W / 2 - (targetText.length * charWidth) / 2;
        const x = startX + idx * charWidth;
        const y = 500;

        if (correctChar !== undefined && typedChar === correctChar) {
          spawnHitBurst(fx, x, y, '#00ff88', 6);
        } else if (typedChar !== undefined) {
          spawnHitBurst(fx, x, y, '#ff4444', 4);
        }
      }

      // 자동 판정 제거 (Enter로만 판정)
      /*
      if (isDefeated(enemy, result.buffer, enemy.target.acceptedInputs)) {
        const timeMs = Date.now() - stateRef.current.startTime;
        const scoreBreakdown = calculateScore(enemy, result.accuracy, timeMs);
        const stageState = stageStateRef.current;
        if (!stageState) return;
        advanceStage(stageState);
        const nextEnemy = getCurrentEnemy(stageState);
        const cleared = !nextEnemy;
        const cx = CANVAS_W / 2;
        const cy = 290;
        const accents = getLanguageAccent(stage.language);

        spawnColorShower(fx, cx, cy, accents, 50);
        spawnHitBurst(fx, cx, cy, '#ffffff', 30);
        spawnPopup(fx, cx, cy - 60, `+${scoreBreakdown.total}`, '#ffd700', 44);
        spawnFlash(fx, '#ffffff', 0.25, 120);
        triggerShake(fx, 8, 180);

        const isPerfect =
          result.accuracy === 100 && stateRef.current.totalErrors === 0;
        const newCombo = stateRef.current.combo + 1;
        applyEnemyDefeated(characterRef.current, newCombo, isPerfect, performance.now());

        if (isPerfect) {
          setTimeout(() => spawnPopup(fx, cx, cy + 20, 'PERFECT!', '#00ff88', 38), 80);
        } else if (newCombo >= 5) {
          setTimeout(() => spawnPopup(fx, cx, cy + 20, 'COMBO!', '#ff6b9d', 32), 80);
        }

        dispatch({
          type: 'ENEMY_DEFEATED',
          nextEnemy,
          scoreDelta: scoreBreakdown.total,
          cleared,
        });

        if (nextEnemy) {
          handler.setTarget(nextEnemy.target);
          keyboardRef.current?.setHint(handler.getExpectedChar() || null);
        } else {
          keyboardRef.current?.setHint(null);

          const stageEndTime = Date.now();
          const stats: StageRunStats = {
            enemiesDefeated: stateRef.current.enemiesDefeated + 1,
            totalEnemies: stageState.enemies.length,
            errors: stateRef.current.totalErrors,
            comboMax: stateRef.current.comboMax,
            comboCurrent: 0,
            totalKeystrokes: 0,
            correctKeystrokes: 0,
            startTime: stateRef.current.startTime,
            clearedTime: stageEndTime,
            defeatedEnemies: stageState.enemies.map((e) => ({
              category: e.target.category,
              level: e.target.level,
            })),
            allCompleted: cleared,
          };
          const results = evaluateAllMissions(stage.missions, stats).map((m) => ({
            missionId: m.missionId,
            cleared: m.status === 'cleared',
          }));
          dispatch({
            type: 'END_STAGE',
            missions: stage.missions,
            results,
          });
          const elapsed = stageEndTime - stateRef.current.startTime;
          const completedTexts = stageState.enemies.map((e) => e.target.text);
          const wpm = calculateWpm(completedTexts, elapsed);
          dispatch({ type: 'UPDATE_STATS', accuracy: result.accuracy, wpm });

          spawnPopup(fx, cx, cy + 60, `STAGE CLEAR!`, '#00d9ff', 56);
          spawnColorShower(fx, cx, cy + 60, accents, 80);

          applyStageCleared(characterRef.current, performance.now());
        }
      }
      */
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, state.currentStage, state.currentEnemy]);

  const handleStartStage = (stage: StageConfig) => {
    const langConfig = getLanguage(stage.language);
    let corpus = langConfig.corpus.words;
    
    // Tier 0: Character-specific corpus (if supported)
    if (langConfig.supportsTier0 && stage.corpusFilter.categories && langConfig.corpus.chars) {
      const charCategory = stage.corpusFilter.categories[0];
      if (charCategory in langConfig.corpus.chars) {
        corpus = langConfig.corpus.chars[charCategory];
      }
    }
    
    // Tier 3+: Use sentence corpus
    if (stage.corpusFilter.minLevel && stage.corpusFilter.minLevel >= 3) {
      corpus = langConfig.corpus.sentences;
    }
    
    const stageState = createStageState(stage, [...corpus]);
    stageStateRef.current = stageState;
    const firstEnemy = getCurrentEnemy(stageState);
    if (!firstEnemy) return;
    effectsRef.current = createEffectsState();
    resetForNewStage(characterRef.current);
    applyLanguageChange(characterRef.current, stage.language);
    dispatch({ type: 'START_STAGE', stage, enemy: firstEnemy });
  };

  const handleBackToMenu = () => {
    effectsRef.current = createEffectsState();
    dispatch({ type: 'BACK_TO_MENU' });
  };

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const handleStartTutorialStage = (language: Language) => {
    // 튜토리얼 스테이지 시작 (Tier 1 첫 스테이지)
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShowTutorial(false);
    
    // 해당 언어의 첫 스테이지 찾기
    const firstStage = SAMPLE_STAGES.find((s) => s.language === language);
    if (firstStage) {
      handleStartStage(firstStage);
    }
  };

  // 튜토리얼 표시
  if (showTutorial) {
    return (
      <Tutorial
        onComplete={handleTutorialComplete}
        onStartTutorialStage={handleStartTutorialStage}
      />
    );
  }

  if (state.phase === 'menu') {
    return (
      <Menu
        onStartStage={handleStartStage}
        onShowTutorial={() => setShowTutorial(true)}
      />
    );
  }

  if (state.phase === 'result') {
    return (
      <ResultScreen
        score={state.score}
        enemiesDefeated={state.enemiesDefeated}
        missions={state.missions}
        results={state.missionResults}
        onBack={handleBackToMenu}
      />
    );
  }

  // 스테이지가 없으면 메뉴로 (방어 코드)
  if (!state.currentStage) {
    return (
      <Menu
        onStartStage={handleStartStage}
        onShowTutorial={() => setShowTutorial(true)}
      />
    );
  }

  return (
    <StageScreen
      canvasRef={canvasRef}
      state={state}
      stage={state.currentStage}
      languageLabel={LANGUAGE_LABEL[state.currentStage.language]}
    />
  );
}