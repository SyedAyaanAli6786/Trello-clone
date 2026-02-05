import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create new list
router.post('/', async (req: Request, res: Response) => {
    try {
        const { boardId, title, position } = req.body;

        if (!boardId || !title) {
            return res.status(400).json({ error: 'Board ID and title are required' });
        }

        // If position not provided, get the max position and add 1
        let listPosition = position;
        if (listPosition === undefined) {
            const maxPosition = await prisma.list.findFirst({
                where: { boardId: parseInt(boardId) },
                orderBy: { position: 'desc' },
                select: { position: true },
            });
            listPosition = maxPosition ? maxPosition.position + 1 : 0;
        }

        const list = await prisma.list.create({
            data: {
                boardId: parseInt(boardId),
                title,
                position: listPosition,
            },
            include: {
                cards: {
                    where: { archived: false },
                    orderBy: { position: 'asc' },
                },
            },
        });

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// Update list title
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const list = await prisma.list.update({
            where: { id: parseInt(id) },
            data: { title },
        });

        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update list' });
    }
});

// Update list position (for drag and drop)
router.put('/:id/position', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { position, boardId } = req.body;

        if (position === undefined || !boardId) {
            return res.status(400).json({ error: 'Position and board ID are required' });
        }

        // Get the list being moved
        const listToMove = await prisma.list.findUnique({
            where: { id: parseInt(id) },
        });

        if (!listToMove) {
            return res.status(404).json({ error: 'List not found' });
        }

        const oldPosition = listToMove.position;
        const newPosition = position;

        // Update positions of other lists
        if (oldPosition < newPosition) {
            // Moving right: decrease position of lists in between
            await prisma.list.updateMany({
                where: {
                    boardId: parseInt(boardId),
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
            // Moving left: increase position of lists in between
            await prisma.list.updateMany({
                where: {
                    boardId: parseInt(boardId),
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

        // Update the moved list
        const updatedList = await prisma.list.update({
            where: { id: parseInt(id) },
            data: { position: newPosition },
        });

        res.json(updatedList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update list position' });
    }
});

// Delete list
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const list = await prisma.list.findUnique({
            where: { id: parseInt(id) },
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Delete the list (cards will be cascade deleted)
        await prisma.list.delete({
            where: { id: parseInt(id) },
        });

        // Update positions of remaining lists
        await prisma.list.updateMany({
            where: {
                boardId: list.boardId,
                position: {
                    gt: list.position,
                },
            },
            data: {
                position: {
                    decrement: 1,
                },
            },
        });

        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

export default router;
