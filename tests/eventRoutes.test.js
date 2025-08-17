import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const prismaMock = {
    event: {
        findMany:  jest.fn().mockResolvedValue([{ id: 1, name: 'Test', capacity: 100, dateOf: new Date().toISOString() }]),
        findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test', capacity: 100, dateOf: new Date().toISOString() }),
        create:    jest.fn().mockResolvedValue({ id: 2, name: 'New Event' }),
        update:    jest.fn().mockResolvedValue({ id: 1, name: 'Updated Event' }),
        delete:    jest.fn().mockResolvedValue({ id: 1 })
    }
};

jest.unstable_mockModule('../src/prismaClient.js', () => ({
    default: prismaMock,
    prisma: prismaMock,
}));

jest.unstable_mockModule('axios', () => ({
    default: { get: jest.fn().mockResolvedValue({ data: [{ eventId: 1, ticketsSold: 10 }] }) },
}));

jest.unstable_mockModule('../src/consul.js', () => ({
    default: jest.fn().mockResolvedValue('http://mocked-service'),
}));

const { default: eventRoutes } = await import('../src/routes/eventRoutes.js');

const app = express();
app.use(express.json());
app.use('/events', eventRoutes);

describe('Event Routes', () => {
    test('GET /events/info/all', async () => {
        const res = await request(app).get('/events/info/all');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /events/', async () => {
        const res = await request(app)
            .post('/events/')
            .send({ name: 'New Event', dateOf: new Date().toISOString(), location: 'Test', capacity: 100, userId: 1 });
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('New Event');
    });

    test('PUT /events/1', async () => {
        const res = await request(app).put('/events/1').send({ name: 'Updated Event' });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated Event');
    });

    test('DELETE /events/1', async () => {
        const res = await request(app).delete('/events/1').set('userId', '1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Event was deleted');
    });

    test('GET /events/info/1/validatedCount', async () => {
        const axios = await import('axios');
        axios.default.get.mockResolvedValueOnce({ data: 5 });

        const res = await request(app).get('/events/info/1/validatedCount');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ eventId: '1', validatedTickets: 5 });
    });

    test('GET /events/info/all/available (mock external)', async () => {
        const res = await request(app).get('/events/info/all/available');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
