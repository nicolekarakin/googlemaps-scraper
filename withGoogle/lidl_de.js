const xlsx = require("xlsx");
const randomUseragent = require('random-useragent');
// const puppeteer = require('puppeteer');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require("fs");

//=============================================================================================
const SHOP_CATEGORY_0="In-store shopping";
const SHOP_CATEGORY_1="Einkaufen im Geschäft";
const SHOP_NAME="Lidl";
const SHOP_SEARCH=`${SHOP_NAME}%20in%20Deutschland`; //3200
const SHOP_SCROLL_CLASS="#center_col"; //".rlfl__tls.rl_tls";
const SHOP_SEARCH_URL_BASE=`https://www.google.com/search?q=${SHOP_NAME}+in+Deutschland`; //tiS4rf Q2MMlc
const SHOP_SEARCH_URL=`https://www.google.com/search?tbs=lf:1,lf_ui:4&tbm=lcl&q=Lidl+in+Deutschland&rflfq=1&num=10&sa=X&ved=2ahUKEwixiqPXhbX5AhVGRPEDHeP6AU0QjGp6BAhLEAI`;

const SHOP_SEARCH_URL0=`https://www.google.com/search?tbs=lrf:!1m4!1u3!2m2!3m1!1e1!2m1!1e3!3sIAE,lf:1,lf_ui:4&tbm=lcl&q=${SHOP_SEARCH}&rflfq=1&num=10&sa=X&ved=2ahUKEwjS7pDqg7X5AhVnQfEDHeyOCu4QjGp6BAhNEAI&biw=1200&bih=645&dpr=2&rlst=f#rlfi=hd:;si:;mv:[[48.189141899999996,11.6150589],[48.0895369,11.482221599999999]];tbs:lrf:!1m4!1u3!2m2!3m1!1e1!2m1!1e3!3sIAE,lf:1,lf_ui:4`;
console.log("SHOP_SEARCH: "+SHOP_SEARCH, "\nSHOP_SCROLL_CLASS: "+SHOP_SCROLL_CLASS,"\nSHOP_SEARCH_URL_BASE: "+SHOP_SEARCH_URL_BASE);
//main=============================================================================================
main()
    .then( ()    => console.log("Done"))
    .catch((err) => console.error(err))


async function main(){
    // const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer
        .launch({
            // args: ["--force-device-scale-factor=1"],
            headless: false,
            ignoreHTTPSErrors: true,
            args: [
                '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
                '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
                '--force-device-scale-factor=1.'
            ],
            slowMo:10,
        })
        .catch(error => {
            console.error(error);
            process.exit();
        });
    // await concentOk(browser)

    const searchPage = await browser.newPage();
    await searchPage.setViewport({
        width:1300,
        height:900
    });
    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".google.com"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(SHOP_SEARCH_URL_BASE,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
    // const userAgent = randomUseragent.getRandom();
    // await searchPage.setUserAgent(userAgent);

    await moveToMaps(searchPage);

    // await searchPage.screenshot({path: 'example.png'});
    let places = [];
    let pageNum=0;
    if(await nextPageExists(searchPage)){
        do{
            await autoScroll(searchPage);
            places=places.concat(await parseLidlPlaces(searchPage));
            await goToNextPage(searchPage);
            pageNum++;
            console.log("moved to pade: "+pageNum);
        } while(await nextPageExists(searchPage))
    }else {
        await autoScroll(searchPage);
        places=places.concat(await parseLidlPlaces(searchPage));
    }

    // places=places.concat(await parseLidlPlaces(searchPage));

    console.log(places);
    console.log(places.length);
    saveArrayToFile(places);
    // await browser.close();
}

//document.querySelectorAll('[title="Zoom out"]')[0]
//funcs=============================================================================================
function saveArrayToFile(places){
    let placesLinks;
    if(places.length>0) {
        if(!!places[0].address){
            placesLinks=places.map(l => [l.title+', '+l.address]);
        }else {
            placesLinks = places.map(l => [l]);
        }

        const book = xlsx.utils.book_new();
        const sheet = xlsx.utils.aoa_to_sheet(placesLinks);
        xlsx.utils.book_append_sheet(book, sheet);
        xlsx.writeFile(book, "export/lidl_de.xlsx");

        const output_file_name = "export/lidl_de.csv";
        const stream = xlsx.stream.to_csv(sheet);
        stream.pipe(fs.createWriteStream(output_file_name));
    }
}
async function moveToMaps(page){
    await page.waitForSelector('a.tiS4rf.Q2MMlc', {visible: true});
    const aTag = await page.$('a.tiS4rf.Q2MMlc');
    const aUrl = await aTag.evaluate(a=>a.href);
    await page.goto(aUrl,{waitUntil: "domcontentloaded", timeout: 3000});
    // await page.solveRecaptchas();

    // page.evaluate(()=>{
    //     let element = document.querySelectorAll('a.tiS4rf.Q2MMlc')[0];
    //     element.click();
    // });
}

const waitUntil = (condition) => {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (!condition()) {
                return
            }

            clearInterval(interval)
            resolve()
        }, 100)
    })
}
// await waitUntil(() => /* your condition */)

