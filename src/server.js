import express from 'express';
import eventRoutes from "./routes/eventRoutes.js";


const app = express();

const PORT = process.env.PORT || 8383

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/', eventRoutes)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
