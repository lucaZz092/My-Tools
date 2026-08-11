import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { EventEmitter } from 'events';
import axios from 'axios';

const PORT = 3000;
const app = express();
const eventEmitter = new EventEmitter();

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------------

// 1. Webhook endpoint
// Simulates receiving webhooks from external services (e.g., GitHub, Stripe)
app.post('/api/webhooks/:source', (req, res) => {
  const { source } = req.params;
  const payload = req.body;
  
  const notification = {
    id: Date.now().toString(),
    source,
    title: payload.title || `Novo evento de ${source}`,
    message: payload.message || 'Um novo evento foi recebido via webhook.',
    payload,
    timestamp: new Date().toISOString(),
  };

  eventEmitter.emit('notification', notification);
  res.status(200).json({ status: 'success', message: 'Webhook received' });
});

// 2. Notifications SSE stream
app.get('/api/notifications', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onNotification = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventEmitter.on('notification', onNotification);

  // Send an initial connected message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado às notificações em tempo real.' })}\n\n`);

  req.on('close', () => {
    eventEmitter.off('notification', onNotification);
  });
});

// 3. GitHub proxy to avoid CORS and securely use token if needed
app.get('/api/github/repos/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        Authorization: token || '',
        Accept: 'application/vnd.github.v3+json'
      },
      params: req.query
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Error' });
  }
});

app.get('/api/github/repos/:owner/:repo/commits', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        Authorization: token || '',
        Accept: 'application/vnd.github.v3+json'
      },
      params: req.query
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Error' });
  }
});


// ------------------------------------------------------------------
// VITE & STATIC FILES (Must be after API routes)
// ------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
