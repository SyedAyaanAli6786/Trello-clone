import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all members
router.get('/', async (req: Request, res: Response) => {
    try {
        const members = await prisma.member.findMany();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Assign member to card
router.post('/:cardId/members', async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        // Check if the card-member relationship already exists
        const existing = await prisma.cardMember.findFirst({
            where: {
                cardId: parseInt(cardId),
                memberId: parseInt(memberId),
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'Member already assigned to card' });
        }

        const cardMember = await prisma.cardMember.create({
            data: {
                cardId: parseInt(cardId),
                memberId: parseInt(memberId),
            },
            include: {
                member: true,
            },
        });

        res.status(201).json(cardMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign member to card' });
    }
});

// Remove member from card
router.delete('/:cardId/members/:memberId', async (req: Request, res: Response) => {
    try {
        const { cardId, memberId } = req.params;

        const cardMember = await prisma.cardMember.findFirst({
            where: {
                cardId: parseInt(cardId),
                memberId: parseInt(memberId),
            },
        });

        if (!cardMember) {
            return res.status(404).json({ error: 'Card member not found' });
        }

        await prisma.cardMember.delete({
            where: { id: cardMember.id },
        });

        res.json({ message: 'Member removed from card successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member from card' });
    }
});

export default router;
