const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(express.json());

const scrap = async (searchQuery) => {
    let browser;

    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        const filtro = "filetype:pdf";
        const consultaCodificada = encodeURIComponent(searchQuery);
        const filtroCodificado = encodeURIComponent(filtro);
        const url = `https://duckduckgo.com/?t=h_&q="${consultaCodificada}"+${filtroCodificado}&ia=web`;
        
        await page.goto(url);
        await page.waitForTimeout(5000); // Esperar 5 segundos (puedes ajustar este valor)

        const pdfLinks = await page.$$eval('a', (as) =>
            as.map((a) => a.href).filter((href) => href.endsWith('.pdf'))
        );

        return pdfLinks;
    } catch (err) {
        console.error(err);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

app.post('/api/search', async (req, res) => {
    const { search } = req.body;

    if (!search) {
        return res.status(400).json({ error: 'El campo de búsqueda es obligatorio.' });
    }

    const pdfLinks = await scrap(search);

    if (pdfLinks.length === 0) {
        return res.json({ message: 'No se encontraron enlaces PDF.' });
    }

    res.json({ pdfLinks });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor Node.js en ejecución en http://0.0.0.0:${port}`);
});
