import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import 'dotenv/config';

const id = process.env.UEC_ID;
const password = process.env.UEC_PASSWORD

function getTimestamp() {
    const d = new Date();
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const date = ('0' + d.getDate()).slice(-2);
    const hour = ('0' + d.getHours()).slice(-2);
    const minute = ('0' + d.getMinutes()).slice(-2);
    const second = ('0' + d.getSeconds()).slice(-2);
    const ms = d.getMilliseconds();

    const timestamp = `${year}${month}${date}T${hour}${minute}${second}${ms}`;
    return timestamp;
}

puppeteer.launch().then(async browser => {
    const page = await browser.newPage();

    let ssoError = false;
    do {
        await page.goto('https://campusweb.office.uec.ac.jp/campusweb/ssologin.do');
        console.log('Accessed page.');

        const contents = await page.content();
        const $ = cheerio.load(contents);
        const message = $('body').text().trim();
        if (message.includes('[SSO-Error]')) {
            ssoError = true;
            console.log('SSO-Error. Re-Accessed page.');
        } else {
            ssoError = false;
        }
    } while (ssoError)

    await page.type('input[name="j_username"]', id);
    console.log('Inputed id.');
    await page.type('input[name="j_password"]', password);
    console.log('Inputed password.');
    await page.click('button[name="_eventId_proceed"]');
    console.log('Clicked login button.');

    console.log('Waite for 5sec.');
    await page.waitFor(5000);
    console.log('Waited page rendering.');

    await page.goto('https://campusweb.office.uec.ac.jp/campusweb/campussquare.do?_flowId=SIW0001300-flow');
    console.log('Accessed Seiseki page');

    await page.click('input[type="submit"]');
    console.log('Clicked display button.');

    console.log('Wait for 5sec.');
    await page.waitFor(5000);

    console.log('Waited page rendering.');
    const filename = `seiseki_${getTimestamp()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log('Shoted page.');
    console.log(`Output image file as ${filename}.`);

    await browser.close();
});
