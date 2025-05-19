import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import announcementRoutes from './routes/announcement.js';
import eventRoutes from './routes/event.js';
import highlightRoutes from './routes/highlight.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static file service
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Routes
app.use('/fab-api/auth', authRoutes);
app.use('/fab-api/blogs', blogRoutes);
app.use('/fab-api/announcements', announcementRoutes);
app.use('/fab-api/events', eventRoutes);
app.use('/fab-api/highlights', highlightRoutes);
app.use('/fab-api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Fableration fab-api Server');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, './uploads')}`);
}); 