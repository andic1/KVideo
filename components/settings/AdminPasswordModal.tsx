'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminPassword: string;
}

export function AdminPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  adminPassword,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('请输入管理员密码');
      return;
    }

    if (password === adminPassword) {
      onSuccess();
      setPassword('');
      setError('');
    } else {
      setError('密码错误，请重试');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-md mx-4 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-2xl animate-in zoom-in-95 fade-in duration-300 ${shake ? 'animate-shake' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-[var(--radius-full)]">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-color)]">管理员权限验证</h2>
              <p className="text-sm text-[var(--text-color-secondary)]">修改视频源需要管理员密码</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-full)] hover:bg-[var(--glass-bg)] text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-color)]">
              管理员密码
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-secondary)]">
                <Lock size={18} />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="请输入管理员密码..."
                className="w-full px-10 py-3 rounded-[var(--radius-2xl)] bg-[var(--bg-color)] border border-[var(--glass-border)] focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-300 text-[var(--text-color)] placeholder-[var(--text-color-secondary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert size={14} />
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--text-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-lg transition-all duration-200 cursor-pointer"
            >
              验证
            </button>
          </div>
        </form>

        {/* Footer hint */}
        <div className="px-6 pb-4">
          <p className="text-xs text-center text-[var(--text-color-secondary)]">
            管理员密码可在环境变量 <code className="px-1 py-0.5 bg-[var(--glass-bg)] rounded text-[var(--accent-color)]">ADMIN_PASSWORD</code> 中设置
          </p>
        </div>
      </div>

      {/* Shake animation style */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
