const randomUseragent = require('random-useragent');
// const puppeteer = require('puppeteer');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require("fs");
const {saveToJsonWithStructure, getShortZips} = require("../shared/json_io_files");
//
//=============================================================================================
    // const fileName="./export/DE_lidl1.json"; //3301 vs 2801, from lidl_site.js we get 1117 >> after merge DE_lidl.json 3504
// const WEB_URL="https://filialfinder.cylex.de/brand/LIDL/";
//=============================================================================================
    // const fileName="./export/DE_aldi_south.json" //was 1935
// const WEB_URL="https://filialfinder.cylex.de/brand/ALDI%20SE%20%26%20Co.%20KG/";
//=============================================================================================aldi merged >> 3934
    // const fileName="./export/DE_aldi_north.json" //was 2014
// const WEB_URL="https://filialfinder.cylex.de/brand/ALDI%20NORD/";
//=============================================================================================
    // const fileName="./export/DE_netto1.json"; //4280 vs 2620, from neto_site.js we get 938 >> after merge DE_netto.json 3193
// const WEB_URL="https://filialfinder.cylex.de/brand/Netto%20Discount/";
//=============================================================================================
    // const fileName="./export/DE_rewe1.json"; //3700 vs 1360, from rewe_site.js we get 3672 >> after merge DE_rewe.json 4591
// const WEB_URL="https://filialfinder.cylex.de/brand/REWE%20MARKT/";
//=============================================================================================
    // const fileName="./export/DE_penny1.json"; //2150 vs 1122, from penny_site we got (from all parts) 2121 >>> 3029
// const WEB_URL="https://filialfinder.cylex.de/brand/PENNY%20Markt/";
//=============================================================================================
    // const fileName="./export/DE_edeka1.json"; //5858 vs 1041, from edeka_site.js we get 2210 >> 2621
// const WEB_URL="https://filialfinder.cylex.de/brand/Edeka/";
//=============================================================================================
    // const fileName="./export/DE_kaufland1.json"; //650 vs 643
// const WEB_URL="https://filialfinder.cylex.de/brand/Kaufland/";
//=============================================================================================
// const fileName="./export/DE_dm1.json"; //?? vs 1933
// const WEB_URL="https://filialfinder.cylex.de/brand/dm-Drogerie%20Markt/";
//=============================================================================================
    // const fileName="./export/DE_norma1.json"; //1290 vs 1447 >> 1447
// const WEB_URL="https://filialfinder.cylex.de/brand/Norma/";
//=============================================================================================
    // const fileName="./export/DE_nahandfrisch1.json"; //53 vs 59
// const WEB_URL="https://filialfinder.cylex.de/brand/Nah%20%26%20Frisch/";
//=============================================================================================
    // const fileName="./export/DE_tegut1.json"; //274 vs 133 >> from tegut_site,js 313 >> 402
// const WEB_URL="https://filialfinder.cylex.de/brand/tegut/";
//=============================================================================================
    // const fileName="./export/DE_globus1.json"; //47 vs 40
// const WEB_URL="https://filialfinder.cylex.de/brand/Globus%20SB-Warenhaus/";
//=============================================================================================
    // const fileName="./export/DE_real1.json"; //200 vs 187
// const WEB_URL="https://filialfinder.cylex.de/brand/Real/";
//=============================================================================================
    // const fileName="./export/DE_selgros1.json"; //42 vs 42
// const WEB_URL="https://filialfinder.cylex.de/brand/SELGROS/";
//=============================================================================================
const fileName="./export/DE_metro1.json"; //104 vs 101
const WEB_URL="https://filialfinder.cylex.de/brand/METRO%20Cash%20%26%20Carry/";
//=============================================================================================
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

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".cylex.de"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 5000});

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
    // const userAgent = randomUseragent.getRandom();
    // await searchPage.setUserAgent(userAgent);
    // await searchPage.screenshot({path: 'example.png'});

    const urls1=await getUrls(searchPage)//26
    const urls2=[]
    for(let i=0;i<urls1.length;i++){//urls1.length
        await searchPage.goto(urls1[i],{waitUntil: "domcontentloaded", timeout: 55000});
        const links = await getLinks4Letter(searchPage)
        urls2.push(...links)
    }

    let places = [];
    let mySet = new Set();

    for(let i=0;i<urls2.length;i++){//urls2.length
        await searchPage.goto(urls2[i],{waitUntil: "domcontentloaded", timeout: 55000});
        const addresses = await getAddress(searchPage)
        if(addresses.length>0){
            addresses.forEach(mySet.add, mySet);
        }
    }

    places.push(...mySet)
    console.log("found addresses length: "+places.length);//1935

    // console.log(places);
    saveToJsonWithStructure(places,fileName)

    await browser.close();
}
//funcs=============================================================================================
function waitFor(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}
async function getUrls(page){
    const hrefs=await page.evaluate(async()=>{//consent2
        const aTags = await document
            .querySelector("#main > section:nth-child(2) > div.panel.panel-default > div > ul").getElementsByTagName("a")
        return [...aTags].map(a=>a.href)
    })
    return hrefs
}

async function getLinks4Letter(page) {
    const hrefs=await page.evaluate(async()=>{
        const liTags=await document.getElementsByClassName("col-sm-4")
        const links=[...liTags].map(a=>{
            const aTag=a.getElementsByTagName("a")
            return aTag[0].href
        })
        return links
    })
    return hrefs
}

async function getAddress(page){
    return await page.evaluate(async()=>{
        const dataCollection=await document.getElementsByClassName("filiale-data")
        return [...dataCollection].reduce(function(result, a) {
            if (a.getElementsByTagName("span").length>2 && a.getElementsByTagName("div").length>1) {
                const cityAndZip=a.getElementsByTagName("span")[2].innerText
                const street=a.getElementsByTagName("div")[1].innerText
                result.push(street+", "+cityAndZip);
            }else if(a.getElementsByTagName("span").length>0 && a.getElementsByTagName("div").length>0){
                const cityAndZip=a.getElementsByTagName("span")[0].innerText
                const street=a.getElementsByTagName("div")[0].innerText
                result.push(street+", "+cityAndZip);
            }
            return result;
        }, []);
    })
}
