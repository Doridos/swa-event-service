import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get('/info/all', async (req, res) => {
    const events = await prisma.event.findMany({})
    res.json(events);
})

router.get('/info/:id', async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    res.json(event);
})

router.get('/info/:id/capacity', async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: { capacity: true, soldTickets: true }
    });
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    const availableTickets = event.capacity - event.soldTickets;
    res.json({ availableTickets });
});

router.post('/', async (req, res) => {
    const { name, dateOf, location, capacity, userId } = req.body;
    try {
        const event = await prisma.event.create({
            data: {
                // id is automatically generated
                name,
                dateOf: new Date(dateOf),
                location,
                capacity: parseInt(capacity),
                userId: userId
                // soldTickets and validatedTickets automatically set to 0
            }
        });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, dateOf, location, capacity, userId } = req.body;
    const { id } = req.params;
    try {
        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data: {
                name,
                dateOf: new Date(dateOf),
                location,
                capacity: parseInt(capacity),
                userId: userId
            }
        });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    await prisma.event.delete({
        where: {
            id: parseInt(id),
            userId: userId
        }
    })
    res.json({message: "Event was deleted"})
})

export default router;
