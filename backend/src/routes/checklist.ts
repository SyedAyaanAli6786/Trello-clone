import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Add checklist item to card
router.post('/:cardId/items', async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const { title, position } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // If position not provided, get the max position and add 1
        let itemPosition = position;
        if (itemPosition === undefined) {
            const maxPosition = await prisma.checklistItem.findFirst({
                where: { cardId: parseInt(cardId) },
                orderBy: { position: 'desc' },
                select: { position: true },
            });
            itemPosition = maxPosition ? maxPosition.position + 1 : 0;
        }

        const checklistItem = await prisma.checklistItem.create({
            data: {
                cardId: parseInt(cardId),
                title,
                position: itemPosition,
            },
        });

        res.status(201).json(checklistItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checklist item' });
    }
});

// Update checklist item
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        const checklistItem = await prisma.checklistItem.update({
            where: { id: parseInt(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(completed !== undefined && { completed }),
            },
        });

        res.json(checklistItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update checklist item' });
    }
});

// Delete checklist item
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.checklistItem.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Checklist item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete checklist item' });
    }
});

export default router;
