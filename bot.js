const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000; // Puedes cambiar el puerto según tus necesidades

app.use(express.json());

const scrap = async (searchQuery) => {
    let browser;

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        const search = encodeURIComponent(searchQuery);
        await page.goto(`https://www.google.com.pe/search?q="${search}" filetype%3Apdf`);

        /*await page.evaluate(() => {
            window.scrollBy(0, 1500);
        });*/

        await page.waitForTimeout(1000);

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