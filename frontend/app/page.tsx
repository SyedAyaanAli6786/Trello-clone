'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { boardApi } from '@/lib/api';
import Board from '@/components/Board/Board';
import { Header } from '@/components/Header/Header';
import { Inbox } from '@/components/Inbox/Inbox';
import { Planner } from '@/components/Planner/Planner';
import { ViewToggle, ViewType } from '@/components/ViewToggle/ViewToggle';
import { BoardCreationModal } from '@/components/BoardCreationModal/BoardCreationModal';
import { SwitchBoardsDropdown } from '@/components/SwitchBoardsDropdown/SwitchBoardsDropdown';
import type { Board as BoardType } from '@/types';
import type { VisibilityOption } from '@/lib/backgrounds';
import styles from './page.module.css';

export default function Home() {
    const router = useRouter();
    const [board, setBoard] = useState<BoardType | null>(null);
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeViews, setActiveViews] = useState<ViewType[]>(['board']);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSwitchBoardsOpen, setIsSwitchBoardsOpen] = useState(false);

    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        try {
            setLoading(true);
            setError(null);
            // Load all boards
            const response = await boardApi.getAll();
            const allBoards = response.data;
            setBoards(allBoards);

            // Set the first board as active
            if (allBoards.length > 0) {
                setBoard(allBoards[0]);
            }
        } catch (err) {
            console.error('Failed to load boards:', err);
            setError('Failed to load boards. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const loadBoard = async (boardId: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await boardApi.getById(boardId);
            setBoard(response.data);
        } catch (err) {
            console.error('Failed to load board:', err);
            setError('Failed to load board.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (title: string, background: string, visibility: VisibilityOption) => {
        try {
            setLoading(true);
            const response = await boardApi.create({
                title,
                backgroundColor: background
            });
            const newBoard = response.data;

            // Add to boards list and set as active
            setBoards(prev => [...prev, newBoard]);
            setBoard(newBoard);
            setIsCreateModalOpen(false);
            setIsSwitchBoardsOpen(false);
        } catch (err) {
            console.error('Failed to create board:', err);
            setError('Failed to create board.');
        } finally {
            setLoading(false);
        }
    };

    const handleBoardSwitch = (boardId: number) => {
        loadBoard(boardId);
        setIsSwitchBoardsOpen(false);
    };

    const handleToggleView = (view: ViewType) => {
        setActiveViews(prev => {
            if (prev.includes(view)) {
                // Remove view if already active
                return prev.filter(v => v !== view);
            } else {
                // Add view in correct order: inbox, planner, board
                const newViews = [...prev, view];
                return newViews.sort((a, b) => {
                    const order = { inbox: 0, planner: 1, board: 2 };
                    return order[a] - order[b];
                });
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>⚠️ Error</h2>
                <p>{error}</p>
                <button onClick={loadBoards} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (!board) {
        return (
            <div className={styles.error}>
                <h2>No board found</h2>
                <p>Please seed the database first.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header
                onCreateBoard={() => setIsCreateModalOpen(true)}
                boards={boards}
                onBoardSelect={handleBoardSwitch}
            />
            <BoardCreationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateBoard}
            />
            <SwitchBoardsDropdown
                isOpen={isSwitchBoardsOpen}
                onClose={() => setIsSwitchBoardsOpen(false)}
                boards={boards}
                currentBoardId={board?.id || null}
                onBoardSelect={handleBoardSwitch}
                onCreateBoard={() => setIsCreateModalOpen(true)}
            />
            <main className={styles.main}>
                <div className={styles.viewsContainer}>
                    {activeViews.includes('inbox') && (
                        <Inbox boardId={board.id} />
                    )}
                    {activeViews.includes('planner') && (
                        <Planner boardId={board.id} />
                    )}
                    {activeViews.includes('board') && (
                        <div className={styles.boardWrapper}>
                            <Board board={board} onBoardUpdate={() => loadBoard(board.id)} />
                        </div>
                    )}
                </div>
            </main>
            <ViewToggle
                activeViews={activeViews}
                onToggleView={handleToggleView}
                onSwitchBoards={() => setIsSwitchBoardsOpen(true)}
            />
        </div>
    );
}
