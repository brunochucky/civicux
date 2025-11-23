const axios = require('axios');
const cheerio = require('cheerio');

async function testScraping() {
    try {
        console.log('Fetching DOU page...');
        const response = await axios.get('https://www.in.gov.br/servicos/diario-oficial-da-uniao/destaques-do-diario-oficial-da-uniao');
        const $ = cheerio.load(response.data);

        console.log('Parsing highlights...');
        const highlights = [];

        // User provided selector: .lista-de-dou .dou
        $('.lista-de-dou .dou').each((i, el) => {
            const tag = $(el).find('.tag').text().trim();
            const titleEl = $(el).find('.title');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const summary = $(el).find('.summary').text().trim();
            const date = $(el).find('.date').text().trim();

            if (title && link) {
                highlights.push({
                    id: i,
                    tag,
                    title,
                    link: link.startsWith('http') ? link : `https://www.in.gov.br${link}`,
                    summary,
                    date: date || new Date().toLocaleDateString('pt-BR')
                });
            }
        });

        console.log(`Found ${highlights.length} highlights.`);
        if (highlights.length > 0) {
            console.log('First highlight:', highlights[0]);
        } else {
            console.log('No highlights found with selector .lista-de-dou .dou');
            // Debug: check what IS there
            console.log('Checking .lista-de-dou content length:', $('.lista-de-dou').html()?.length);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testScraping();
