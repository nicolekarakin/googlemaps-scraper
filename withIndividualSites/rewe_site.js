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
const fileName="./export/DE_rewe2.json"
const BASE_URL="https://www.rewe.de/marktsuche/";
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

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".netto-online.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    await searchPage.waitForSelector('#uc-btn-accept-banner')
    await searchPage.evaluate(() => {//consent
        document.querySelector("#uc-btn-accept-banner").click()
    })
    await waitFor(3000);

    const zips=getShortZips(deZipDataFileName)//8308
    // const zips=["74862","52066","01558"]

    let places = [];
    let mySet = new Set();

    for(let i=0; i<zips.length;i++ ){//zips.length
        const zip=zips[i]
        const searchResult=await getSearch(searchPage, zip)
        if(searchResult.length>0){
            searchResult.forEach(mySet.add, mySet);
            //places.push(...searchResult)
        }
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
    console.log("looking for zip: "+str)
    // await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const inputSelector="body > market-search > div.market-stage.d-block.position-relative.py-3.py-sm-5 > div > div > div > div > div > form-input-search > div > input"
    await page.waitForSelector(inputSelector)

    const inputTag=await page.evaluate(async (inputSelector)=> {
        const inputTag=await document.querySelector(inputSelector)
        inputTag.value=""
        return inputTag
    },inputSelector)
    await waitFor(300);
    await page.type(inputSelector, str);
    await waitFor(300);

    await page.keyboard.press('Enter');
    await waitFor(1000);

    const resultListSelector="body > market-search > div:nth-child(2) > tab-container > div.mx-auto.col-12.col-sm-6.col-md-5 > market-tile-list"
    await page.waitForSelector(resultListSelector)
    const addressesToAdd=await page.evaluate(async ()=>{
        const addresses=[]
        const htmlCollection=await document.getElementsByTagName("market-tile")
        for(let i=0;i<htmlCollection.length;i++){
            const divTags=htmlCollection[i].getElementsByClassName("tile-address")

            if(divTags.length>0) {
                const iText=divTags[0].innerText //'Engadiner Str. 2 , 81475 München / Forstenried'
                addresses.push(iText)
            }
        }
        return addresses
    })
    console.log(addressesToAdd)
    console.log("found addresses: "+addressesToAdd.length)

    return addressesToAdd;
}

