const randomUseragent = require('random-useragent');
// const puppeteer = require('puppeteer');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require("fs");
const {saveToJsonWithStructure} = require("../shared/json_io_files");

//=============================================================================================
const fileName="./export/DE_lidl.json"
const BASE_URL="https://www.lidl.de";
const WEB_URL=BASE_URL+"/f/?mktc=brandpaidsearch_retail";
console.log("website Url: "+WEB_URL);

//main=============================================================================================
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

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".lidl.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
    // const userAgent = randomUseragent.getRandom();
    // await searchPage.setUserAgent(userAgent);
    // await searchPage.screenshot({path: 'example.png'});

    const cities=await getCities(searchPage)
    console.log("cities length: "+cities.length); //239

    let places = [];

    for(let i=0; i<cities.length;i++ ){//
        const url=BASE_URL+cities[i]
        await searchPage.goto(url,{waitUntil: "domcontentloaded", timeout: 55000});
        const addrs=await goToCity(searchPage)
        console.log(url+"\t found: "+addrs.length);
        places.push(...addrs)
    }
    //from main website should be 3.200 in DE <<<< but from filialeSearch website we get 1117
    console.log("found addresses length: "+places.length);

    saveToJsonWithStructure(places,fileName)

    await browser.close();
}
//funcs=============================================================================================
async function getCities(page){
    return await page.evaluate(()=>{
        const cities=[]
        const el0 = document.querySelector("#\\31 0019257 > section > div");
        if(el0){
            const cityCol=el0.getElementsByClassName("ret-o-store-detail-city")
            for (let name of cityCol) {
                const cityUrl=name.getElementsByTagName("a")[0].getAttribute("href")
                cities.push(cityUrl)
            }
        }
        return cities
    })
}

async function goToCity(page){
    return await page.evaluate(()=>{
        const addresses=[]
        const el0 = document.getElementsByClassName("ret-o-store-detail__address")
        if(el0){
            for(let txt of el0){
                const parts=txt.innerText.split("Zur")[0].split("\n")
                addresses.push(parts[0]+", "+parts[1])
            }
        }
        return addresses
    })
}


