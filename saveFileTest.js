const xlsx = require("xlsx");
const fs = require("fs");

const arr=[
    'Schwanthalerstraße 31, 80336 München',
    'Elisenstraße 3, 80335 München',
    'Dreimühlenstraße 42, 81371 München',
    'Hackerbrücke 4, 80335 München',
    'Zweibrückenstraße 8, 80331 München',
    'Albert-Roßhaupter-Straße 35-39, 81369 München',
    'Orleanspl. 7, 81667 München',
    'Kirchenstraße 86, 81675 München',
    'Dachauer Str. 92, 80335 München',
    'Zubringer, A31, 83088 Kiefersfelden',
    'Westendstraße 100, 80339 München',
    'Nymphenburger Str. 81, 80636 München',
    'Luisenstraße 51-53, 80333 München',
    'Tübinger Str. 9, 80686 München',
    'Leopoldstraße 21, 80802 München',
    'Knorrstraße 57, 80807 München',
    'Schleißheimer Str. 85-87, 80797 München',
    'Kistlerhofstraße 152, 81379 München',
    'Hofmannstraße 16, 81379 München',
    'Theresienhöhe 5, 80339 München',
    'Schwanthalerstraße 31, 80336 München',
    'Elisenstraße 3, 80335 München',
    'Dreimühlenstraße 42, 81371 München',
    'Hackerbrücke 4, 80335 München',
    'Zweibrückenstraße 8, 80331 München',
    'Albert-Roßhaupter-Straße 35-39, 81369 München',
    'Orleanspl. 7, 81667 München',
    'Kirchenstraße 86, 81675 München',
    'Dachauer Str. 92, 80335 München',
    'Leopoldstraße 21, 80802 München',
    'Knorrstraße 57, 80807 München',
    'Westendstraße 100, 80339 München',
    'Kistlerhofstraße 152, 81379 München',
    'Nymphenburger Str. 81, 80636 München',
    'Tübinger Str. 9, 80686 München',
    'Luisenstraße 51-53, 80333 München',
    'Hofmannstraße 16, 81379 München',
    'Biberger Str. 64, 82008 Unterhaching',
    'Schleißheimer Str. 85-87, 80797 München',
    'Landsberger Str. 378, 80687 München',
    'Schwanthalerstraße 31, 80336 München',
    'Elisenstraße 3, 80335 München',
    'Dreimühlenstraße 42, 81371 München',
    'Hackerbrücke 4, 80335 München',
    'Zweibrückenstraße 8, 80331 München',
    'Albert-Roßhaupter-Straße 35-39, 81369 München',
    'Orleanspl. 7, 81667 München',
    'Kirchenstraße 86, 81675 München',
    'Dachauer Str. 92, 80335 München',
    'Zubringer, A31, 83088 Kiefersfelden',
    'Westendstraße 100, 80339 München',
    'Nymphenburger Str. 81, 80636 München',
    'Luisenstraße 51-53, 80333 München',
    'Tübinger Str. 9, 80686 München',
    'Leopoldstraße 21, 80802 München',
    'Knorrstraße 57, 80807 München',
    'Schleißheimer Str. 85-87, 80797 München',
    'Kistlerhofstraße 152, 81379 München',
    'Hofmannstraße 16, 81379 München',
    'Theresienhöhe 5, 80339 München',
    'Koblenzer Str. 33, 56626 Andernach',
    'Kochendorfer Str. 44, 74172 Neckarsulm',
    'Goldsteinstraße 157, 60528 Frankfurt am Main'
]

const arr2=[
    {title:"Lidl",
        address:'Theresienhöhe 5, 80339 München'},
    {title:"Lidl",
        address:'Koblenzer Str. 33, 56626 Andernach'},
    {title:"Lidl",
        address:'Kochendorfer Str. 44, 74172 Neckarsulm'},
    {title:"Lidl",
        address:'Goldsteinstraße 157, 60528 Frankfurt am Main'}
]

main()
    .then( ()    => console.log("Done"))
    .catch((err) => console.error(err))

async function main(){
    saveArrayToFile(arr2);
}

function saveArrayToFile(places){
    const placesLinks=places.map(l => [l.title+', '+l.address]);
    // const placesLinks=places.map(l => [l]);
    const book=xlsx.utils.book_new();
    const sheet=xlsx.utils.aoa_to_sheet(placesLinks);
    xlsx.utils.book_append_sheet(book,sheet);
    xlsx.writeFile(book,"lidl_de.xlsx");

    const output_file_name = "export/lidl_de.csv";
    const stream = xlsx.stream.to_csv(sheet);
    stream.pipe(fs.createWriteStream(output_file_name));
}

