const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('URL parameter missing');

        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Inject auto-scroll script
        let modifiedHtml = response.data;
        modifiedHtml = modifiedHtml.replace(
            '</body>',
            `<script>
                let scrollPos = 0;
                setInterval(() => {
                    scrollPos += 2;
                    window.scrollTo(0, scrollPos);
                    if (scrollPos > 1000) scrollPos = 0;
                }, 50);
            </script></body>`
        );

        res.header('Access-Control-Allow-Origin', '*');
        res.send(modifiedHtml);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching URL');
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
