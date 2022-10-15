const randomUseragent = require('random-useragent');
// const puppeteer = require('puppeteer');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require("fs");
const {saveToJsonWithStructure, getZips, getShortZips} = require("../shared/json_io_files");

//=============================================================================================
//all together 2121 >> DE_pennyR5.json
// const fileName="./export/DE_penny2a.json"//494
// const fileName="./export/DE_penny2b.json"//377
// const fileName="./export/DE_penny2c.json"//485
// const fileName="./export/DE_penny2d.json"//612
// const fileName="./export/DE_penny2e.json"//721
const fileName="./export/DE_penny2f.json"//487

const BASE_URL="https://www.penny.de/marktsuche";
const WEB_URL=BASE_URL;
console.log("website Url: "+WEB_URL);
const deZipDataFileName="../resources/german-zip-short.json"
//main==========================================================================================
main()
    .then( ()    => console.log("Done"))
    .catch((err) => console.error(err))

async function main(){

    const browser = await puppeteer
        .launch({
            // args: ["--force-device-scale-factor=1"],
            headless: true,
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

    const searchPage = await browser.newPage();
    await searchPage.setViewport({
        width:1300,
        height:900
    });

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".penny.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    await searchPage.waitForSelector('#uc-btn-accept-banner')
    await searchPage.evaluate(() => {//consent
        document.querySelector("#uc-btn-accept-banner").click()
    })
    await waitFor(3000);

    const zips=getShortZips(deZipDataFileName)
    console.log(zips.length)//8308
    // const zips=["74862","55232","01558"]

    let places = [];
    let mySet = new Set();

    for(let i=7000; i<8308;i++ ){//zips.length  8308
        const zip=zips[i]
        const searchResult=await getSearch(searchPage, zip)
        if(searchResult.length>0){
            searchResult.forEach(mySet.add, mySet);
            //places.push(...searchResult)
        }
        console.log(i+", "+zip+"\t found: "+searchResult.length);
    }

    places.push(...mySet)
    console.log("all found addresses length: "+places.length);
    // console.log(places);
    saveToJsonWithStructure(places,fileName)

    await browser.close();
}
//funcs=============================================================================================
function waitFor(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function getSearch(page, str){//01968 Senftenberg, Deutschland

    const inputSelector="#search"
    await page.waitForSelector(inputSelector)

    await page.evaluate(async (inputSelector,str)=> {
        const inputTag=await document.querySelector(inputSelector)
        inputTag.value=str
        await document.querySelector("body > div.contentPage.t-bg--white > div.market-finder.page-sector.page-sector--spacing-below-xl > div > div.market-finder__search > form > div.compound-input > button")
            .click()
    },inputSelector,str)
    await page.waitForNetworkIdle()

    await page.waitForSelector("#market-finder-list")
    const addressesToAdd=await page.evaluate(async ()=>{
        const addresses=[]
        const htmlCollection=await document.querySelector("#market-finder-list").getElementsByTagName("li")
        // document.querySelector("#market-finder-list").getElementsByTagName("li")[0].getElementsByClassName("market-tile__address")[0].innerHTML
        for(let i=0;i<htmlCollection.length;i++){
            const preTags=htmlCollection[i].getElementsByClassName("market-tile__address")

            if(preTags.length>0) {
                let iText=preTags[0].innerHTML //'Bahnhofstr. 44\n55232 Alzey'
                iText=iText.replace("\n",", ")
                addresses.push(iText)
            }
        }
        return addresses
    })
    console.log(addressesToAdd)

    return addressesToAdd;
}

