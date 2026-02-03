'use client';

import { useState } from 'react';
import { SourceManager } from '@/components/settings/SourceManager';
import { AdminPasswordModal } from '@/components/settings/AdminPasswordModal';
import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { ShieldAlert, Lock } from 'lucide-react';

interface SourceSettingsProps {
    sources: VideoSource[];
    onSourcesChange: (sources: VideoSource[]) => void;
    onRestoreDefaults: () => void;
    onAddSource: () => void;
    onEditSource?: (source: VideoSource) => void;
    adminPassword: string; // Admin password for protection
    envAdminPassword?: string; // ENV admin password
}

export function SourceSettings({
    sources,
    onSourcesChange,
    onRestoreDefaults,
    onAddSource,
    onEditSource,
    adminPassword,
    envAdminPassword,
}: SourceSettingsProps) {
    const [showAllSources, setShowAllSources] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Effective admin password (ENV takes priority, then local setting)
    const effectivePassword = envAdminPassword || adminPassword;
    const isProtected = !!effectivePassword;

    const filteredSources = sources.filter(source =>
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.baseUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedSources = showAllSources || searchQuery
        ? filteredSources
        : filteredSources.slice(0, 10);

    // Wrapper function to check admin password before action
    const requireAdminAuth = (action: () => void) => {
        if (!isProtected || isUnlocked) {
            action();
        } else {
            setPendingAction(() => action);
            setIsAdminModalOpen(true);
        }
    };

    const handleAdminSuccess = () => {
        setIsAdminModalOpen(false);
        setIsUnlocked(true); // Unlock for this session
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleToggle = (id: string) => {
        requireAdminAuth(() => {
            const updated = sources.map(s =>
                s.id === id ? { ...s, enabled: !s.enabled } : s
            );
            onSourcesChange(updated);
        });
    };

    const handleDelete = (id: string) => {
        requireAdminAuth(() => {
            const updated = sources.filter(s => s.id !== id);
            onSourcesChange(updated);
        });
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        requireAdminAuth(() => {
            const currentIndex = sources.findIndex(s => s.id === id);
            if (currentIndex === -1) return;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= sources.length) return;

            const updated = [...sources];
            [updated[currentIndex], updated[newIndex]] = [updated[newIndex], updated[currentIndex]];

            // Update priorities
            updated.forEach((s, idx) => s.priority = idx + 1);
            onSourcesChange(updated);
        });
    };

    const handleRestoreDefaultsClick = () => {
        requireAdminAuth(onRestoreDefaults);
    };

    const handleAddSourceClick = () => {
        requireAdminAuth(onAddSource);
    };

    const handleEditSourceClick = (source: VideoSource) => {
        if (onEditSource) {
            requireAdminAuth(() => onEditSource(source));
        }
    };

    return (
        <>
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-[var(--text-color)]">视频源管理</h2>
                        {isProtected && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                isUnlocked 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : 'bg-amber-500/20 text-amber-500'
                            }`}>
                                {isUnlocked ? (
                                    <>
                                        <Lock size={12} />
                                        已解锁
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert size={12} />
                                        需要管理员权限
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRestoreDefaultsClick}
                            className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                        >
                            恢复默认
                        </button>
                        <button
                            onClick={handleAddSourceClick}
                            className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white text-sm font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-sm)] transition-all duration-200 cursor-pointer"
                        >
                            + 添加源
                        </button>
                    </div>
                </div>
                
                <p className="text-sm text-[var(--text-color-secondary)] mb-4">
                    管理视频来源，调整优先级和启用状态
                </p>

                {/* Admin protection notice */}
                {isProtected && !isUnlocked && (
                    <div className="flex items-center gap-3 p-4 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-2xl)] animate-in fade-in slide-in-from-top-2">
                        <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                        <div>
                            <p className="text-sm font-medium text-[var(--text-color)]">
                                视频源管理已被保护
                            </p>
                            <p className="text-xs text-[var(--text-color-secondary)]">
                                对视频源的任何操作都需要输入管理员密码验证
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="搜索源..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] placeholder-[var(--text-color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-color-secondary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <SourceManager
                    sources={displayedSources}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onReorder={handleReorder}
                    onEdit={handleEditSourceClick}
                    defaultIds={DEFAULT_SOURCES.map(s => s.id)}
                />
                {!searchQuery && sources.length > 10 && (
                    <button
                        onClick={() => setShowAllSources(!showAllSources)}
                        className="w-full mt-4 px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                    >
                        {showAllSources ? '收起' : `显示全部 (${sources.length})`}
                    </button>
                )}
            </div>

            {/* Admin Password Modal */}
            <AdminPasswordModal
                isOpen={isAdminModalOpen}
                onClose={() => {
                    setIsAdminModalOpen(false);
                    setPendingAction(null);
                }}
                onSuccess={handleAdminSuccess}
                adminPassword={effectivePassword}
            />
        </>
    );
}
