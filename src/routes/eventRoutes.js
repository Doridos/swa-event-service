import express from "express";
import prisma from "../prismaClient.js";
import axios from "axios";
import getServiceUrl from "../consul.js";


const router = express.Router();

router.get('/info/all', async (req, res) => {
    const events = await prisma.event.findMany({})
    res.json(events);
})



router.get('/info/all/available', async (req, res) => {
    const ticketServiceUrl = await getServiceUrl("ticket-sale-spring")
    console.log(ticketServiceUrl)
    try {
        const soldTicketsResponse = await axios.get(`${ticketServiceUrl}/api/v1/tickets/sold/`);
        const soldTicketsMap = {};
        soldTicketsResponse.data.forEach(item => {
            soldTicketsMap[item.eventId] = item.soldTickets;
        });

        const now = new Date();
        now.setHours(0, 0, 0, 0); // set the time to start of day

        const allEvents = await prisma.event.findMany({});

        const availableEvents = allEvents.filter(event => {
            const eventDate = new Date(event.dateOf);
            eventDate.setHours(0, 0, 0, 0);
            const sold = soldTicketsMap[event.id] || 0;
            return (event.capacity - sold) > 0 && eventDate >= now;
        });

        res.json(availableEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//TODO write endpoint only of events which have available places
// Tom will call validator service
// I will get how many tickets were sold by calling endpoint of Lucas and how many were verified calling the validator event
// TODO OpenApi spec and consul

router.get('/info/:id', async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    else {
        res.json(event);
    }
})

router.get('/info/:id/validatedCount', async (req, res) => {
    const ticketServiceUrl = await getServiceUrl("ticket-validation-service")

    const { id } = req.params;
    const validatedTicketsResponse = await axios.get(`${ticketServiceUrl}/api/event/${id}/validated-tickets-count`);
    const returnJson = {
        eventId: id,
        validatedTickets: validatedTicketsResponse.data.validatedTicketsCount
    }
    res.json(returnJson);
})

router.get('/info/:id/capacity', async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: { capacity: true }
    });
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    const eventCapacity = event.capacity
    res.json({ eventCapacity });
    //return only capacity, because availableTickets is unnecessarily
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
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.dateOf !== undefined) data.dateOf = new Date(req.body.dateOf);
    if (req.body.location !== undefined) data.location = req.body.location;
    if (req.body.capacity !== undefined) data.capacity = parseInt(req.body.capacity);
    if (req.body.userId !== undefined) data.userId = req.body.userId;

    try {
        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data
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
