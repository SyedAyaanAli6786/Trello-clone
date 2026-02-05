import React, { useState, useRef, useEffect } from 'react';
import styles from './Inbox.module.css';

interface InboxProps {
    boardId: number;
}

interface InboxCard {
    id: number;
    title: string;
}

export const Inbox: React.FC<InboxProps> = ({ boardId }) => {
    const [cards, setCards] = useState<InboxCard[]>([
        { id: 1, title: 'Scaler Work' }
    ]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
    const [editingCardId, setEditingCardId] = useState<number | null>(null);
    const [editCardTitle, setEditCardTitle] = useState('');
    const [showMarkCompleteTooltip, setShowMarkCompleteTooltip] = useState(false);
    const [inboxWidth, setInboxWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const inboxRef = useRef<HTMLDivElement>(null);
    const resizeStartX = useRef(0);
    const resizeStartWidth = useRef(0);

    const handleAddCardClick = () => {
        setIsAddingCard(true);
    };

    const handleCancelAdd = () => {
        setIsAddingCard(false);
        setNewCardTitle('');
    };

    const handleSaveCard = () => {
        if (newCardTitle.trim()) {
            const newCard: InboxCard = {
                id: Date.now(),
                title: newCardTitle.trim()
            };
            setCards([...cards, newCard]);
            setNewCardTitle('');
            setIsAddingCard(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveCard();
        } else if (e.key === 'Escape') {
            handleCancelAdd();
        }
    };

    const handleMarkComplete = (cardId: number) => {
        setCards(cards.filter(card => card.id !== cardId));
        setHoveredCardId(null);
    };

    const handleEditCard = (card: InboxCard) => {
        setEditingCardId(card.id);
        setEditCardTitle(card.title);
    };

    const handleSaveEdit = (cardId: number) => {
        if (editCardTitle.trim()) {
            setCards(cards.map(card =>
                card.id === cardId ? { ...card, title: editCardTitle.trim() } : card
            ));
        }
        setEditingCardId(null);
        setEditCardTitle('');
    };

    const handleCancelEdit = () => {
        setEditingCardId(null);
        setEditCardTitle('');
    };

    const handleEditKeyPress = (e: React.KeyboardEvent, cardId: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit(cardId);
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // Resize handle functionality
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = inboxWidth;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const delta = e.clientX - resizeStartX.current;
            const newWidth = Math.min(Math.max(resizeStartWidth.current + delta, 240), 500);
            setInboxWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, inboxWidth]);

    return (
        <div
            ref={inboxRef}
            className={styles.inbox}
            style={{ width: `${inboxWidth}px` }}
        >
            <div className={styles.inboxHeader}>
                <svg className={styles.inboxIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.44 2s2.75-.81 3.44-2H19v3zm0-5h-4.99c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v9z" />
                </svg>
                <h2 className={styles.inboxTitle}>Inbox</h2>
            </div>

            <div className={styles.inboxContent}>
                {/* Add Card Section */}
                {!isAddingCard ? (
                    <div className={styles.addCard} onClick={handleAddCardClick}>
                        <span className={styles.addCardPlaceholder}>Add a card</span>
                    </div>
                ) : (
                    <div className={styles.addCardForm}>
                        <textarea
                            className={styles.addCardTextarea}
                            placeholder="Enter a title"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={handleKeyPress}
                            autoFocus
                        />
                        <div className={styles.addCardActions}>
                            <button
                                className={styles.addCardButton}
                                onClick={handleSaveCard}
                            >
                                Add card
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={handleCancelAdd}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Cards List */}
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className={styles.cardWrapper}
                        onMouseEnter={() => setHoveredCardId(card.id)}
                        onMouseLeave={() => {
                            setHoveredCardId(null);
                            setShowMarkCompleteTooltip(false);
                        }}
                    >
                        {editingCardId === card.id ? (
                            <div className={styles.editCardForm}>
                                <textarea
                                    className={styles.editCardTextarea}
                                    value={editCardTitle}
                                    onChange={(e) => setEditCardTitle(e.target.value)}
                                    onKeyDown={(e) => handleEditKeyPress(e, card.id)}
                                    autoFocus
                                />
                                <div className={styles.editCardActions}>
                                    <button
                                        className={styles.saveEditButton}
                                        onClick={() => handleSaveEdit(card.id)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.card}>
                                {/* Mark Complete Circle */}
                                <div
                                    className={styles.markCompleteWrapper}
                                    onMouseEnter={() => setShowMarkCompleteTooltip(true)}
                                    onMouseLeave={() => setShowMarkCompleteTooltip(false)}
                                >
                                    <button
                                        className={`${styles.markCompleteButton} ${hoveredCardId === card.id ? styles.visible : ''}`}
                                        onClick={() => handleMarkComplete(card.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </button>
                                    {showMarkCompleteTooltip && hoveredCardId === card.id && (
                                        <div className={styles.markCompleteTooltip}>
                                            Mark complete
                                        </div>
                                    )}
                                </div>

                                <span className={styles.cardTitle}>{card.title}</span>

                                {/* Edit Card Button */}
                                <button
                                    className={`${styles.editCardButton} ${hoveredCardId === card.id ? styles.visible : ''}`}
                                    onClick={() => handleEditCard(card)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                    <span className={styles.editCardText}>Edit card</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Resize Handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
};
