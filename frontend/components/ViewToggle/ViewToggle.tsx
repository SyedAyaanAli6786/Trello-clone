import React from 'react';
import styles from './ViewToggle.module.css';

export type ViewType = 'inbox' | 'planner' | 'board';

interface ViewToggleProps {
    activeViews: ViewType[];
    onToggleView: (view: ViewType) => void;
    onSwitchBoards?: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ activeViews, onToggleView, onSwitchBoards }) => {
    const isActive = (view: ViewType) => activeViews.includes(view);

    return (
        <div className={styles.viewToggle}>
            <div className={styles.toggleContainer}>
                <button
                    className={`${styles.toggleButton} ${isActive('inbox') ? styles.active : ''}`}
                    onClick={() => onToggleView('inbox')}
                >
                    <span className={styles.icon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H19z M5 7h14v10H5V7z" opacity=".5" />
                            <path d="M19 13h-3c0 1.66-1.34 3-3 3s-3-1.34-3-3H5v4h14v-4z" />
                        </svg>
                    </span>
                    <span className={styles.label}>Inbox</span>
                </button>

                <button
                    className={`${styles.toggleButton} ${isActive('planner') ? styles.active : ''}`}
                    onClick={() => onToggleView('planner')}
                >
                    <span className={styles.icon}>📅</span>
                    <span className={styles.label}>Planner</span>
                </button>

                <button
                    className={`${styles.toggleButton} ${isActive('board') ? styles.active : ''}`}
                    onClick={() => onToggleView('board')}
                >
                    <span className={styles.icon}>📋</span>
                    <span className={styles.label}>Board</span>
                </button>

                <button
                    className={styles.toggleButton}
                    onClick={onSwitchBoards}
                >
                    <span className={styles.icon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z" />
                        </svg>
                    </span>
                    <span className={styles.label}>Switch boards</span>
                </button>
            </div>
        </div>
    );
};
