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
const fileName="./export/DE_netto2.json"
const BASE_URL="https://www.netto-online.de/filialfinder";
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

    await searchPage.waitForSelector('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection')
    await searchPage.evaluate(() => {//consent
       document.querySelector("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection").click()
    })
    await waitFor(10000);

    const zips=getShortZips(deZipDataFileName)//8308
    // const zips=["74862","01558"]

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

    await page.waitForSelector('#js-ffautocomplete')
    await page.evaluate( () => document.querySelector("#js-ffautocomplete").value = "")
    await page.type('#js-ffautocomplete', str);
    await waitFor(300);
    await page.keyboard.press('Enter');
    await waitFor(5000);

    await page.waitForSelector("#store-finder__list > ul")
    const addressesToAdd=await page.evaluate(async (zipcode)=>{
        const addresses=[]
        // const htmlCollection=document.querySelector("#store-finder__list > ul").getElementsByTagName("li")
        const htmlCollection=await document.getElementsByClassName("store-finder__inner__box__address__wrapper")
        for(let i=0;i<htmlCollection.length;i++){
            const divTags=htmlCollection[i].getElementsByTagName("div")
            if(divTags.length>0) {
                let iText=divTags[0].innerText //'Almenstr. 22\n\n93142 Maxhütte-Birkenhöhe'
                iText=iText.replace("\n",", ")
                iText=iText.replaceAll("\n","")
                addresses.push(iText)
            }
        }
        return addresses
    },str)
    console.log(addressesToAdd)
    console.log("found addresses: "+addressesToAdd.length)

    return addressesToAdd;
}

