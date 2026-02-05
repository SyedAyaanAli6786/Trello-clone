import React, { useState, useMemo } from 'react';
import styles from './SwitchBoardsDropdown.module.css';
import type { Board } from '@/types';

interface SwitchBoardsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    boards: Board[];
    currentBoardId: number | null;
    onBoardSelect: (boardId: number) => void;
    onCreateBoard: () => void;
}

export const SwitchBoardsDropdown: React.FC<SwitchBoardsDropdownProps> = ({
    isOpen,
    onClose,
    boards,
    currentBoardId,
    onBoardSelect,
    onCreateBoard,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'workspace'>('all');
    const [showWorkspaceViews, setShowWorkspaceViews] = useState(false);

    // Filter boards based on search query
    const filteredBoards = useMemo(() => {
        if (!searchQuery.trim()) return boards;

        const query = searchQuery.toLowerCase();
        return boards.filter(board =>
            board.title.toLowerCase().includes(query)
        );
    }, [boards, searchQuery]);

    const handleBoardClick = (boardId: number) => {
        onBoardSelect(boardId);
        onClose();
    };

    const handleCreateClick = () => {
        onCreateBoard();
        // Don't close dropdown - modal will open alongside
    };

    const getBackgroundStyle = (board: Board) => {
        if (board.backgroundColor) {
            // Check if it's a URL (photo)
            if (board.backgroundColor.startsWith('http')) {
                return { backgroundImage: `url(${board.backgroundColor})` };
            }
            // Otherwise it's a color or gradient
            return { background: board.backgroundColor };
        }
        return { background: '#0079bf' }; // Default blue
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.dropdown}>
                {/* Search Bar */}
                <div className={styles.searchSection}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search your boards"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button className={styles.iconButton} title="List view">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" />
                        </svg>
                    </button>
                    <button className={styles.iconButton} title="Starred">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5L8 1z" />
                        </svg>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'workspace' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('workspace')}
                    >
                        Trello Workspace
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className={styles.scrollableContent}>
                    {/* Your Boards Section */}
                    <div className={styles.section}>
                        <button
                            className={styles.sectionHeader}
                            onClick={() => { }}
                        >
                            <span className={styles.chevron}>▼</span>
                            <span className={styles.sectionTitle}>Your boards</span>
                        </button>

                        <div className={styles.boardGrid}>
                            {filteredBoards.map((board) => (
                                <button
                                    key={board.id}
                                    className={`${styles.boardCard} ${board.id === currentBoardId ? styles.activeBoard : ''
                                        }`}
                                    onClick={() => handleBoardClick(board.id)}
                                >
                                    <div
                                        className={styles.boardThumbnail}
                                        style={getBackgroundStyle(board)}
                                    />
                                    <div className={styles.boardTitle}>{board.title}</div>
                                </button>
                            ))}

                            {/* Create New Board Card */}
                            <button
                                className={styles.createBoardCard}
                                onClick={handleCreateClick}
                            >
                                <div className={styles.createBoardContent}>
                                    <span className={styles.createBoardText}>Create new board</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Workspace Views Section */}
                    <div className={styles.section}>
                        <button
                            className={styles.sectionHeader}
                            onClick={() => setShowWorkspaceViews(!showWorkspaceViews)}
                        >
                            <span className={styles.chevron}>
                                {showWorkspaceViews ? '▼' : '▶'}
                            </span>
                            <span className={styles.sectionTitle}>Workspace Views</span>
                        </button>

                        {showWorkspaceViews && (
                            <div className={styles.workspaceViewsGrid}>
                                <button className={styles.viewCard}>
                                    <div className={styles.viewIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                                        </svg>
                                    </div>
                                    <div className={styles.viewTitle}>Table</div>
                                </button>
                                <button className={styles.viewCard}>
                                    <div className={styles.viewIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z" />
                                        </svg>
                                    </div>
                                    <div className={styles.viewTitle}>Calendar</div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.premiumBadge}>PREMIUM</div>
                    <div className={styles.footerActions}>
                        <button className={styles.footerButton}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 8c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
                            </svg>
                            <span>Members</span>
                        </button>
                        <button className={styles.footerButton}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.5 8c0-.8.2-1.5.5-2.1l1.4-2.4-2.4-1.4c-.6.3-1.3.5-2.1.5-.8 0-1.5-.2-2.1-.5L6.4 1 5 2.4c.3.6.5 1.3.5 2.1 0 .8-.2 1.5-.5 2.1L3.6 9l1.4 1.4c.6-.3 1.3-.5 2.1-.5.8 0 1.5.2 2.1.5l2.4 1.4 1.4-2.4c-.3-.6-.5-1.3-.5-2.1z" />
                            </svg>
                            <span>Settings</span>
                        </button>
                        <button className={styles.footerButton}>⋯</button>
                    </div>
                </div>
            </div>
        </>
    );
};
