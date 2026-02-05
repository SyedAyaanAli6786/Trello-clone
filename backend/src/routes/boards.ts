import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all boards
router.get('/', async (req: Request, res: Response) => {
    try {
        const boards = await prisma.board.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

// Get board by ID with all lists and cards
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const board = await prisma.board.findUnique({
            where: { id: parseInt(id) },
            include: {
                lists: {
                    orderBy: { position: 'asc' },
                    include: {
                        cards: {
                            where: { archived: false },
                            orderBy: { position: 'asc' },
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
                        },
                    },
                },
            },
        });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch board' });
    }
});

// Create new board
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, backgroundColor } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const board = await prisma.board.create({
            data: {
                title,
                backgroundColor: backgroundColor || '#0079bf',
            },
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create board' });
    }
});

// Update board
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, backgroundColor } = req.body;

        const board = await prisma.board.update({
            where: { id: parseInt(id) },
            data: {
                ...(title && { title }),
                ...(backgroundColor && { backgroundColor }),
            },
        });

        res.json(board);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update board' });
    }
});

// Delete board
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.board.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

export default router;
