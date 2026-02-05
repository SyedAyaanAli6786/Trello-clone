'use client';

import { useState, useEffect, useRef } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { listApi, cardApi } from '@/lib/api';
import Card from '@/components/Card/Card';
import type { List as ListType, Card as CardType, Label, Member } from '@/types';
import styles from './List.module.css';

interface ListProps {
    list: ListType;
    index: number;
    onDelete: (listId: number) => void;
    onUpdate: (updatedList: ListType) => void;
    onRefresh?: () => void;
    labels: Label[];
    members: Member[];
}

export default function List({ list, index, onDelete, onUpdate, onRefresh, labels, members }: ListProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cards, setCards] = useState<CardType[]>(list.cards || []);

    // Sync local state with props
    useEffect(() => {
        setCards(list.cards || []);
    }, [list.cards]);

    // Collapse/Expand state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Actions menu state
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showActionsTooltip, setShowActionsTooltip] = useState(false);
    const [showCollapseTooltip, setShowCollapseTooltip] = useState(false);
    const [showExpandTooltip, setShowExpandTooltip] = useState(false);
    const [menuView, setMenuView] = useState<'MAIN' | 'ARCHIVE_CARDS_CONFIRM'>('MAIN');

    // Refs for outside click detection
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Outside click detection for actions menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setShowActionsMenu(false);
                setMenuView('MAIN'); // Reset view on close
            }
        };

        if (showActionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsMenu]);

    const handleUpdateTitle = async () => {
        if (title.trim() && title !== list.title) {
            try {
                const response = await listApi.update(list.id, { title: title.trim() });
                onUpdate(response.data);
            } catch (error) {
                console.error('Error updating list title:', error);
                setTitle(list.title);
            }
        }
        setIsEditingTitle(false);
    };

    const handleTitleBlur = async () => {
        handleUpdateTitle();
    };

    const handleAddCard = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newCardTitle.trim()) return;

        try {
            const response = await cardApi.create({
                listId: list.id,
                title: newCardTitle,
            });

            const newCard = response.data;
            const updatedCards = [...cards, newCard];
            setCards(updatedCards);
            setNewCardTitle('');
            setIsAddingCard(false);
            onUpdate({ ...list, cards: updatedCards });
        } catch (error) {
            console.error('Failed to create card:', error);
        }
    };

    const handleDeleteCard = async (cardId: number) => {
        try {
            await cardApi.delete(cardId);
            const updatedCards = cards.filter((card) => card.id !== cardId);
            setCards(updatedCards);
            onUpdate({ ...list, cards: updatedCards });
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    const handleUpdateCard = (updatedCard: CardType) => {
        const updatedCards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
        setCards(updatedCards);
        onUpdate({ ...list, cards: updatedCards });
    };

    const handleCancelAddCard = () => {
        setIsAddingCard(false);
        setNewCardTitle('');
    };

    const handleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        setShowCollapseTooltip(false);
    };

    const handleExpand = () => {
        setIsCollapsed(false);
        setShowExpandTooltip(false);
    };

    const handleActionsMenuToggle = () => {
        setShowActionsMenu(!showActionsMenu);
        setShowActionsTooltip(false);
        setMenuView('MAIN'); // Reset view on toggle
    };

    const handleCopyList = async () => {
        try {
            // Create a copy of the list with the SAME title
            const response = await listApi.create({
                boardId: list.boardId,
                title: list.title, // Requirement: Same name as original
                position: list.position + 1 // Requirement: Immediately next to original
            });
            const newList = response.data;

            // Copy all cards from the original list
            for (const card of cards) {
                await cardApi.create({
                    listId: newList.id,
                    title: card.title,
                    description: card.description || ''
                });
            }

            setShowActionsMenu(false);
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error copying list:', error);
        }
    };

    const handleArchiveAllCards = async () => {
        try {
            // Delete all cards in the list
            for (const card of cards) {
                await cardApi.delete(card.id);
            }
            setCards([]); // Clear local state
            setShowActionsMenu(false);
            if (onRefresh) {
                onRefresh(); // Ensure board state is consistent
            }
        } catch (error) {
            console.error('Error archiving all cards:', error);
        }
    };

    const handleArchiveList = async () => {
        try {
            onDelete(list.id);
            setShowActionsMenu(false);
        } catch (error) {
            console.error('Error archiving list:', error);
        }
    };

    return (
        <Draggable draggableId={list.id.toString()} index={index}>
            {(provided, snapshot) => {
                // Render collapsed state
                if (isCollapsed) {
                    return (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${styles.list} ${styles.listCollapsed} ${snapshot.isDragging ? styles.isDragging : ''} `}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className={styles.collapsedContainer}>
                                <div className={styles.collapsedHeader} {...provided.dragHandleProps}>
                                    <div className={styles.collapsedTitle}>{title}</div>
                                </div>
                                {isHovered && (
                                    <div className={styles.expandButtonWrapper}>
                                        <button
                                            className={styles.expandButton}
                                            onClick={handleExpand}
                                            onMouseEnter={() => setShowExpandTooltip(true)}
                                            onMouseLeave={() => setShowExpandTooltip(false)}
                                        >
                                            ›
                                        </button>
                                        {showExpandTooltip && (
                                            <div className={styles.tooltip}>Expand list</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                // Render expanded state
                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${styles.list} ${snapshot.isDragging ? styles.isDragging : ''} `}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className={styles.listHeader} {...provided.dragHandleProps}>
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    className={styles.listTitleInput}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleTitleBlur();
                                        } else if (e.key === 'Escape') {
                                            setTitle(list.title);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className={styles.listTitle}
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {title}
                                </div>
                            )}

                            <div className={styles.listHeaderActions}>
                                {isHovered && (
                                    <div className={styles.collapseButtonWrapper}>
                                        <button
                                            className={styles.collapseButton}
                                            onClick={handleCollapse}
                                            onMouseEnter={() => setShowCollapseTooltip(true)}
                                            onMouseLeave={() => setShowCollapseTooltip(false)}
                                        >
                                            ‹
                                        </button>
                                        {showCollapseTooltip && (
                                            <div className={styles.tooltip}>Collapse list</div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.actionsMenuWrapper} ref={actionsMenuRef}>
                                    <button
                                        className={styles.listMenu}
                                        onClick={handleActionsMenuToggle}
                                        onMouseEnter={() => !showActionsMenu && setShowActionsTooltip(true)}
                                        onMouseLeave={() => setShowActionsTooltip(false)}
                                    >
                                        ⋯
                                    </button>
                                    {showActionsTooltip && !showActionsMenu && (
                                        <div className={styles.tooltip}>List actions</div>
                                    )}

                                    {showActionsMenu && (
                                        <div className={styles.actionsDropdown}>
                                            <div className={styles.dropdownHeader}>
                                                {menuView === 'MAIN' ? (
                                                    <>
                                                        <span>List actions</span>
                                                        <button
                                                            className={styles.closeDropdown}
                                                            onClick={() => setShowActionsMenu(false)}
                                                        >
                                                            ×
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={styles.backButton}
                                                            onClick={() => setMenuView('MAIN')}
                                                        >
                                                            ‹
                                                        </button>
                                                        <span>Are you sure?</span>
                                                        <button
                                                            className={styles.closeDropdown}
                                                            onClick={() => setShowActionsMenu(false)}
                                                        >
                                                            ×
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <div className={styles.dropdownContent}>
                                                {menuView === 'MAIN' ? (
                                                    <>
                                                        <button
                                                            className={styles.menuItem}
                                                            onClick={() => {
                                                                setIsAddingCard(true);
                                                                setShowActionsMenu(false);
                                                            }}
                                                        >
                                                            Add card…
                                                        </button>
                                                        <button className={styles.menuItem} onClick={handleCopyList}>
                                                            Copy list…
                                                        </button>
                                                        <button className={styles.menuItem}>
                                                            Move list…
                                                        </button>
                                                        <button className={styles.menuItem}>
                                                            Watch
                                                            <span className={styles.premiumBadge}>PREMIUM</span>
                                                        </button>
                                                        <div className={styles.menuDivider} />
                                                        <button className={styles.menuItem}>
                                                            Sort by…
                                                        </button>
                                                        <div className={styles.menuDivider} />
                                                        <button className={styles.menuItem}>
                                                            Automation
                                                            <span className={styles.chevronRight}>›</span>
                                                        </button>
                                                        <div className={styles.menuDivider} />
                                                        <button className={styles.menuItem}>
                                                            Move all cards in this list…
                                                        </button>
                                                        <button
                                                            className={styles.menuItem}
                                                            onClick={() => setMenuView('ARCHIVE_CARDS_CONFIRM')}
                                                        >
                                                            Archive all cards in this list…
                                                        </button>
                                                        <div className={styles.menuDivider} />
                                                        <button className={styles.menuItem} onClick={handleArchiveList}>
                                                            Archive this list
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={styles.confirmContent}>
                                                        <p className={styles.confirmText}>
                                                            All cards in this list will be archived.
                                                        </p>
                                                        <button
                                                            className={styles.confirmButton}
                                                            onClick={handleArchiveAllCards}
                                                        >
                                                            Archive cards
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Droppable droppableId={list.id.toString()} type="card">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`${styles.cardsContainer} ${snapshot.isDraggingOver ? styles.isDraggingOver : ''} `}
                                >
                                    {cards.map((card, index) => (
                                        <Card
                                            key={card.id}
                                            card={card}
                                            index={index}
                                            onDelete={handleDeleteCard}
                                            onUpdate={handleUpdateCard}
                                            labels={labels}
                                            members={members}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {isAddingCard ? (
                            <div className={styles.addCardForm}>
                                <textarea
                                    placeholder="Enter a title for this card..."
                                    value={newCardTitle}
                                    onChange={(e) => setNewCardTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddCard();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsAddingCard(false);
                                            setNewCardTitle('');
                                        }
                                    }}
                                    autoFocus
                                    className={styles.addCardTextarea}
                                    rows={3}
                                />
                                <div className={styles.addCardActions}>
                                    <button onClick={() => handleAddCard()} className={styles.addCardSubmit}>
                                        Add card
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingCard(false);
                                            setNewCardTitle('');
                                        }}
                                        className={styles.addCardCancel}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingCard(true)} className={styles.addCardButton}>
                                <span>+ Add a card</span>
                            </button>
                        )}
                    </div>
                );
            }}
        </Draggable>
    );
}
