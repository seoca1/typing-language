import { useState } from 'react';
import type { UserProfile } from '../types.js';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  onSelect: (profile: UserProfile) => void;
  onCreate: (name: string, avatar: string) => void;
  onDelete: (profileId: string) => void;
}

const AVATAR_OPTIONS = ['👤', '👨', '👩', '🧑', '👦', '👧', '🧒', '👶', '🐱', '🐶', '🦊', '🐼'];

function ProfileCard({
  profile,
  onSelect,
  onDelete,
}: {
  profile: UserProfile;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const totalStars = Object.values(profile.progress.stageRecords).reduce(
    (sum, record) => sum + record.stars,
    0
  );
  const clearedCount = Object.values(profile.progress.stageRecords).filter((r) => r.cleared).length;

  return (
    <div className="profile-card">
      <div className="profile-avatar">{profile.avatar || '👤'}</div>
      <h3>{profile.name}</h3>
      <div className="profile-stats">
        <p>레벨 {profile.progress.level}</p>
        <p>⭐ {totalStars} 별</p>
        <p>✅ {clearedCount} 스테이지</p>
      </div>
      <div className="profile-actions">
        <button className="btn-primary" onClick={onSelect}>
          플레이
        </button>
        <button
          className="btn-danger"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`${profile.name} 프로필을 삭제하시겠습니까?`)) {
              onDelete();
            }
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export function ProfileSelector({ profiles, onSelect, onCreate, onDelete }: ProfileSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const handleCreate = () => {
    if (newName.trim().length === 0) {
      alert('이름을 입력해주세요');
      return;
    }
    onCreate(newName.trim(), selectedAvatar);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="profile-selector">
      <header className="profile-header">
        <h1>Typing Language</h1>
        <p>프로필을 선택하거나 새로 만드세요</p>
      </header>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSelect={() => onSelect(profile)}
            onDelete={() => onDelete(profile.id)}
          />
        ))}

        {!showCreate && (
          <div className="profile-card profile-card-add" onClick={() => setShowCreate(true)}>
            <div className="profile-avatar">➕</div>
            <h3>새 프로필</h3>
            <p>클릭하여 생성</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="profile-create-modal">
          <div className="modal-content">
            <h2>새 프로필 만들기</h2>

            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="닉네임 입력"
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>아바타</label>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    className={`avatar-option ${avatar === selectedAvatar ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>
                취소
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
