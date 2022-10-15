
// =============================================================================================
// {"addresses": [
//         {"fullAddress": "Ulmer Str. 150, 73431 Aalen"}, {"fullAddress": "Carl-Zeiss-Str. 85, 73431 Aalen"}
// ]}

const fs = require("fs");
const saveToJsonWithStructure=(dataArray, fileName)=>{
    const fs = require("fs");
    const dataObj =  dataArray.reduce((map, item) => {
        map.addresses.push( { fullAddress: item} );
        return map;
    }, { addresses: []})

// Write addresses object to file
    fs.writeFileSync(fileName, JSON.stringify(dataObj, null, 4), "utf8");

// Read back from the file...
    const addressesFromFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
    // console.log("Addresses from file:", addressesFromFile);
    console.log("Addresses from file:", addressesFromFile.addresses.length);//
}

//node -e 'require("./json_io_files").getAddressesLength("../withIndividualSites/export/DE_aldi_north.json")'
const getAddressesLength=(fileName)=>{
    const fs = require("fs");
    const deZipData = JSON.parse(fs.readFileSync(fileName, "utf8"));
    const len=deZipData.addresses.length
    console.log(fileName+", "+len)
    return len;
}
function checkForDuplicates(array, keyName) {
    return new Set(array.map(item => item[keyName])).size !== array.length
}
function removeDuplicates(array, keyName) {
    let places = [];
    const mySet = new Set(array.map(item => item[keyName]))
    places.push(...mySet)
    return places
}
const saveToJson=(dataArray, fileName)=>{
    const fs = require("fs");
    const dataObj =  dataArray.reduce((map, item) => {
        map.addresses.push( item );
        return map;
    }, { addresses: []})

// Write addresses object to file
    fs.writeFileSync(fileName, JSON.stringify(dataObj, null, 4), "utf8");

// Read back from the file...
    const addressesFromFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
    // console.log("Addresses from file:", addressesFromFile);
    console.log("Addresses from file:", addressesFromFile.addresses.length);//
}
const standartaiseAddress=(dataArr)=>{
    const street=" Straße"
    const streetTo=" Str."
    return dataArr.map(a=>{
        let streetStr=a.fullAddress
        streetStr=streetStr.replace(street,streetTo)
        streetStr=streetStr.replace(" ,",",")
        return {fullAddress:streetStr}
    })
}

//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_tegut1.json","../withIndividualSites/export/DE_tegut2.json","../withIndividualSites/export/DE_tegut.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_edeka1.json","../withIndividualSites/export/DE_edeka2.json","../withIndividualSites/export/DE_edeka.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_rewe1.json","../withIndividualSites/export/DE_rewe2.json","../withIndividualSites/export/DE_rewe.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_netto1.json","../withIndividualSites/export/DE_netto2.json","../withIndividualSites/export/DE_netto.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_aldi_south.json","../withIndividualSites/export/DE_aldi_north.json","../withIndividualSites/export/DE_aldi.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_lidl1.json","../withIndividualSites/export/DE_lidl2.json","../withIndividualSites/export/DE_lidl.json" )'
const mergeAddresses=(fileName1,fileName2,fileNameResult)=>{
    const fs = require("fs");
    const deZipData1 = JSON.parse(fs.readFileSync(fileName1, "utf8"));
    console.log(fileName1+", "+deZipData1.addresses.length)
    const deZipData2 = JSON.parse(fs.readFileSync(fileName2, "utf8"));
    console.log(fileName2+", "+deZipData2.addresses.length)

    let tempArr=standartaiseAddress(deZipData1.addresses)
    tempArr=tempArr.concat(standartaiseAddress(deZipData2.addresses))
    const places=removeDuplicates(tempArr, "fullAddress")

    console.log(fileNameResult+", "+places.length)
    saveToJsonWithStructure(places,fileNameResult)
}

//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_metro1.json","../withIndividualSites/export/DE_metro.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_selgros1.json","../withIndividualSites/export/DE_selgros.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_norma1.json","../withIndividualSites/export/DE_norma.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_nahandfrisch1.json","../withIndividualSites/export/DE_nahandfrisch.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_globus1.json","../withIndividualSites/export/DE_globus.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_real1.json","../withIndividualSites/export/DE_real.json")'
//node -e 'require("./json_io_files").cleanAddressStr("../withIndividualSites/export/DE_kaufland1.json","../withIndividualSites/export/DE_kaufland.json")'
const cleanAddressStr=(fileName,fileNameResult)=>{
    const fs = require("fs");
    const deZipData = JSON.parse(fs.readFileSync(fileName, "utf8"))
    console.log(fileName+", "+deZipData.addresses.length)
    const tempArr=standartaiseAddress(deZipData.addresses)
    const places=removeDuplicates(tempArr, "fullAddress")

    console.log(fileName+", "+places.length)
    saveToJsonWithStructure(places,fileNameResult)
}

const getShortZips=(fileName)=>{
    const fs = require("fs");
    const deZipData = JSON.parse(fs.readFileSync(fileName, "utf8"));
    const zips=[]
    deZipData.zips.map(a=>zips.push(a.zip))
    return zips;
}

const getZips=(fileName)=>{
    const fs = require("fs");
    const zipsWithCities=[]
    const deZipData = JSON.parse(fs.readFileSync(fileName, "utf8"));
    const dataArr= Object.values(deZipData)

    for(let item of dataArr){
        const obj={"zip": item.zipcode,"cities":[item.city]}
        if(zipsWithCities.length==0){
            zipsWithCities.push(obj)
        }else{
            const foundZip=zipsWithCities.find(a=>a.zip===item.zipcode)
            if(foundZip!=undefined){
                foundZip.cities.push(item.city)
            }else {
                zipsWithCities.push(obj)
            }
        }
    }

    const zips=zipsWithCities.map(a=>a.zip)
//uncomment to override or create new file with zip-cities mapping
//saveZipsToJson(zipsWithCities,"german-zip-short.json")
    return zips;
}

const saveZipsToJson=(dataArray,fileName)=>{
    const fs = require("fs");
    const dataObj =  dataArray.reduce((map, item) => {
        map.zips.push( { ...item} );
        return map;
    }, { zips: []})

    fs.writeFileSync("./exportFinal/"+fileName, JSON.stringify(dataObj, null, 4), "utf8");

    const zipsFromFile = JSON.parse(fs.readFileSync("./exportFinal/"+fileName, "utf8"));
    console.log("Zips from file:", zipsFromFile.zips.length);//8308
}
module.exports = {saveToJsonWithStructure,getAddressesLength,cleanAddressStr,mergeAddresses,getShortZips, getZips, saveZipsToJson };


//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_penny2a.json","../withIndividualSites/export/DE_penny2b.json","../withIndividualSites/export/DE_pennyR1.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_pennyR1.json","../withIndividualSites/export/DE_penny2c.json","../withIndividualSites/export/DE_pennyR2.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_pennyR2.json","../withIndividualSites/export/DE_penny2d.json","../withIndividualSites/export/DE_pennyR3.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_pennyR3.json","../withIndividualSites/export/DE_penny2e.json","../withIndividualSites/export/DE_pennyR4.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_pennyR4.json","../withIndividualSites/export/DE_penny2f.json","../withIndividualSites/export/DE_pennyR5.json" )'
//node -e 'require("./json_io_files").mergeAddresses("../withIndividualSites/export/DE_pennyR5.json","../withIndividualSites/export/DE_penny1.json","../withIndividualSites/export/DE_penny.json" )'



