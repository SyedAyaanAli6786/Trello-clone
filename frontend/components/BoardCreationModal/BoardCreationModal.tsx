import React, { useState } from 'react';
import styles from './BoardCreationModal.module.css';
import {
    DEFAULT_BACKGROUNDS,
    BACKGROUND_PHOTOS,
    BACKGROUND_COLORS,
    VISIBILITY_OPTIONS,
    type Background,
    type VisibilityOption,
} from '@/lib/backgrounds';

interface BoardCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, background: string, visibility: VisibilityOption) => void;
}

export const BoardCreationModal: React.FC<BoardCreationModalProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [title, setTitle] = useState('');
    const [selectedBackground, setSelectedBackground] = useState<Background>(DEFAULT_BACKGROUNDS[0]);
    const [visibility, setVisibility] = useState<VisibilityOption>('workspace');
    const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
    const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
    const [showTitleError, setShowTitleError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setShowTitleError(true);
            return;
        }

        onCreate(title.trim(), selectedBackground.value, visibility);
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setSelectedBackground(DEFAULT_BACKGROUNDS[0]);
        setVisibility('workspace');
        setShowBackgroundPanel(false);
        setShowVisibilityDropdown(false);
        setShowTitleError(false);
        onClose();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (e.target.value.trim()) {
            setShowTitleError(false);
        }
    };

    const getBackgroundStyle = (background: Background) => {
        if (background.type === 'photo') {
            return { backgroundImage: `url(${background.value})` };
        }
        return { background: background.value };
    };

    const selectedVisibility = VISIBILITY_OPTIONS.find(v => v.value === visibility) || VISIBILITY_OPTIONS[1];

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={handleClose}>
                    ✕
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>Create board</h2>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Board Preview */}
                    <div className={styles.previewSection}>
                        <div
                            className={styles.boardPreview}
                            style={getBackgroundStyle(selectedBackground)}
                        >
                            <div className={styles.previewList}></div>
                            <div className={styles.previewList}></div>
                            <div className={styles.previewList}></div>
                        </div>
                    </div>

                    {/* Background Selection */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Background</label>
                        <div className={styles.backgroundGrid}>
                            {DEFAULT_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    type="button"
                                    className={`${styles.backgroundOption} ${selectedBackground.id === bg.id ? styles.selectedBackground : ''
                                        }`}
                                    style={getBackgroundStyle(bg)}
                                    onClick={() => setSelectedBackground(bg)}
                                />
                            ))}
                            <button
                                type="button"
                                className={styles.moreBackgroundsButton}
                                onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
                            >
                                ⋯
                            </button>
                        </div>
                    </div>

                    {/* Board Title */}
                    <div className={styles.formGroup}>
                        <label htmlFor="boardTitle" className={styles.label}>
                            Board title <span className={styles.required}>*</span>
                        </label>
                        <input
                            id="boardTitle"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className={`${styles.input} ${showTitleError ? styles.inputError : ''}`}
                            autoFocus
                        />
                        {showTitleError && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>👋</span>
                                Board title is required
                            </div>
                        )}
                    </div>

                    {/* Visibility */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Visibility</label>
                        <div className={styles.visibilityWrapper}>
                            <button
                                type="button"
                                className={styles.visibilityButton}
                                onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                            >
                                <span>{selectedVisibility.label}</span>
                                <span className={styles.dropdownArrow}>▼</span>
                            </button>

                            {showVisibilityDropdown && (
                                <div className={styles.visibilityDropdown}>
                                    {VISIBILITY_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`${styles.visibilityOption} ${visibility === option.value ? styles.selectedVisibility : ''
                                                }`}
                                            onClick={() => {
                                                setVisibility(option.value);
                                                setShowVisibilityDropdown(false);
                                            }}
                                        >
                                            <span className={styles.visibilityIcon}>{option.icon}</span>
                                            <div className={styles.visibilityContent}>
                                                <div className={styles.visibilityLabel}>{option.label}</div>
                                                <div className={styles.visibilityDescription}>
                                                    {option.description}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        type="submit"
                        className={styles.createButton}
                        disabled={!title.trim()}
                    >
                        Create
                    </button>

                    {/* Start with template */}
                    <button type="button" className={styles.templateButton}>
                        Start with a template
                    </button>
                </form>

                {/* Background Expansion Panel */}
                {showBackgroundPanel && (
                    <div className={styles.backgroundPanel}>
                        <div className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>Board background</h3>
                            <button
                                type="button"
                                className={styles.panelClose}
                                onClick={() => setShowBackgroundPanel(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.panelSection}>
                            <div className={styles.panelSectionHeader}>
                                <span>Photos</span>
                                <button type="button" className={styles.viewMoreButton}>
                                    View more
                                </button>
                            </div>
                            <div className={styles.panelGrid}>
                                {BACKGROUND_PHOTOS.map((bg) => (
                                    <button
                                        key={bg.id}
                                        type="button"
                                        className={`${styles.panelBackgroundOption} ${selectedBackground.id === bg.id ? styles.selectedPanelBackground : ''
                                            }`}
                                        style={getBackgroundStyle(bg)}
                                        onClick={() => {
                                            setSelectedBackground(bg);
                                            setShowBackgroundPanel(false);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.panelSection}>
                            <div className={styles.panelSectionHeader}>
                                <span>More backgrounds</span>
                                <button type="button" className={styles.viewMoreButton}>
                                    View more
                                </button>
                            </div>
                            <div className={styles.panelGrid}>
                                {BACKGROUND_COLORS.map((bg) => (
                                    <button
                                        key={bg.id}
                                        type="button"
                                        className={`${styles.panelBackgroundOption} ${selectedBackground.id === bg.id ? styles.selectedPanelBackground : ''
                                            }`}
                                        style={getBackgroundStyle(bg)}
                                        onClick={() => {
                                            setSelectedBackground(bg);
                                            setShowBackgroundPanel(false);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
