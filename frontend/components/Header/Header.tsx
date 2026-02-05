import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';

import type { Board } from '@/types';

interface HeaderProps {
    onCreateBoard?: () => void;
    boards?: Board[];
    onBoardSelect?: (boardId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateBoard, boards = [], onBoardSelect }) => {
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const createMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');

    // Filter boards based on search query
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit to 5 results

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
                setIsCreateMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        if (isCreateMenuOpen || isSearchFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCreateMenuOpen, isSearchFocused]);

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button className={styles.iconButton} title="More from Atlassian">
                    <svg width="24" height="24" viewBox="0 0 24 24" role="presentation">
                        <path d="M7 6h3v3H7V6zm5 0h3v3h-3V6zm5 0h3v3h-3V6zM7 11h3v3H7v-3zm5 0h3v3h-3v-3zm5 0h3v3h-3v-3zM7 16h3v3H7v-3zm5 0h3v3h-3v-3zm5 0h3v3h-3v-3z" fill="currentColor" />
                    </svg>
                </button>
                <div className={styles.logo}>
                    <svg width="70" height="24" viewBox="0 0 70 24">
                        <defs>
                            <linearGradient id="trello-gradient" x1="50%" x2="50%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#0052CC" />
                                <stop offset="100%" stopColor="#2684FF" />
                            </linearGradient>
                        </defs>
                        <path d="M13.92 0.018H1.98C0.886 0.018 0 0.904 0 1.998V13.938C0 15.032 0.886 15.918 1.98 15.918H13.92C15.014 15.918 15.9 15.032 15.9 13.938V1.998C15.9 0.904 15.014 0.018 13.92 0.018ZM7.02 11.988C7.02 12.538 6.57 12.988 6.02 12.988H3.48C2.93 12.988 2.48 12.538 2.48 11.988V3.988C2.48 3.438 2.93 2.988 3.48 2.988H6.02C6.57 2.988 7.02 3.438 7.02 3.988V11.988ZM13.42 7.488C13.42 8.038 12.97 8.488 12.42 8.488H9.88C9.33 8.488 8.88 8.038 8.88 7.488V3.988C8.88 3.438 9.33 2.988 9.88 2.988H12.42C12.97 2.988 13.42 3.438 13.42 3.988V7.488Z" fill="url(#trello-gradient)" />
                        <text x="24" y="16" fill="#172B4D" fontSize="14" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Trello</text>
                    </svg>
                </div>
            </div>

            <div className={styles.headerCenter}>
                <div className={styles.searchBoxWrapper} ref={searchRef}>
                    <div className={styles.searchBox} onClick={() => setIsSearchFocused(true)}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder={isSearchFocused ? "Search Trello" : "Search"}
                            className={styles.searchInput}
                            onFocus={() => setIsSearchFocused(true)}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isSearchFocused && (
                        <div className={styles.searchDropdown}>
                            <div className={styles.searchSection}>
                                <div className={styles.searchSectionTitle}>BOARDS</div>
                                {filteredBoards.length > 0 ? (
                                    filteredBoards.map(board => (
                                        <button
                                            key={board.id}
                                            className={styles.searchBoardItem}
                                            onClick={() => {
                                                onBoardSelect?.(board.id);
                                                setIsSearchFocused(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div
                                                className={styles.boardThumbnail}
                                                style={{ backgroundColor: board.backgroundColor || '#0079bf' }}
                                            ></div>
                                            <div className={styles.boardInfo}>
                                                <div className={styles.boardName}>{board.title}</div>
                                                <div className={styles.workspaceName}>Trello Workspace</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className={styles.noResults} style={{ padding: '8px 12px', color: '#5e6c84', fontSize: '14px' }}>
                                        No boards found
                                    </div>
                                )}
                            </div>
                            <button
                                className={styles.advancedSearch}
                                onClick={() => alert('Advanced search coming soon!')}
                            >
                                <span className={styles.searchIcon}>🔍</span>
                                <span>Advanced search</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.createButtonWrapper} ref={createMenuRef}>
                    <button
                        className={styles.createButton}
                        onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                    >
                        Create ✨
                    </button>

                    {isCreateMenuOpen && (
                        <div className={styles.createMenu}>
                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    onCreateBoard?.();
                                    setIsCreateMenuOpen(false);
                                }}
                            >
                                <div className={styles.menuItemIcon}>📋</div>
                                <div className={styles.menuItemContent}>
                                    <div className={styles.menuItemTitle}>Create board</div>
                                    <div className={styles.menuItemDescription}>
                                        A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.
                                    </div>
                                </div>
                            </button>

                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    alert('Workspace views coming soon!');
                                    setIsCreateMenuOpen(false);
                                }}
                            >
                                <div className={styles.menuItemIcon}>👁️</div>
                                <div className={styles.menuItemContent}>
                                    <div className={styles.menuItemTitle}>Create workspace view</div>
                                    <div className={styles.menuItemDescription}>
                                        Get perspective across multiple boards within your workspace.
                                    </div>
                                </div>
                            </button>

                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    alert('Templates coming soon!');
                                    setIsCreateMenuOpen(false);
                                }}
                            >
                                <div className={styles.menuItemIcon}>📄</div>
                                <div className={styles.menuItemContent}>
                                    <div className={styles.menuItemTitle}>Start with a template</div>
                                    <div className={styles.menuItemDescription}>
                                        Get started faster with a board template.
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.headerRight}>
                <button className={styles.iconButton} title="Notifications">
                    <span>🔔</span>
                </button>
                <button className={styles.iconButton} title="Information">
                    <span>ℹ️</span>
                </button>
                <button
                    className={styles.iconButton}
                    title="Account"
                >
                    <span>👤</span>
                </button>
            </div>
        </header>
    );
};
