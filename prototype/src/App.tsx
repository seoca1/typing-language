import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameState } from './state/gameReducer.js';
import { gameReducer, initialState } from './state/gameReducer.js';
import { saveProgress, loadProgress } from './state/localStorage.js';
import { createInputHandler } from './input/index.js';
import type { InputHandler } from './input/index.js';
import { getAudioManager } from './audio/AudioManager.js';
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
import { CharacterTest } from './ui/CharacterTest.js';
import { CharacterSelect } from './ui/CharacterSelect.js';
import { LanguageSelection } from './ui/LanguageSelection.js';
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
import { getResponsiveCanvasSize, logDeviceInfo } from './utils/device.js';
import { OSKeyboardInput } from './ui/OSKeyboardInput.js';

const LANGUAGE_LABEL: Record<Language, string> = {
  en: 'EN',
  jp: 'JP',
  es: 'ES',
  kr: 'KR',
};

const CANVAS_W = 1024;

const TUTORIAL_KEY = 'typing-language-tutorial-completed';

export function App() {
  const [canvasSize] = useState(() => getResponsiveCanvasSize());

  const [showTutorial, setShowTutorial] = useState(() => {
    // 튜토리얼을 이미 완료했는지 확인
    return !localStorage.getItem(TUTORIAL_KEY);
  });

  // 선택된 언어 (LanguageSelection → Menu 흐름)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // Log device info and preload sprites/images on mount
  useEffect(() => {
    logDeviceInfo();
    
    // Preload sprites asynchronously
    import('./config/graphics.js').then(({ GraphicsConfig }) => {
      if (GraphicsConfig.USE_SPRITES) {
        import('./sprites/SpriteLoader.js').then(({ SpriteLoader }) => {
          SpriteLoader.preload([...GraphicsConfig.SPRITE_PRELOAD])
            .catch(err => console.warn('Sprite preload failed:', err));
        });
      }
    });

    // Preload external character images for all languages
    import('./config/characterImages.js').then(({ USE_EXTERNAL_IMAGES, CHARACTER_IMAGES, LANGUAGE_DEFAULT_CHARACTERS }) => {
      if (USE_EXTERNAL_IMAGES) {
        import('./sprites/ImageLoader.js').then(({ ImageLoader }) => {
          // 모든 언어의 기본 캐릭터 프리로드
          const imagesToLoad: any[] = [];
          
          Object.values(LANGUAGE_DEFAULT_CHARACTERS).forEach((characterId: any) => {
            const characterSet = CHARACTER_IMAGES[characterId];
            if (characterSet) {
              imagesToLoad.push(...Object.values(characterSet));
            }
          });
          
          if (imagesToLoad.length > 0) {
            ImageLoader.preload(imagesToLoad)
              .then(() => console.log(`[App] Preloaded ${imagesToLoad.length} character images`))
              .catch(err => console.warn('Character image preload failed:', err));
          }
        });
      }
    });
  }, []);

  // 저장된 진행도 로드
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      // stageRecords가 없는 경우 초기화 (하위 호환성)
      if (!savedProgress.stageRecords) {
        savedProgress.stageRecords = {};
      }
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
  const osKeyboardRef = useRef<{ focus: () => void } | null>(null);
  const characterRef = useRef<CharacterState>(createInitialCharacterState());

  // 진행도 자동 저장
  useEffect(() => {
    saveProgress(state.player);
  }, [state.player]);

  useEffect(() => {
    if (state.phase !== 'stage' || !state.currentStage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Always create a fresh renderer when entering stage phase
    // This prevents state corruption from multiple menu ↔ game transitions
    console.log('[App] Creating new Renderer for stage phase');
    rendererRef.current = new Renderer(canvas);
    const renderer = rendererRef.current;
    renderer.resize(canvas.width, canvas.height);

    // Always create a fresh keyboard to match the fresh renderer
    console.log('[App] Creating new Keyboard for language:', state.currentStage.language);
    // maxHeight = canvas height (880) - keyboard originY (610) - bottom margin (10)
    // so the keyboard stays fully inside the canvas regardless of layout size
    // (e.g., Spanish QWERTY + accent row = 6 rows auto-shrinks to fit)
    keyboardRef.current = new Keyboard(
      state.currentStage.language,
      32,
      610,
      60,
      50,
      4,
      canvas.height - 610 - 10,
    );
    rendererRef.current.setKeyboard(keyboardRef.current);

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

      // Resolve current word/sentence entry for translation lookup
      let currentEntry: { id: string; display: string; meaning?: string; category?: string } | undefined;
      if (enemy && stageStateRef.current) {
        const stageState = stageStateRef.current;
        const enemyObj = stageState.enemies.find((e) => e.id === enemy.id);
        if (enemyObj) {
          currentEntry = {
            id: enemyObj.id,
            display: enemyObj.target.text,
            meaning: enemyObj.target.meaning,
            category: enemyObj.target.category,
          };
        }
      }

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
        currentEntry,
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
    
    // Spanish: accentMode 설정
    if (stage.language === 'es' && 'setMode' in handler && stage.accentMode) {
      (handler as any).setMode(stage.accentMode);
    }
    
    handlerRef.current = handler;

    if (state.currentEnemy) {
      handler.setTarget(state.currentEnemy.target);
      const next = handler.getExpectedChar();
      keyboardRef.current?.setHint(next || null);
    }

    // OSKeyboardInput is the SINGLE source of truth for key events.
    // All key handling (char/backspace/enter/escape) is wired through it via
    // handleOSChar/handleOSBackspace/handleOSEnter/handleOSEscape handlers below.
    // The previous window.addEventListener('keydown', ...) path was REMOVED because
    // it duplicated handler.handleKey() calls, causing every keystroke to register
    // twice (one from input element, one from window listener after bubble-up).
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

  const handleShowCharacterSelect = (language: string) => {
    // Just show character select screen, no need for START_STAGE
    dispatch({ type: 'SHOW_CHARACTER_SELECT', language });
  };

  const handleSelectLanguage = (langCode: string) => {
    console.log(`[App] Language selected: ${langCode}`);
    setSelectedLanguage(langCode as Language);
  };

  const handleBackToLanguageSelect = () => {
    console.log('[App] Back to language selection');
    setSelectedLanguage(null);
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

  // 초기 진입 화면: LanguageSelection (아직 언어 선택 안 함)
  if (selectedLanguage === null) {
    return (
      <LanguageSelection
        onSelectLanguage={handleSelectLanguage}
        onShowTutorial={() => setShowTutorial(true)}
        onStartCharTest={() => dispatch({ type: 'START_CHARTEST' })}
      />
    );
  }

  // 메뉴 화면 (선택된 언어의 스테이지만 표시)
  if (state.phase === 'menu') {
    return (
      <Menu
        language={selectedLanguage}
        onStartStage={handleStartStage}
        onShowCharacterSelect={handleShowCharacterSelect}
        onBackToLanguageSelect={handleBackToLanguageSelect}
        stageRecords={state.player.stageRecords}
      />
    );
  }

  if (state.phase === 'chartest') {
    return (
      <CharacterTest onBack={handleBackToLanguageSelect} />
    );
  }

  if (state.phase === 'charselect') {
    return (
      <CharacterSelect
        language={state.currentStage?.language || 'en'}
        dispatch={dispatch}
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
        language={selectedLanguage}
        onStartStage={handleStartStage}
        onShowCharacterSelect={handleShowCharacterSelect}
        onBackToLanguageSelect={handleBackToLanguageSelect}
        stageRecords={state.player.stageRecords}
      />
    );
  }

  const stage = state.currentStage;
  const enabled = state.phase === 'stage';

  const handleWordComplete = (lastChar: string, event: KeyboardEvent) => {
    const handler = handlerRef.current;
    const enemy = stateRef.current.currentEnemy;
    if (!handler || !enemy) return;

    const currentBuffer = handler.getBuffer();
    const currentAccuracy = handler.getAccuracy();

    if (lastChar) {
      console.log('[Enter] buffer:', currentBuffer);
      console.log('[Enter] target:', enemy.target.text);
      console.log('[Enter] language:', stage.language);
    }

    const isCompleted = handler.checkCompletion();

    if (!isCompleted) {
      console.log('[Enter] NOT completed - resetting for retry');
      handler.reset();
      handler.setTarget(enemy.target);
      return;
    }

    if (isCompleted) {
      console.log('[Enter] SUCCESS! Moving to next word.');
      keyboardRef.current?.pressByEvent(event.key);

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

      const audio = getAudioManager();
      if (isPerfect) {
        audio.play('perfect');
        setTimeout(() => spawnPopup(fx, cx, cy + 20, 'PERFECT!', '#00ff88', 38), 80);
      } else if (newCombo >= 5) {
        audio.play('combo');
        setTimeout(() => spawnPopup(fx, cx, cy + 20, 'COMBO!', '#ff6b9d', 32), 80);
      } else {
        audio.play('enemy-defeat');
      }

      dispatch({
        type: 'ENEMY_DEFEATED',
        nextEnemy,
        scoreDelta: scoreBreakdown.total,
        cleared,
      });

      if (nextEnemy) {
        handler.setTarget(nextEnemy.target);
        const next = handler.getExpectedChar();
        keyboardRef.current?.setHint(next || null);
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
  };

  // OS Keyboard input handlers
  // OSKeyboardInput is the SINGLE source of truth for key events.
  // We call the input handler directly here (no synthetic dispatch)
  // to avoid duplicate processing through the window keydown listener.
  const handleOSChar = (char: string) => {
    if (!enabled || !handlerRef.current || !state.currentEnemy) return;
    const mockEvent = {
      key: char,
      isComposing: false,
      preventDefault: () => {},
    } as KeyboardEvent;
    // Highlight the pressed key on the on-screen keyboard (visual only)
    keyboardRef.current?.pressByEvent(char);
    const result = handlerRef.current.handleKey(mockEvent);
    const romajiHint =
      stage.language === 'jp' && handlerRef.current.getHint
        ? handlerRef.current.getHint()
        : undefined;
    dispatch({ type: 'KEY_INPUT', result, romajiHint });
    const audio = getAudioManager();
    if (result.buffer.length > 0) {
      audio.play('key-correct');
    } else if (char.length === 1) {
      audio.play('key-incorrect');
    }
    const nextKey = handlerRef.current.getExpectedChar();
    keyboardRef.current?.setHint(nextKey || null);
    const enemy = state.currentEnemy;
    if (enemy && result.buffer.length > 0) {
      applyCorrectKeystroke(characterRef.current, performance.now());
    }
    if (result.completed) {
      handleWordComplete(char, mockEvent);
    }
  };

  const handleOSBackspace = () => {
    if (!enabled || !handlerRef.current || !state.currentEnemy) return;
    const mockEvent = {
      key: 'Backspace',
      isComposing: false,
      preventDefault: () => {},
    } as KeyboardEvent;
    keyboardRef.current?.pressByEvent('Backspace');
    const result = handlerRef.current.handleKey(mockEvent);
    dispatch({ type: 'KEY_INPUT', result });
    getAudioManager().play('key-incorrect');
  };

  const handleOSEnter = () => {
    if (!enabled || !handlerRef.current || !state.currentEnemy) return;
    const mockEvent = {
      key: 'Enter',
      isComposing: false,
      preventDefault: () => {},
    } as KeyboardEvent;
    handleWordComplete('', mockEvent);
  };

  const handleOSEscape = () => {
    if (!enabled) return;
    dispatch({ type: 'BACK_TO_MENU' });
  };

  /**
   * Handle mouse click on the canvas-based virtual keyboard.
   * The click coords are canvas-relative (1024x880). We hit-test against the
   * keyboard's key rectangles and route to the same OSKeyboardInput handlers.
   *
   * Important: After handling the click, refocus the hidden OSKeyboardInput.
   * The click steals focus from the hidden <input>, which would otherwise
   * stop receiving physical keyboard events. The user must be able to mix
   * mouse clicks (e.g., for special chars) and physical keyboard input
   * seamlessly.
   */
  const handleCanvasClick = (x: number, y: number) => {
    if (!enabled) return;
    const keyboard = keyboardRef.current;
    if (!keyboard) return;
    const label = keyboard.getKeyAt(x, y);
    if (!label) return;

    // Visual highlight on the clicked key
    keyboard.pressByEvent(label);

    // Route to the appropriate OSKeyboardInput handler
    switch (label) {
      case 'Backspace':
        handleOSBackspace();
        break;
      case 'Enter':
        handleOSEnter();
        break;
      case 'Space':
        handleOSChar(' ');
        break;
      case 'Tab':
        handleOSChar('\t');
        break;
      case 'Shift':
      case 'Caps':
      case 'Ctrl':
      case 'Cmd':
      case 'Alt':
        // Modifier keys — no character produced
        break;
      default:
        // Regular character key (a-z, digits, ES accents, KR jamo, etc.)
        handleOSChar(label);
        break;
    }

    // Refocus the hidden input so subsequent physical keyboard events
    // (keydown) keep firing on it. Without this, the user's next
    // physical-key press would go nowhere.
    osKeyboardRef.current?.focus();
  };

  return (
    <>
      <StageScreen
        canvasRef={canvasRef}
        state={state}
        stage={stage}
        languageLabel={LANGUAGE_LABEL[stage.language]}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
        onCanvasClick={handleCanvasClick}
        onBackToMenu={handleOSEscape}
      />
      <OSKeyboardInput
        ref={osKeyboardRef}
        enabled={state.phase === 'stage'}
        language={stage.language}
        onChar={handleOSChar}
        onBackspace={handleOSBackspace}
        onEnter={handleOSEnter}
        onEscape={handleOSEscape}
      />
    </>
  );
}