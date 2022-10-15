const xlsx = require("xlsx");
const puppeteer = require('puppeteer');


const concentOk=async (browser) => {
    const googleBlocker="https://www.google.com/search?q=nu";
    const pageBlocker = await browser.newPage();
    await pageBlocker.goto(googleBlocker);
    await pageBlocker.evaluate(_ => {
        function xcc_contains(selector, text) {
            var elements = document.querySelectorAll(selector);
            return Array.prototype.filter.call(elements, function (element) {
                return RegExp(text, "i").test(element.textContent.trim());
            });
        }

        var _xcc;
        // _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Accept all|Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK)$');
        _xcc = xcc_contains('button, button div', '^(Accept all|Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK)$');
        if (_xcc != null && _xcc.length != 0) {
            _xcc[0].click();
            console.log("_xcc: " + _xcc);
        }
    });
    // const title = await pageBlocker.title();
    // console.info(`The title is: ${title}`);
}

//=============================================================================================
const SHOP_SEARCH="Lidl+in+Deutschland"; //3200
const SHOP_SCROLL_STR = "Results for "+SHOP_SEARCH.replaceAll("+"," ");//Results for Lidl in Deutschland
const SHOP_SEARCH_URL=`https://www.google.com/maps/search/${SHOP_SEARCH}/@48.1393394,11.5241425,1z`;
// const lidlSearch="https://www.google.com/maps/search/Lidl+supermarket+in+Deutschland+/@60.4914024,4.7670031,3z";
console.log("SHOP_SEARCH: "+SHOP_SEARCH, "\nSHOP_SCROLL_STR: "+SHOP_SCROLL_STR,"\nSHOP_SEARCH_URL: "+SHOP_SEARCH_URL);
//main=============================================================================================
main()
    .then( ()    => console.log("Done"))
    .catch((err) => console.error(err))


async function main(){
    const browser = await puppeteer.launch({headless: false});
    // await concentOk(browser)

    const searchPage = await browser.newPage();
    await searchPage.setViewport({
        width:1300,
        height:900
    });
    //CONSENT=PENDING+193;//cookies = {'CONSENT' : 'YES+'}
    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".google.com"}];
    await searchPage.setCookie(...cookies);
    await searchPage.goto(SHOP_SEARCH_URL);
    // await searchPage.screenshot({path: 'example.png'});
    let places = [];

    if(await nextPageExists(searchPage)){
        do{
            await autoScroll(searchPage,SHOP_SCROLL_STR)
            places=places.concat(await parseLidlPlaces(searchPage));
            await goToNextPage(searchPage)
        } while(await nextPageExists(searchPage))
    }else {
        await autoScroll(searchPage,SHOP_SCROLL_STR);
        places=places.concat(await parseLidlPlaces(searchPage));
        console.log("length: "+places.length);
    }

    console.log(places);
    console.log(places.length);
    await browser.close();
}
//funcs=============================================================================================
async function parseLidlPlaces(page) {
    let lidlPlaces = [];
    const elements = await page.$$('a.hfpxzc');
    if(elements && elements.length){
        for(const el of elements){
            const link=await el.evaluate(a=>a.href);
            lidlPlaces.push(link);
        }
    }
    // console.log("parseLidlPlaces, found shop links - "+elements.length);
    return lidlPlaces;
}

/*
<a href="/search?q=edeka+in+deutschland&amp;rlz=1C5CHFA_enDE1012DE1012&amp;cs=0&amp;tbs=lrf:!1m4!1u3!2m2!3m1!1e1!2m1!1e3!3sIAE,lf:1,lf_ui:4&amp;tbm=lcl&amp;sxsrf=ALiCzsZJrgPdBWYcaEAlJ4RBPeSAED-SvA:1659778442836&amp;ei=ijXuYp6OGM29xc8PgdW54A8&amp;start=40&amp;sa=N&amp;ved=2ahUKEwie-9vD9LH5AhXNXvEDHYFqDvw4FBDw0wN6BQgCEPMB"
   id="pnnext" style="text-align:left">
    <span className="SJajHc NVbCr" style="background:url(/images/nav_logo321_hr.webp) no-repeat;background-position:-96px 0;background-size:167px;width:71px">
    </span>
    <span style="display:block;margin-left:53px">Next</span>
</a>
*/

async function goToNextPage(page){//https://www.youtube.com/watch?v=5xOD4-M2jSw
    // const aElement = await page.evaluate("//a[contains(., 'Next')]", document, null, XPathResult.ANY_TYPE, null );
    // const aTag=aElement.iterateNext();//const url = aTag.href;
    // await aTag.click();
    if (await nextPageExists(page)) {
        page.$('#pnnext')[0].click();
        await page.waitForNetworkIdle();
    }
}
async function nextPageExists(page){
    // return (page.querySelectorAll('#pnnext').length > 0);
    return (page.$('#pnnext').length > 0);
}

async function scrollNotFinished(element) {
    const top = await element.evaluate(node => node.scrollTop);
    const height = await element.evaluate(node => node.scrollHeight);
    const boxHeight =await element.evaluate(node => node.clientHeight);

    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         resolve(x);
    //     }, 200);
    // });

    if(height>=0 && top>=0 && boxHeight>=0){
        const result = Math.abs(height - boxHeight - top);
        console.log("top: " + top+", height: "+height+", boxHeight: "+boxHeight+", result: "+result);
        return (result >= 1);
    }else {
        throw Error("scrollNotFinished, height and top not known");
    }
}

function autoScroll(page,selector){
    return new Promise(async function (resolve, reject) {
        // const lidleScrollSelector=`div[aria-label="Results for Lidl in Deutschland"]`;
        await page.waitForSelector(`div[aria-label="${selector}"]`);
        const element = (await page.$$(`div[aria-label="${selector}"]`))[0];
        console.log("element: " + element);
        let multipleFalse=0;
        const timer = setInterval(async () => {
            multipleFalse=await recurse(element, 0, multipleFalse);
            console.log("autoScroll, multipleFalse: " + multipleFalse);
            if(multipleFalse>200){
                clearInterval(timer);
                resolve();
            }
        },900);
    });
}

const recurse = async (element,index,multipleFalse) => {
    if(!(await scrollNotFinished(element))){
        multipleFalse=multipleFalse+1;
    }else{
        multipleFalse=0;
    }
    // Recurse exit clause
    if (multipleFalse<=200) {
        // Move the scroll of the parent-parent-parent div to the bottom
        await element.evaluate(node => node.scrollBy(0, 300));
        const top = await element.evaluate(node => node.scrollTop);
        console.log("index: " + index+", multipleFalse: "+multipleFalse+", top: " + top);
        index++;
    }
    return multipleFalse;
}


// document.querySelectorAll("Nv2PK tH5CWc THOPZb")
// a.hfpxzc >> href
// https://www.google.com/maps/place/Lidl/data=!4m7!3m6!1s0x479e7e30d35717b9:0xbda1e40f50a6b294!8m2!3d48.2123!4d11.28318!16s%2Fg%2F1tffhs1p!19sChIJuRdX0zB-nkcRlLKmUA_kob0?authuser=0&hl=en&rclk=1"
//document.querySelectorAll('div[aria-label="Results for Lidl supermarket in Deutschland "]')


//----------------document.querySelectorAll("a.rllt__link")