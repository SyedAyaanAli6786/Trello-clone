import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all labels
router.get('/', async (req: Request, res: Response) => {
    try {
        const labels = await prisma.label.findMany();
        res.json(labels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch labels' });
    }
});

// Add label to card
router.post('/:cardId/labels', async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const { labelId } = req.body;

        if (!labelId) {
            return res.status(400).json({ error: 'Label ID is required' });
        }

        // Check if the card-label relationship already exists
        const existing = await prisma.cardLabel.findFirst({
            where: {
                cardId: parseInt(cardId),
                labelId: parseInt(labelId),
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'Label already added to card' });
        }

        const cardLabel = await prisma.cardLabel.create({
            data: {
                cardId: parseInt(cardId),
                labelId: parseInt(labelId),
            },
            include: {
                label: true,
            },
        });

        res.status(201).json(cardLabel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add label to card' });
    }
});

// Remove label from card
router.delete('/:cardId/labels/:labelId', async (req: Request, res: Response) => {
    try {
        const { cardId, labelId } = req.params;

        const cardLabel = await prisma.cardLabel.findFirst({
            where: {
                cardId: parseInt(cardId),
                labelId: parseInt(labelId),
            },
        });

        if (!cardLabel) {
            return res.status(404).json({ error: 'Card label not found' });
        }

        await prisma.cardLabel.delete({
            where: { id: cardLabel.id },
        });

        res.json({ message: 'Label removed from card successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove label from card' });
    }
});

export default router;