async function parseLidlPlaceNotWorking(page,el) {
    // await page.waitForSelector(el, {visible: true});

    // const [response] = await Promise.all([
    //     page.waitForNavigation(), // The promise resolves after navigation has finished
    //     page.click(el) // Clicking the link will indirectly cause a navigation
    //     page.evaluate(async (el) => el.click(),el)
    // ]);

    page.evaluate(async (el) => el.click(),el);
    await page.waitForNavigation({timeout: 480000});
    await page.waitForSelector('.zloOqf.PZPZlf', {visible: true, timeout: 10000});
    const addr = await page.$$('.zloOqf.PZPZlf');
    const addrStr = (addr)?await addr[0].evaluate(a=>a.innerText):"";

    if (addrStr && (addrStr.includes("Address: ")||addrStr.includes("Adresse: "))) {
        if(addrStr.includes("Address: ")) {
            return addrStr.split('Address: ')[1];
        }else{
            return addrStr.split('Adresse: ')[1];
        }
    }
}

async function parseLidlPlace(page,el){

        await page.evaluate(async (el) => el.click(),el);
        await page.waitForNavigation({timeout: 480000});
        await page.waitForNetworkIdle();

        await page.waitForSelector('.zloOqf.PZPZlf', {timeout: 40000});
        const addr = await page.$$('.zloOqf.PZPZlf');
        const addrStr = (addr)?await addr[0].evaluate(a=>a.innerText):"";
        const title = await page.$$( 'h2[data-attrid="title"]');
        const titleStr = (title)?await title[0].evaluate(a=>a.innerText):"";
        let addressFinal="";
        if (addrStr && (addrStr.includes("Address: ")||addrStr.includes("Adresse: "))) {
            if(addrStr.includes("Address: ")){
                addressFinal=addrStr.split('Address: ')[1];
            }else {
                addressFinal=addrStr.split('Adresse: ')[1];
            }

            // console.log(titleStr,addressFinal);
            // return addrStr.split('Address: ')[1];
            return {title: titleStr, address: addressFinal};
        }
}

async function parseLidlPlaces(page) {
    let lidlLinks = [];
    await page.waitForSelector('a.vwVdIc.wzN8Ac.rllt__link', {timeout: 100000});
    const elements = await page.$$('a.vwVdIc.wzN8Ac.rllt__link');
    if(elements && elements.length){
        for(const el of elements){
            //document.querySelectorAll('a.vwVdIc.wzN8Ac.rllt__link')[0].querySelector(".rllt__details").querySelector('span').innerText
            await page.waitForSelector('.rllt__details span.OSrXXb', {timeout: 100000});
            const detailsContainer=await el.$('.rllt__details span.OSrXXb');
            const title=await detailsContainer.evaluate(s=>s.innerText);
            const detailsContainerCategory=await el.$('.rllt__details .dXnVAb .BI0Dve');
            const category=(detailsContainerCategory)?await detailsContainerCategory.evaluate(s=>s.innerText):null;
            if((title && title.includes(SHOP_NAME)) &&
               ( (category && category.includes(SHOP_CATEGORY_0)) ||
                   (category && category.includes(SHOP_CATEGORY_1))
               )
            ){
                const obj=await parseLidlPlace(page,el);
                lidlLinks.push(obj); //console.log("obj: "+obj);
            }
        }
    }
    if(elements.length>lidlLinks.length){
        console.log("parseLidlPlaces, elements found: "+elements.length+", elements saved: "+lidlLinks.length);
    }
    return lidlLinks;
}


