async function autoScroll(page,boxSelector){

    await page.evaluate( async (boxSelector) => {
        await new Promise((resolve, reject) => {
            let index=0;
            let totalHeight=0;
            const distance=300;
            const timer = setInterval(async () => {

                const element = document.querySelectorAll(`div[aria-label="${boxSelector}"]`)[0];
                element.scrollBy(0, distance); // element.scrollTop += distance;
                console.log("index: " + index + ", scrolling distance: " + element.scrollTop + ", scrollHeight: " + scrollHeight + ", totalHeight: " + totalHeight)
                totalHeight += distance;
                index++;
                const scrollHeight = element.scrollHeight;
                if (totalHeight >= scrollHeight) {
                    console.log("totalHeight:" + totalHeight + " is >= then scrollHeight: " + scrollHeight);
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    },boxSelector);
}
//https://www.youtube.com/watch?v=5xOD4-M2jSw
async function goToNextPage(page){
    // const aElement = await page.evaluate("//a[contains(., 'Next')]", document, null, XPathResult.ANY_TYPE, null );
    // const aTag=aElement.iterateNext();//const url = aTag.href;
    // await aTag.click();

    if (await nextPageExists(page)) {
        await page.waitForSelector('#pnnext', {timeout: 100000});
        await page.click('#pnnext');


        // const elements = await page.$('#pnnext')[0];
        // await page.evaluate(node => node.click(),elements);
        await page.waitForNetworkIdle();
        // await page.waitForNavigation({timeout: 480000});
    }
}

const MY_NETWORK_BUTTON = '#mynetwork-tab-icon';
await page.waitForSelector(MY_NETWORK_BUTTON, {visible: true});
const [response] = await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click(MY_NETWORK_BUTTON), // Clicking the link will indirectly cause a navigation
]);

console.log('CURRENT URL IS: ', response.url());

