import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create new card
router.post('/', async (req: Request, res: Response) => {
    try {
        const { listId, title, description, position } = req.body;

        if (!listId || !title) {
            return res.status(400).json({ error: 'List ID and title are required' });
        }

        // If position not provided, get the max position and add 1
        let cardPosition = position;
        if (cardPosition === undefined) {
            const maxPosition = await prisma.card.findFirst({
                where: { listId: parseInt(listId), archived: false },
                orderBy: { position: 'desc' },
                select: { position: true },
            });
            cardPosition = maxPosition ? maxPosition.position + 1 : 0;
        }

        const card = await prisma.card.create({
            data: {
                listId: parseInt(listId),
                title,
                description: description || null,
                position: cardPosition,
            },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                checklistItems: {
                    orderBy: { position: 'asc' },
                },
            },
        });

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// Get card by ID with full details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                checklistItems: {
                    orderBy: { position: 'asc' },
                },
                list: {
                    include: {
                        board: true,
                    },
                },
            },
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

// Update card
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate } = req.body;

        const card = await prisma.card.update({
            where: { id: parseInt(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
            },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                checklistItems: {
                    orderBy: { position: 'asc' },
                },
            },
        });

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card' });
    }
});

// Move card (between lists or reorder within list)
router.put('/:id/move', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { listId, position } = req.body;

        if (!listId || position === undefined) {
            return res.status(400).json({ error: 'List ID and position are required' });
        }

        const cardToMove = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });

        if (!cardToMove) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const oldListId = cardToMove.listId;
        const oldPosition = cardToMove.position;
        const newListId = parseInt(listId);
        const newPosition = position;

        if (oldListId === newListId) {
            // Reordering within the same list
            if (oldPosition < newPosition) {
                // Moving down: decrease position of cards in between
                await prisma.card.updateMany({
                    where: {
                        listId: oldListId,
                        archived: false,
                        position: {
                            gt: oldPosition,
                            lte: newPosition,
                        },
                    },
                    data: {
                        position: {
                            decrement: 1,
                        },
                    },
                });
            } else if (oldPosition > newPosition) {
                // Moving up: increase position of cards in between
                await prisma.card.updateMany({
                    where: {
                        listId: oldListId,
                        archived: false,
                        position: {
                            gte: newPosition,
                            lt: oldPosition,
                        },
                    },
                    data: {
                        position: {
                            increment: 1,
                        },
                    },
                });
            }
        } else {
            // Moving to a different list
            // Decrease position of cards after the old position in old list
            await prisma.card.updateMany({
                where: {
                    listId: oldListId,
                    archived: false,
                    position: {
                        gt: oldPosition,
                    },
                },
                data: {
                    position: {
                        decrement: 1,
                    },
                },
            });

            // Increase position of cards at or after new position in new list
            await prisma.card.updateMany({
                where: {
                    listId: newListId,
                    archived: false,
                    position: {
                        gte: newPosition,
                    },
                },
                data: {
                    position: {
                        increment: 1,
                    },
                },
            });
        }

        // Update the moved card
        const updatedCard = await prisma.card.update({
            where: { id: parseInt(id) },
            data: {
                listId: newListId,
                position: newPosition,
            },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                checklistItems: {
                    orderBy: { position: 'asc' },
                },
            },
        });

        res.json(updatedCard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to move card' });
    }
});

// Archive/unarchive card
router.put('/:id/archive', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { archived } = req.body;

        if (archived === undefined) {
            return res.status(400).json({ error: 'Archived status is required' });
        }

        const card = await prisma.card.update({
            where: { id: parseInt(id) },
            data: { archived },
        });

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to archive card' });
    }
});

// Delete card
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        await prisma.card.delete({
            where: { id: parseInt(id) },
        });

        // Update positions of remaining cards
        await prisma.card.updateMany({
            where: {
                listId: card.listId,
                archived: false,
                position: {
                    gt: card.position,
                },
            },
            data: {
                position: {
                    decrement: 1,
                },
            },
        });

        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

// Search cards by title
router.get('/search/query', async (req: Request, res: Response) => {
    try {
        const { q, boardId } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const cards = await prisma.card.findMany({
            where: {
                title: {
                    contains: q as string,
                    mode: 'insensitive',
                },
                archived: false,
                ...(boardId && {
                    list: {
                        boardId: parseInt(boardId as string),
                    },
                }),
            },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                list: true,
            },
        });

        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search cards' });
    }
});

// Filter cards
router.get('/filter/query', async (req: Request, res: Response) => {
    try {
        const { boardId, labelIds, memberIds, dueDateFrom, dueDateTo } = req.query;

        if (!boardId) {
            return res.status(400).json({ error: 'Board ID is required' });
        }

        const cards = await prisma.card.findMany({
            where: {
                archived: false,
                list: {
                    boardId: parseInt(boardId as string),
                },
                ...(labelIds && {
                    cardLabels: {
                        some: {
                            labelId: {
                                in: (labelIds as string).split(',').map((id) => parseInt(id)),
                            },
                        },
                    },
                }),
                ...(memberIds && {
                    cardMembers: {
                        some: {
                            memberId: {
                                in: (memberIds as string).split(',').map((id) => parseInt(id)),
                            },
                        },
                    },
                }),
                ...(dueDateFrom &&
                    dueDateTo && {
                    dueDate: {
                        gte: new Date(dueDateFrom as string),
                        lte: new Date(dueDateTo as string),
                    },
                }),
            },
            include: {
                cardLabels: {
                    include: { label: true },
                },
                cardMembers: {
                    include: { member: true },
                },
                checklistItems: {
                    orderBy: { position: 'asc' },
                },
                list: true,
            },
        });

        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to filter cards' });
    }
});

export default router;