//https://www.youtube.com/watch?v=5xOD4-M2jSw
async function goToNextPage(page){
    // const aElement = await page.evaluate("//a[contains(., 'Next')]", document, null, XPathResult.ANY_TYPE, null );
    // const aTag=aElement.iterateNext();//const url = aTag.href;
    // await aTag.click();
    try {
        await page.waitForSelector('#pnnext', {timeout: 300000});
        await Promise.all([
            page.waitForNavigation(),
            page.click('#pnnext')
        ]);
    } catch (e) {
        console.log('#pnnext probably not exists');
    }
    console.log("goToNextPage -- end");
}

async function nextPageExists(page){
    // return (page.querySelectorAll('#pnnext').length > 0);
    let ok=false;
    try {
        await page.waitForSelector('#pnnext', {timeout: 300000});
        const aTag = await page.$('#pnnext');
        const aUrl = (!!aTag)?await aTag.evaluate(a=>a.href):"";
        ok=(aUrl.length > 0);
        console.log("nextPageExists, url: "+aUrl);
    } catch (e) {
        console.log('nextPageExists, #pnnext probably not exists');
    }
    return ok;
}

async function scrollNotFinished(page) {
    await page.waitForSelector(`${SHOP_SCROLL_CLASS}`, {timeout: 100000});
    const element = (await page.$$(`${SHOP_SCROLL_CLASS}`))[0];
    const top = await element.evaluate(node => node.scrollTop);
    const height = await element.evaluate(node => node.scrollHeight);
    const boxHeight =await element.evaluate(node => node.clientHeight);

    if(height>=0 && top>=0 && boxHeight>=0){
        const result = Math.abs(height - boxHeight - top);
        // console.log("top: " + top+", height: "+height+", boxHeight: "+boxHeight+", result: "+result);
        return (result >= 1);
    }else {
        throw Error("scrollNotFinished, height and top not known");
    }
}

function autoScroll(page){
    return new Promise(async function (resolve, reject) {
        let multipleFalse=0;
        let index=0;
        const timer = setInterval(async () => {
            [index,multipleFalse]=await scrollNow(page, index, multipleFalse);
            if(multipleFalse===6)console.log("autoScroll finished, multipleFalse: " + multipleFalse+", index: "+index);
            if(multipleFalse>5){
                clearInterval(timer);
                resolve();
            }
        },300);
    });
}

const scrollNow = async (page,index,multipleFalse) => {
    await page.waitForSelector(`${SHOP_SCROLL_CLASS}`, {timeout: 100000});
    const element = (await page.$(`${SHOP_SCROLL_CLASS}`));

    if(!(await scrollNotFinished(page))){
        multipleFalse=multipleFalse+1;
    }else{
        multipleFalse=0;
    }
    // Recurse exit clause
    if (multipleFalse<=5) {
        // Move the scroll of the parent-parent-parent div to the bottom
        await page.evaluate(node => node.scrollBy(0, 200),element);
        const top = await page.evaluate(node => node.scrollTop,element);
        // console.log("index: " + index+", multipleFalse: "+multipleFalse+", top: " + top);
        index++;
    }
    return [index,multipleFalse];
}


// document.querySelectorAll("Nv2PK tH5CWc THOPZb")
// a.hfpxzc >> href
// https://www.google.com/maps/place/Lidl/data=!4m7!3m6!1s0x479e7e30d35717b9:0xbda1e40f50a6b294!8m2!3d48.2123!4d11.28318!16s%2Fg%2F1tffhs1p!19sChIJuRdX0zB-nkcRlLKmUA_kob0?authuser=0&hl=en&rclk=1"
//document.querySelectorAll('div[aria-label="Results for Lidl supermarket in Deutschland "]')


//----------------document.querySelectorAll("a.rllt__link")

//DEBUG=puppeteer-extra,puppeteer-extra-plugin:* node lidl_de.js