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
const fileName="./export/DE_aldi.json"
const BASE_URL="https://www.aldi-sued.de/de/filialen.html";
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

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".aldi-sued.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
    // const userAgent = randomUseragent.getRandom();
    // await searchPage.setUserAgent(userAgent);
    // await searchPage.screenshot({path: 'example.png'});

    const zips=getShortZips(deZipDataFileName)//8308

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
    console.log("found addresses length: "+places.length);
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
    await page.evaluate(async()=>{//consent
        await document
            .querySelector("#c-modal > div > div > form > div.modal-footer.cookie-expiration-months.pt-2.d-block > div > div:nth-child(1) > button")
            .click()
    })
    await waitFor(300);

    await page.evaluate(async(searchStr)=>{//input and searchButton
        document.querySelector("#input__store_search").value=searchStr
        await document.querySelector("#storeSearchForm > div > div.col-12.d-flex > button")
            .click()
    },str)

    const ok=await page.evaluate(async()=>{//consent2
        const consent2=await document
            .querySelector("body > div.tooltip-style.google-maps-tooltip.ts-belowElemLeft > div > button")
        if(consent2) {
            consent2.click()
            return true;
        }
        return false;
    })
    console.log("2nd consent ok: "+ok)

    await page.evaluate(async()=>{//searchButton Again
        await document.querySelector("#storeSearchForm > div > div.col-12.d-flex > button")
            .click()
    })
    await waitFor(1000);

    const addressesToAdd=await page.evaluate(async (zipcode)=>{
        const addresses=[]
        const htmlCollection=document.querySelector("#dealer-list").getElementsByTagName("li")
        // console.log(htmlCollection)
        for(let i=0;i<htmlCollection.length;i++){
            let zip=htmlCollection[i].getElementsByClassName("dealer-postal-code")[0].outerText.trim()
            if(zip.length<5)zip="0"+zip
            if(zip===zipcode) {
                const street = htmlCollection[i].getElementsByClassName("dealer-address")[0].outerText.trim()
                const city = htmlCollection[i].getElementsByClassName("dealer-city")[0].outerText.trim()
                const full = street + ", " + zip + " " + city
                addresses.push(full)
            }
        }
        return addresses
    },str)
    console.log(addressesToAdd)
    console.log("found addresses: "+addressesToAdd.length)

    return addressesToAdd;
}

