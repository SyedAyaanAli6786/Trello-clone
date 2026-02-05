'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './QuickEditModal.module.css';
import type { Card, Label, Member } from '@/types';
import { cardApi } from '@/lib/api';

interface QuickEditModalProps {
    card: Card;
    position: { top: number; left: number; width: number };
    onClose: () => void;
    onUpdate: (card: Card) => void;
    onDelete: (cardId: number) => void;
    onOpenCard: () => void;
    labels: Label[];
    members: Member[];
}

export default function QuickEditModal({
    card,
    position,
    onClose,
    onUpdate,
    onDelete,
    onOpenCard,
    labels,
    members,
}: QuickEditModalProps) {
    const [title, setTitle] = useState(card.title);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || title === card.title) {
            onClose();
            return;
        }

        setIsLoading(true);
        try {
            const response = await cardApi.update(card.id, { title });
            onUpdate(response.data);
            onClose();
        } catch (error) {
            console.error('Failed to update card title:', error);
            setIsLoading(false);
        }
    };

    const handleArchive = async () => {
        try {
            await cardApi.delete(card.id);
            onDelete(card.id);
            onClose();
        } catch (error) {
            console.error('Failed to archive card:', error);
        }
    };

    // calculate position to prevent overflow (simplistic)
    // For now, we trust the passed position which matches the card's exact position on screen.

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.quickEditContainer}
                style={{ top: position.top, left: position.left, width: position.width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.editor}>
                    <div className={styles.cardPreview}>
                        {/* Render significant visual parts of the card to look like it */}
                        {(card.cardLabels && card.cardLabels.length > 0) && (
                            <div className={styles.labels}>
                                {card.cardLabels.map(cl => (
                                    <span
                                        key={cl.label.id}
                                        className={styles.label}
                                        style={{ backgroundColor: cl.label.color }}
                                    />
                                ))}
                            </div>
                        )}
                        <textarea
                            className={styles.titleInput}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            rows={3} // Approximate height
                        />
                        {(card.cardMembers && card.cardMembers.length > 0) && (
                            <div className={styles.members}>
                                {card.cardMembers.map(cm => (
                                    <img
                                        key={cm.member.id}
                                        src={cm.member.avatarUrl || ''}
                                        className={styles.memberAvatar}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <button className={styles.saveButton} onClick={handleSave} disabled={isLoading}>
                        Save
                    </button>

                    {/* Side Actions */}
                    <div className={styles.actions}>
                        <button className={styles.actionButton} onClick={onOpenCard}>
                            <span className={styles.icon}>🗇</span> Open card
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>🏷️</span> Edit labels
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>👤</span> Change members
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>🖼️</span> Change cover
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>➡️</span> Move
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>📋</span> Copy card
                        </button>
                        <button className={styles.actionButton}>
                            <span className={styles.icon}>🕒</span> Edit dates
                        </button>
                        <button className={styles.actionButton} onClick={handleArchive}>
                            <span className={styles.icon}>🗑️</span> Archive
                        </button>
                    </div>
                </div>
            </div>

            <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
    );
}
