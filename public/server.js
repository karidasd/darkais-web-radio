import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', station: 'DarkAIs Cyber Rave Radio', onAir: true });
});

app.listen(PORT, () => {
    console.log(`⚡ DarkAIs Web Radio running at http://localhost:${PORT}`);
});
