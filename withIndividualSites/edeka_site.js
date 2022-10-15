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
const fileName="./export/DE_edeka2.json"
const BASE_URL="https://www.edeka.de/"
const WEB_URL="https://www.edeka.de/marktsuche.jsp";
console.log("website Url: "+WEB_URL);
const edeckaCities="../resources/edeka-city-urls.json"
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

    const navigationPromise = searchPage.waitForNavigation({waitUntil: "domcontentloaded"});

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".edeka.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    // await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 10000});
    await searchPage.goto(WEB_URL);
    await navigationPromise;

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    await searchPage.waitForSelector('#popin_tc_privacy_button_2')
    await searchPage.evaluate(() => {//consent
        document.querySelector("#popin_tc_privacy_button_2").click()
    })
    await waitFor(3000);

// ============================================
// create city-file
// ============================================
//     const cities1=await getCities(searchPage)
//     console.log("cities1 length: "+cities1.length); //40
//
//     const cities = [];
//     let cities2=[]
//     for(let i=0; i<cities1.length;i++ ){//cities.length
//         const url=BASE_URL+cities1[i]
//         await searchPage.goto(url,{waitUntil: "domcontentloaded", timeout: 55000});
//         const temp=await getCities(searchPage)
//         console.log(url+"\t found: "+temp.length);
//         cities2.push(...temp)
//         cities.push(url)
//     }
//     console.log("cities2 length: "+cities2.length);//1101
//
//     let cities3=[]
//     for(let i=0; i<cities2.length;i++ ){//cities.length
//         const url=BASE_URL+"marktsuche/"+cities2[i]
//         await searchPage.goto(url,{waitUntil: "domcontentloaded", timeout: 55000});
//         const temp=await getCities(searchPage)
//         console.log(url+"\t found: "+temp.length);
//         cities3.push(...temp)
//         cities.push(url)
//     }
//     console.log("cities3 length: "+cities3.length);//51713
//
//     cities3.forEach(a=>cities.push(BASE_URL+"marktsuche/"+a))
//
//     const mySet = new Set(cities3)
//     const citiesfinal=[]
//     citiesfinal.push(...mySet)
//     console.log("citiesfinal length: "+citiesfinal.length);//168
//
//     saveToJson(citiesfinal, edeckaCities)
// ============================================

    const urlCitiesFromFile = JSON.parse(fs.readFileSync(edeckaCities, "utf8"));
    const citiesfinal=urlCitiesFromFile.urls
    console.log("urlCitiesFromFile:", citiesfinal.length);//168
    let places = [];

    for(let i=0; i<citiesfinal.length;i++ ){//citiesfinal.length
        const url=BASE_URL+"marktsuche/"+citiesfinal[i]
        await searchPage.goto(url,{waitUntil: 'networkidle0', timeout: 55000});
        const addrs=await goToCity(searchPage)
        console.log(i+",\t "+url+"\t found: "+addrs.length);
        places.push(...addrs)
    }

    console.log("found addresses length: "+places.length);

    saveToJsonWithStructure(places,fileName)

    await browser.close();
}
//funcs=============================================================================================
function saveToJson(dataArray, fileName){
    const fs = require("fs");
    const dataObj = {urls: [...dataArray]}
    fs.writeFileSync(fileName, JSON.stringify(dataObj, null, 4), "utf8");
}

function waitFor(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}
async function getCities(page){
    const selStr="body > div.t-store-search-page > section > div.o-store-search-outro.has-2-items > div > div > div:nth-child(2) > div"
    // await page.waitForSelector(selStr)
    await waitFor(300);
    return await page.evaluate(async (selStr)=>{
        const cities=[]
        const el0 = await document.querySelector(selStr);
        if(el0){
            console.log(el0)
            const cityCol=el0.getElementsByTagName("a")
            for (let name of cityCol) {
                const cityUrl=name.getAttribute("href")
                cities.push(cityUrl)
            }
        }
        return cities
    },selStr)
}

async function goToCity(page){
    const selStr="body > div.t-store-search-page > section > div.o-store-search-controller__scroller.is-active > div.o-store-search-controller__panel.is-results > div.o-store-search-controller__panel-body.is-visible.is-active > div > div > div > div > div > div.o-store-search-results-listing.is-active"
    // await page.waitForSelector(selStr)
    await page.content()
    return await page.evaluate(async ()=>{
        const addresses=[]
        const el0 = await document.getElementsByClassName("o-store-search-results-listing__copy-item")
        if(el0){
            for(let txt of el0){//'Schillerstraße 20-40, 52064 Aachen'  &nbsp;
                let adr=txt.innerText.trim()
                if(adr.includes("&nbsp;"))adr=adr.replaceAll("&nbsp;"," ")
                if(adr.includes(" "))adr=adr.replaceAll(" "," ")
                addresses.push(adr)
            }
        }
        return addresses
    })
}


