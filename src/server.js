import express from 'express';
import eventRoutes from "./routes/eventRoutes.js";
import Consul from "consul";
import os from "os";

const app = express();
const PORT = Number(process.env.PORT) || 8383;

// Consul configuration
const CONSUL_HOST = process.env.CONSUL_URL; // default consul host
const CONSUL_PORT = 8500; // default consul port

const consulClient = new Consul({
    host: CONSUL_HOST,
    port: CONSUL_PORT,
    promisify: true
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/', eventRoutes);

function getContainerIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

app.listen(PORT, async () => {
    // Register to consul
    const serviceId = `event-service-${PORT}`;
    const SERVICE_ADDRESS = process.env.HOST || getContainerIP();
    let consulRegistered = false;
    try {
        await consulClient.agent.service.register({
            id: serviceId,
            name: 'event-service',
            address: SERVICE_ADDRESS,
            port: PORT,
            check: {
                http: `http://${SERVICE_ADDRESS}:${PORT}/health`,
                interval: '10s'
            }
        });
        consulRegistered = true;
    } catch (err){
        console.log(err);
        console.error("Was not able to register in consul")
    }
    if (consulRegistered) {
        console.log(`Server started on port ${PORT} and registered in Consul`);
    } else {
        console.log(`Server started on port ${PORT} (Consul registration failed)`);
    }
});

// Basic health check endpoint
app.get('/health', (req, res) => res.send('OK'));

async function deregisterAndExit() {
    const serviceId = `event-service-${PORT}`;
    try {
        await consulClient.agent.service.deregister(serviceId);
        console.log('Service was deregistered from Consul');
    } catch (err) {
        console.error('There was an error while deregistering from Consul:', err);
    }
    process.exit(0);
}

process.on('SIGINT', deregisterAndExit);
process.on('SIGTERM', deregisterAndExit);
