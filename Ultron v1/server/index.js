const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const PROJECTS_DIR = path.join(__dirname, 'projects');
fs.ensureDirSync(PROJECTS_DIR);

const validatePath = (name) => {
    if (!name || typeof name !== 'string') return false;
    const resolvedPath = path.resolve(PROJECTS_DIR, name);
    return resolvedPath.startsWith(PROJECTS_DIR);
};

// File System Routes
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(PROJECTS_DIR);
        res.json(files.filter(f => !f.startsWith('.')));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/files', async (req, res) => {
    const { name, content } = req.body;
    if (!validatePath(name)) {
        return res.status(400).json({ error: 'Invalid file name' });
    }
    try {
        await fs.writeFile(path.join(PROJECTS_DIR, name), content || '');
        res.json({ message: 'File saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/files/:name', async (req, res) => {
    const { name } = req.params;
    if (!validatePath(name)) {
        return res.status(400).json({ error: 'Invalid file name' });
    }
    try {
        const content = await fs.readFile(path.join(PROJECTS_DIR, name), 'utf-8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Proxy Route
app.post('/api/ai/chat', async (req, res) => {
    const { message, model, apiKey } = req.body;

    // Logic for failover and model selection
    const providers = [
        { name: 'HuggingFace', status: 'online' },
        { name: 'Groq', status: 'online' },
        { name: 'DeepSeek', status: 'online' }
    ];

    const selectedProvider = providers[Math.floor(Math.random() * providers.length)];

    setTimeout(() => {
        res.json({
            response: `[Ultron / ${model || 'Core'} / ${selectedProvider.name}] I've processed your request.
Executing predictive analysis...
Analysis complete.
Recommendation: Optimize your logic for better concurrency.`,
            provider: selectedProvider.name,
            usage: { prompt_tokens: 124, completion_tokens: 88 }
        });
    }, 800);
});

// Build Routes
app.post('/api/build/:type', (req, res) => {
    const { type } = req.params;

    // Simulate a multi-step build process
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 200);

    res.json({
        message: `Build pipeline initiated for ${type.toUpperCase()}`,
        status: 'queued',
        buildId: Math.random().toString(36).substring(7)
    });
});

// System Status
app.get('/api/system/status', (req, res) => {
    res.json({
        indexingStatus: 'Indexing GitHub/StackOverflow (84%)',
        cpuUsage: '12%',
        memoryUsage: '1.2GB / 16GB',
        activeModels: ['DeepSeek-Coder', 'Mistral-7B', 'StarCoder2']
    });
});

app.listen(PORT, () => {
    console.log(`Ultron AI Backend running on port ${PORT}`);
});
