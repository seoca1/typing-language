import { useEffect, useRef, useState } from 'react';
import { Keyboard } from '../engine/Keyboard.js';
import {
  createInitialCharacterState,
  tickPose,
  applyCorrectKeystroke,
  resetForNewStage,
  type CharacterState,
} from '../character/CharacterController.js';
import {
  renderBackground,
  renderCharacter,
  renderProps,
} from '../character/CharacterRenderer.js';
import { GraphicsConfig } from '../config/graphics.js';
import type { PoseName } from '../character/CharacterData.js';

interface CharacterTestProps {
  onBack: () => void;
}

export function CharacterTest({ onBack }: CharacterTestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keyboardRef = useRef<Keyboard | null>(null);
  const characterRef = useRef<CharacterState>(createInitialCharacterState());
  const animationFrameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const [useSprites, setUseSprites] = useState(GraphicsConfig.USE_SPRITES);
  const [currentPose, setCurrentPose] = useState<PoseName>('idle');
  const [showKeyboard, setShowKeyboard] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize keyboard
    keyboardRef.current = new Keyboard('en', 32, 610, 60, 50, 4);

    // Render loop
    const render = (timestamp: number) => {
      const dt = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      // Update character pose timer
      tickPose(characterRef.current, dt);

      // Clear canvas
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render background
      renderBackground(ctx, characterRef.current, canvas.width, canvas.height, timestamp);

      // Render character
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 50;
      
      // Temporarily override USE_SPRITES for testing
      const originalUseSprites = GraphicsConfig.USE_SPRITES;
      GraphicsConfig.USE_SPRITES = useSprites;
      
      renderCharacter(ctx, characterRef.current, cx, cy, timestamp);
      renderProps(ctx, characterRef.current, cx, cy, timestamp);
      
      // Restore original setting
      GraphicsConfig.USE_SPRITES = originalUseSprites;

      // Render keyboard
      if (showKeyboard && keyboardRef.current) {
        keyboardRef.current.update();
        keyboardRef.current.render(ctx);
      }

      // Render UI
      renderUI(ctx, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [useSprites, showKeyboard]);

  // Update pose when selection changes
  useEffect(() => {
    characterRef.current.pose = currentPose;
    characterRef.current.poseStart = performance.now();
  }, [currentPose]);

  const renderUI = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('캐릭터 애니메이션 테스트', width / 2, 40);

    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('아래 버튼으로 포즈를 변경하세요', width / 2, 70);

    // Current pose info
    ctx.fillStyle = '#00d9ff';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillText(`현재 포즈: ${getPoseLabel(currentPose)}`, width / 2, height - 40);

    // Sprite mode info
    ctx.fillStyle = useSprites ? '#00ff88' : '#ff6b9d';
    ctx.fillText(
      `렌더링 모드: ${useSprites ? '스프라이트' : '프리미티브'}`,
      width / 2,
      height - 15
    );
  };

  const getPoseLabel = (pose: PoseName): string => {
    switch (pose) {
      case 'idle':
        return '대기 (Idle)';
      case 'wave':
        return '손 흔들기 (Wave)';
      case 'jump':
        return '점프 (Jump)';
      case 'clap':
        return '박수 (Clap)';
      case 'spin':
        return '회전 (Spin)';
      case 'dance':
        return '춤 (Dance)';
      case 'pose':
        return '포즈 (Pose)';
      default:
        return pose;
    }
  };

  const triggerPose = (pose: PoseName) => {
    setCurrentPose(pose);
    const now = performance.now();
    
    // Also trigger the actual state change for animations
    switch (pose) {
      case 'wave':
      case 'jump':
      case 'clap':
      case 'spin':
      case 'dance':
      case 'pose':
        applyCorrectKeystroke(characterRef.current, now);
        break;
      case 'idle':
      default:
        resetForNewStage(characterRef.current);
        break;
    }
  };

  return (
    <div className="character-test-screen">
      <canvas
        ref={canvasRef}
        width={1024}
        height={640}
        style={{
          display: 'block',
          margin: '0 auto',
          background: '#0a0a14',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      
      <div className="character-test-controls">
        <div className="control-group">
          <h3>포즈 선택</h3>
          <div className="button-group">
            <button
              className={currentPose === 'idle' ? 'active' : ''}
              onClick={() => triggerPose('idle')}
            >
              대기 (Idle)
            </button>
            <button
              className={currentPose === 'wave' ? 'active' : ''}
              onClick={() => triggerPose('wave')}
            >
              손 흔들기 (Wave)
            </button>
            <button
              className={currentPose === 'jump' ? 'active' : ''}
              onClick={() => triggerPose('jump')}
            >
              점프 (Jump)
            </button>
            <button
              className={currentPose === 'clap' ? 'active' : ''}
              onClick={() => triggerPose('clap')}
            >
              박수 (Clap)
            </button>
            <button
              className={currentPose === 'spin' ? 'active' : ''}
              onClick={() => triggerPose('spin')}
            >
              회전 (Spin)
            </button>
            <button
              className={currentPose === 'dance' ? 'active' : ''}
              onClick={() => triggerPose('dance')}
            >
              춤 (Dance)
            </button>
            <button
              className={currentPose === 'pose' ? 'active' : ''}
              onClick={() => triggerPose('pose')}
            >
              포즈 (Pose)
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>렌더링 설정</h3>
          <div className="button-group">
            <button
              className={!useSprites ? 'active' : ''}
              onClick={() => setUseSprites(false)}
            >
              프리미티브
            </button>
            <button
              className={useSprites ? 'active' : ''}
              onClick={() => setUseSprites(true)}
            >
              스프라이트
            </button>
          </div>
          <label style={{ display: 'block', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={showKeyboard}
              onChange={(e) => setShowKeyboard(e.target.checked)}
            />
            키보드 표시
          </label>
        </div>

        <div className="control-group">
          <button className="back-button" onClick={onBack}>
            ← 메뉴로 돌아가기
          </button>
        </div>
      </div>

      <div className="character-test-info">
        <h3>애니메이션 설명</h3>
        <ul>
          <li><strong>대기 (Idle):</strong> 기본 대기 상태, 부드러운 호흡 애니메이션</li>
          <li><strong>손 흔들기 (Wave):</strong> 스테이지 시작 시 인사 동작</li>
          <li><strong>점프 (Jump):</strong> 작은 점프 - 콤보 5+ 달성 시</li>
          <li><strong>박수 (Clap):</strong> 완벽한 타이핑 (Perfect) 달성 시</li>
          <li><strong>회전 (Spin):</strong> 큰 회전 - 콤보 10+ 달성 시</li>
          <li><strong>춤 (Dance):</strong> 스테이지 클리어 시 승리의 춤</li>
          <li><strong>포즈 (Pose):</strong> 특별한 승리 포즈</li>
        </ul>
        
        <h3>렌더링 모드</h3>
        <ul>
          <li><strong>프리미티브:</strong> Canvas API로 도형 직접 그리기 (경량)</li>
          <li><strong>스프라이트:</strong> 미리 생성된 이미지 사용 (고품질)</li>
        </ul>

        <h3>사용 방법</h3>
        <p>위 버튼을 클릭하여 각 포즈를 확인하고, 렌더링 모드를 전환하여 차이를 비교해보세요.</p>
      </div>
    </div>
  );
}
