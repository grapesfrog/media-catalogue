const express = require('express');
const cors = require('cors');
const mediaRoutes = require('./src/routes/media');
const llmRoutes = require('./src/routes/llm');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/media', mediaRoutes);
app.use('/api/llm', llmRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});