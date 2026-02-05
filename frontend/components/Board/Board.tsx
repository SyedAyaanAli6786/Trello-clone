'use client';

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { listApi, cardApi, labelApi, memberApi } from '@/lib/api';
import List from '@/components/List/List';
import type { Board as BoardType, List as ListType, Label, Member } from '@/types';
import styles from './Board.module.css';

interface BoardProps {
    board: BoardType;
    onBoardUpdate: () => void;
}

export default function Board({ board, onBoardUpdate }: BoardProps) {
    const [lists, setLists] = useState<ListType[]>(board.lists || []);
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList, setIsAddingList] = useState(false);
    const [labels, setLabels] = useState<Label[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        setLists(board.lists || []);
        loadLabelsAndMembers();
    }, [board]);

    const loadLabelsAndMembers = async () => {
        try {
            const [labelsRes, membersRes] = await Promise.all([
                labelApi.getAll(),
                memberApi.getAll(),
            ]);
            setLabels(labelsRes.data);
            setMembers(membersRes.data);
        } catch (error) {
            console.error('Failed to load labels and members:', error);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, type } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        if (type === 'list') {
            // Reorder lists
            const newLists = Array.from(lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);

            // Update positions
            const updatedLists = newLists.map((list, index) => ({
                ...list,
                position: index,
            }));

            setLists(updatedLists);

            // Update on server
            try {
                await listApi.updatePosition(movedList.id, {
                    position: destination.index,
                    boardId: board.id,
                });
            } catch (error) {
                console.error('Failed to update list position:', error);
                setLists(lists); // Revert on error
            }
        } else if (type === 'card') {
            // Move card
            const sourceListIndex = lists.findIndex((list) => list.id.toString() === source.droppableId);
            const destListIndex = lists.findIndex((list) => list.id.toString() === destination.droppableId);

            if (sourceListIndex === -1 || destListIndex === -1) return;

            const newLists = Array.from(lists);
            const sourceList = { ...newLists[sourceListIndex] };
            const destList = { ...newLists[destListIndex] };

            const sourceCards = Array.from(sourceList.cards || []);
            const [movedCard] = sourceCards.splice(source.index, 1);

            if (source.droppableId === destination.droppableId) {
                // Same list
                sourceCards.splice(destination.index, 0, movedCard);
                sourceList.cards = sourceCards;
                newLists[sourceListIndex] = sourceList;
            } else {
                // Different lists
                const destCards = Array.from(destList.cards || []);
                destCards.splice(destination.index, 0, movedCard);
                sourceList.cards = sourceCards;
                destList.cards = destCards;
                newLists[sourceListIndex] = sourceList;
                newLists[destListIndex] = destList;
            }

            setLists(newLists);

            // Update on server
            try {
                await cardApi.move(movedCard.id, {
                    listId: parseInt(destination.droppableId),
                    position: destination.index,
                });
            } catch (error) {
                console.error('Failed to move card:', error);
                setLists(lists); // Revert on error
            }
        }
    };

    const handleAddList = async () => {
        if (!newListTitle.trim()) return;

        try {
            const response = await listApi.create({
                boardId: board.id,
                title: newListTitle,
            });

            setLists([...lists, response.data]);
            setNewListTitle('');
            setIsAddingList(false);
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    };

    const handleDeleteList = async (listId: number) => {
        try {
            await listApi.delete(listId);
            setLists(lists.filter((list) => list.id !== listId));
        } catch (error) {
            console.error('Failed to delete list:', error);
        }
    };

    const handleUpdateList = (updatedList: ListType) => {
        setLists(lists.map((list) => (list.id === updatedList.id ? updatedList : list)));
    };

    const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
    const [visibility, setVisibility] = useState<'private' | 'workspace' | 'organization' | 'public'>('workspace');
    const [isStarHovered, setIsStarHovered] = useState(false);
    const [isFilterHovered, setIsFilterHovered] = useState(false);

    // Get background style from board
    const getBackgroundStyle = () => {
        if (board.backgroundColor) {
            // Check if it's a URL (photo)
            if (board.backgroundColor.startsWith('http')) {
                return {
                    backgroundImage: `url(${board.backgroundColor})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                };
            }
            // Otherwise it's a color or gradient
            return { background: board.backgroundColor };
        }
        return { background: '#0079bf' }; // Default blue
    };

    const visibilityRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (visibilityRef.current && !visibilityRef.current.contains(event.target as Node)) {
                setIsVisibilityOpen(false);
            }
        };

        if (isVisibilityOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisibilityOpen]);

    return (
        <div className={styles.boardContainer} style={getBackgroundStyle()}>
            <div className={styles.boardHeader}>
                <h1 className={styles.boardTitle}>{board.title}</h1>

                <div className={styles.boardHeaderRight}>
                    <div className={styles.filterWrapper}
                        onMouseEnter={() => setIsFilterHovered(true)}
                        onMouseLeave={() => setIsFilterHovered(false)}>
                        <button className={styles.boardIconButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                            </svg>
                        </button>
                        {isFilterHovered && (
                            <div className={styles.filterTooltip}>
                                Filter cards <span className={styles.shortcutKey}>F</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.starWrapper}
                        onMouseEnter={() => setIsStarHovered(true)}
                        onMouseLeave={() => setIsStarHovered(false)}>
                        <button className={styles.boardIconButton}>
                            <span>☆</span>
                        </button>
                        {isStarHovered && (
                            <div className={styles.starTooltip}>
                                Click to star or unstar this board. Starred boards show up at the top of your boards list.
                            </div>
                        )}
                    </div>

                    <div className={styles.visibilityWrapper} ref={visibilityRef}>
                        <button
                            className={styles.boardIconButton}
                            onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                            title="Change visibility"
                        >
                            <span>👥</span>
                        </button>

                        {isVisibilityOpen && (
                            <div className={styles.visibilityPopup}>
                                <div className={styles.popupHeader}>
                                    <span>Change visibility</span>
                                    <button
                                        className={styles.closePopup}
                                        onClick={() => setIsVisibilityOpen(false)}
                                    >✕</button>
                                </div>
                                <div className={styles.popupContent}>
                                    <button
                                        className={`${styles.visibilityOption} ${visibility === 'private' ? styles.selected : ''}`}
                                        onClick={() => setVisibility('private')}
                                    >
                                        <span className={styles.visibilityIcon}>🔒</span>
                                        <div className={styles.visibilityInfo}>
                                            <div className={styles.visibilityTitle}>Private</div>
                                            <div className={styles.visibilityDesc}>
                                                Board members and Trello Workspace Workspace admins can see and edit this board.
                                            </div>
                                        </div>
                                        {visibility === 'private' && <span className={styles.checkIcon}>✓</span>}
                                    </button>

                                    <button
                                        className={`${styles.visibilityOption} ${visibility === 'workspace' ? styles.selected : ''}`}
                                        onClick={() => setVisibility('workspace')}
                                    >
                                        <span className={styles.visibilityIcon}>👥</span>
                                        <div className={styles.visibilityInfo}>
                                            <div className={styles.visibilityTitle}>Workspace</div>
                                            <div className={styles.visibilityDesc}>
                                                All members of the Trello Workspace Workspace can see and edit this board.
                                            </div>
                                        </div>
                                        {visibility === 'workspace' && <span className={styles.checkIcon}>✓</span>}
                                    </button>

                                    <button
                                        className={`${styles.visibilityOption} ${visibility === 'organization' ? styles.selected : ''}`}
                                        onClick={() => setVisibility('organization')}
                                    >
                                        <span className={styles.visibilityIcon}>🏢</span>
                                        <div className={styles.visibilityInfo}>
                                            <div className={styles.visibilityTitle}>Organization</div>
                                            <div className={styles.visibilityDesc}>
                                                All members of the organization can see this board. The board must be added to an enterprise Workspace to enable this.
                                            </div>
                                        </div>
                                        {visibility === 'organization' && <span className={styles.checkIcon}>✓</span>}
                                    </button>

                                    <button
                                        className={`${styles.visibilityOption} ${visibility === 'public' ? styles.selected : ''}`}
                                        onClick={() => setVisibility('public')}
                                    >
                                        <span className={styles.visibilityIcon}>🌍</span>
                                        <div className={styles.visibilityInfo}>
                                            <div className={styles.visibilityTitle}>Public</div>
                                            <div className={styles.visibilityDesc}>
                                                Anyone on the internet can see this board. Only board members can edit.
                                            </div>
                                        </div>
                                        {visibility === 'public' && <span className={styles.checkIcon}>✓</span>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className={styles.shareButton}>
                        <span>👤</span>
                        <span>Share</span>
                    </button>

                    <button className={styles.boardIconButton} title="Menu">
                        <span>⋯</span>
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board" type="list" direction="horizontal">
                    {(provided) => (
                        <div
                            className={styles.listsContainer}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {lists.map((list, index) => (
                                <List
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    onDelete={handleDeleteList}
                                    onUpdate={handleUpdateList}
                                    onRefresh={onBoardUpdate}
                                    labels={labels}
                                    members={members}
                                />
                            ))}
                            {provided.placeholder}

                            {isAddingList ? (
                                <div className={styles.addListForm}>
                                    <input
                                        type="text"
                                        placeholder="Enter list title..."
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddList();
                                            if (e.key === 'Escape') {
                                                setIsAddingList(false);
                                                setNewListTitle('');
                                            }
                                        }}
                                        autoFocus
                                        className={styles.addListInput}
                                    />
                                    <div className={styles.addListActions}>
                                        <button onClick={handleAddList} className={styles.addListSubmit}>
                                            Add List
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingList(false);
                                                setNewListTitle('');
                                            }}
                                            className={styles.addListCancel}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingList(true)}
                                    className={styles.addListButton}
                                >
                                    + Add another list
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
