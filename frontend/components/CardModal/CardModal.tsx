'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cardApi, labelApi, memberApi, checklistApi } from '@/lib/api';
import type { Card, Label, Member, ChecklistItem } from '@/types';
import styles from './CardModal.module.css';

interface CardModalProps {
    card: Card;
    onClose: () => void;
    onUpdate: (card: Card) => void;
    onDelete: (cardId: number) => void;
    labels: Label[];
    members: Member[];
}

export default function CardModal({
    card: initialCard,
    onClose,
    onUpdate,
    onDelete,
    labels,
    members,
}: CardModalProps) {
    const [card, setCard] = useState(initialCard);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);

    const cardLabels = card.cardLabels?.map((cl) => cl.label) || [];
    const cardMembers = card.cardMembers?.map((cm) => cm.member) || [];
    const checklistItems = card.checklistItems || [];

    const handleUpdateTitle = async () => {
        if (!title.trim() || title === card.title) {
            setTitle(card.title);
            return;
        }

        try {
            const response = await cardApi.update(card.id, { title });
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to update card title:', error);
            setTitle(card.title);
        }
    };

    const handleUpdateDescription = async () => {
        try {
            const response = await cardApi.update(card.id, { description });
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
            setIsEditingDescription(false);
        } catch (error) {
            console.error('Failed to update description:', error);
        }
    };

    const handleSetDueDate = async (dueDate: string | null) => {
        try {
            const response = await cardApi.update(card.id, { dueDate });
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to set due date:', error);
        }
    };

    const handleToggleLabel = async (label: Label) => {
        const hasLabel = cardLabels.some((l) => l.id === label.id);

        try {
            if (hasLabel) {
                await labelApi.removeFromCard(card.id, label.id);
            } else {
                await labelApi.addToCard(card.id, label.id);
            }

            // Refresh card data
            const response = await cardApi.getById(card.id);
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to toggle label:', error);
        }
    };

    const handleToggleMember = async (member: Member) => {
        const hasMember = cardMembers.some((m) => m.id === member.id);

        try {
            if (hasMember) {
                await memberApi.removeFromCard(card.id, member.id);
            } else {
                await memberApi.addToCard(card.id, member.id);
            }

            // Refresh card data
            const response = await cardApi.getById(card.id);
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to toggle member:', error);
        }
    };

    const handleAddChecklistItem = async () => {
        if (!newChecklistItem.trim()) return;

        try {
            await checklistApi.addItem(card.id, { title: newChecklistItem });

            // Refresh card data
            const response = await cardApi.getById(card.id);
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
            setNewChecklistItem('');
            setIsAddingChecklistItem(false);
        } catch (error) {
            console.error('Failed to add checklist item:', error);
        }
    };

    const handleToggleChecklistItem = async (item: ChecklistItem) => {
        try {
            await checklistApi.updateItem(item.id, { completed: !item.completed });

            // Refresh card data
            const response = await cardApi.getById(card.id);
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to toggle checklist item:', error);
        }
    };

    const handleDeleteChecklistItem = async (itemId: number) => {
        try {
            await checklistApi.deleteItem(itemId);

            // Refresh card data
            const response = await cardApi.getById(card.id);
            const updatedCard = response.data;
            setCard(updatedCard);
            onUpdate(updatedCard);
        } catch (error) {
            console.error('Failed to delete checklist item:', error);
        }
    };

    const handleArchive = async () => {
        try {
            await cardApi.archive(card.id, true);
            onClose();
            onDelete(card.id);
        } catch (error) {
            console.error('Failed to archive card:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this card?')) return;

        try {
            await cardApi.delete(card.id);
            onClose();
            onDelete(card.id);
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    ✕
                </button>

                <div className={styles.modalHeader}>
                    <div className={styles.titleSection}>
                        <span className={styles.icon}>📋</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleUpdateTitle}
                            className={styles.titleInput}
                        />
                    </div>
                    {card.list && (
                        <p className={styles.listName}>
                            in list <strong>{card.list.title}</strong>
                        </p>
                    )}
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.mainContent}>
                        {/* Labels */}
                        {cardLabels.length > 0 && (
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Labels</h4>
                                <div className={styles.labelsContainer}>
                                    {cardLabels.map((label) => (
                                        <span
                                            key={label.id}
                                            className={styles.labelBadge}
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Date */}
                        {card.dueDate && (
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Due Date</h4>
                                <div className={styles.dueDateDisplay}>
                                    {format(new Date(card.dueDate), 'MMMM d, yyyy')}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>Description</h4>
                            {isEditingDescription ? (
                                <div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={styles.descriptionTextarea}
                                        rows={6}
                                        autoFocus
                                    />
                                    <div className={styles.descriptionActions}>
                                        <button onClick={handleUpdateDescription} className={styles.saveButton}>
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDescription(card.description || '');
                                                setIsEditingDescription(false);
                                            }}
                                            className={styles.cancelButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={styles.descriptionDisplay}
                                    onClick={() => setIsEditingDescription(true)}
                                >
                                    {description || 'Add a more detailed description...'}
                                </div>
                            )}
                        </div>

                        {/* Checklist */}
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>Checklist</h4>
                            {checklistItems.length > 0 && (
                                <div className={styles.checklistProgress}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{
                                                width: `${(checklistItems.filter((i) => i.completed).length /
                                                        checklistItems.length) *
                                                    100
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                    <span className={styles.progressText}>
                                        {checklistItems.filter((i) => i.completed).length}/{checklistItems.length}
                                    </span>
                                </div>
                            )}
                            <div className={styles.checklistItems}>
                                {checklistItems.map((item) => (
                                    <div key={item.id} className={styles.checklistItem}>
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => handleToggleChecklistItem(item)}
                                            className={styles.checkbox}
                                        />
                                        <span className={item.completed ? styles.completedItem : ''}>
                                            {item.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteChecklistItem(item.id)}
                                            className={styles.deleteItemButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {isAddingChecklistItem ? (
                                <div className={styles.addItemForm}>
                                    <input
                                        type="text"
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddChecklistItem();
                                            if (e.key === 'Escape') {
                                                setIsAddingChecklistItem(false);
                                                setNewChecklistItem('');
                                            }
                                        }}
                                        placeholder="Add an item"
                                        autoFocus
                                        className={styles.addItemInput}
                                    />
                                    <div className={styles.addItemActions}>
                                        <button onClick={handleAddChecklistItem} className={styles.addButton}>
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingChecklistItem(false);
                                                setNewChecklistItem('');
                                            }}
                                            className={styles.cancelButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingChecklistItem(true)}
                                    className={styles.addItemButton}
                                >
                                    Add an item
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.sidebar}>
                        <h4 className={styles.sidebarTitle}>Add to card</h4>

                        {/* Labels */}
                        <div className={styles.sidebarSection}>
                            <h5 className={styles.sidebarSectionTitle}>Labels</h5>
                            <div className={styles.labelsList}>
                                {labels.map((label) => (
                                    <button
                                        key={label.id}
                                        onClick={() => handleToggleLabel(label)}
                                        className={styles.labelOption}
                                        style={{ backgroundColor: label.color }}
                                    >
                                        {label.name}
                                        {cardLabels.some((l) => l.id === label.id) && ' ✓'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Members */}
                        <div className={styles.sidebarSection}>
                            <h5 className={styles.sidebarSectionTitle}>Members</h5>
                            <div className={styles.membersList}>
                                {members.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => handleToggleMember(member)}
                                        className={styles.memberOption}
                                    >
                                        <img
                                            src={member.avatarUrl || ''}
                                            alt={member.name}
                                            className={styles.memberAvatar}
                                        />
                                        <span>{member.name}</span>
                                        {cardMembers.some((m) => m.id === member.id) && ' ✓'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className={styles.sidebarSection}>
                            <h5 className={styles.sidebarSectionTitle}>Due Date</h5>
                            <input
                                type="date"
                                value={card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : ''}
                                onChange={(e) => handleSetDueDate(e.target.value || null)}
                                className={styles.dateInput}
                            />
                            {card.dueDate && (
                                <button onClick={() => handleSetDueDate(null)} className={styles.removeDateButton}>
                                    Remove
                                </button>
                            )}
                        </div>

                        <h4 className={styles.sidebarTitle}>Actions</h4>

                        <button onClick={handleArchive} className={styles.actionButton}>
                            Archive
                        </button>
                        <button onClick={handleDelete} className={styles.deleteButton}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
