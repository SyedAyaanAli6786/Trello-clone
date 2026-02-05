'use client';

import { useState, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import CardModal from '@/components/CardModal/CardModal';
import QuickEditModal from './QuickEditModal';
import type { Card as CardType, Label, Member } from '@/types';
import styles from './Card.module.css';

interface CardProps {
    card: CardType;
    index: number;
    onDelete: (cardId: number) => void;
    onUpdate: (card: CardType) => void;
    labels: Label[];
    members: Member[];
}

export default function Card({ card, index, onDelete, onUpdate, labels, members }: CardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
    const [quickEditPos, setQuickEditPos] = useState({ top: 0, left: 0, width: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const cardLabels = card.cardLabels?.map((cl) => cl.label) || [];
    const cardMembers = card.cardMembers?.map((cm) => cm.member) || [];
    const checklistItems = card.checklistItems || [];
    const completedItems = checklistItems.filter((item) => item.completed).length;
    const totalItems = checklistItems.length;

    const isDueSoon = card.dueDate && new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);
    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

    return (
        <>
            <Draggable draggableId={card.id.toString()} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={(el) => {
                            provided.innerRef(el);
                            // @ts-ignore
                            cardRef.current = el;
                        }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${styles.card} ${snapshot.isDragging ? styles.isDragging : ''}`}
                    >
                        {/* Hover Actions Overlay */}
                        <div className={styles.cardOverlay} onClick={(e) => e.stopPropagation()}>
                            <button
                                className={`${styles.actionBtn} ${styles.checkbox} ${card.completed ? styles.completed : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate({ ...card, completed: !card.completed });
                                    // Optimistic update
                                    import('@/lib/api').then(({ cardApi }) => {
                                        cardApi.update(card.id, { completed: !card.completed });
                                    });
                                }}
                                title={card.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                                {card.completed && <span>✓</span>}
                            </button>

                            <button
                                className={`${styles.actionBtn} ${styles.quickEditButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (cardRef.current) {
                                        const rect = cardRef.current.getBoundingClientRect();
                                        setQuickEditPos({
                                            top: rect.top,
                                            left: rect.left,
                                            width: rect.width
                                        });
                                        setIsQuickEditOpen(true);
                                    }
                                }}
                                title="Edit card"
                            >
                                ✎
                            </button>

                            {card.completed && (
                                <button
                                    className={`${styles.actionBtn} ${styles.archiveBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(card.id);
                                    }}
                                    title="Archive card"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>

                        {cardLabels.length > 0 && (
                            <div className={styles.labels}>
                                {cardLabels.map((label) => (
                                    <span
                                        key={label.id}
                                        className={styles.label}
                                        style={{ backgroundColor: label.color }}
                                        title={label.name}
                                    />
                                ))}
                            </div>
                        )}

                        <h4 className={`${styles.cardTitle} ${card.completed ? styles.titleCompleted : ''}`}>{card.title}</h4>

                        <div className={styles.badges}>
                            {card.dueDate && (
                                <div
                                    className={`${styles.dueDateBadge} ${isOverdue ? styles.overdue : isDueSoon ? styles.dueSoon : ''}`}
                                >
                                    🕒 {format(new Date(card.dueDate), 'MMM d')}
                                </div>
                            )}

                            {card.description && (
                                <div className={styles.badge} title="This card has a description">
                                    📝
                                </div>
                            )}

                            {totalItems > 0 && (
                                <div
                                    className={`${styles.checklistBadge} ${completedItems === totalItems ? styles.complete : ''}`}
                                >
                                    ☑ {completedItems}/{totalItems}
                                </div>
                            )}
                        </div>

                        {cardMembers.length > 0 && (
                            <div className={styles.members}>
                                {cardMembers.map((member) => (
                                    <img
                                        key={member.id}
                                        src={member.avatarUrl || ''}
                                        alt={member.name}
                                        className={styles.memberAvatar}
                                        title={member.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>

            {isModalOpen && (
                <CardModal
                    card={card}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    labels={labels}
                    members={members}
                />
            )}

            {isQuickEditOpen && (
                <QuickEditModal
                    card={card}
                    position={quickEditPos}
                    onClose={() => setIsQuickEditOpen(false)}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onOpenCard={() => {
                        setIsQuickEditOpen(false);
                        setIsModalOpen(true);
                    }}
                    labels={labels}
                    members={members}
                />
            )}
        </>
    );
}
