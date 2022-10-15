const randomUseragent = require('random-useragent');
// const puppeteer = require('puppeteer');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require("fs");
const {saveToJsonWithStructure} = require("../shared/json_io_files");

const urls=[
    "https://www.tegut.com/maerkte/markt/tegut-aalen-am-tannenwaeldle-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-alsfeld-an-der-au-10.html",
    "https://www.tegut.com/maerkte/markt/tegut-altenhasslau-kleinbahnweg-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-altenstadt-lindheim-die-weidenbach-5-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-amoeneburg-rossdorf-lindenstr-15.html",
    "https://www.tegut.com/maerkte/markt/tegut-ansbach-rettistr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-aschaffenburg-ludwigstr-2-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-aschaffenburg-schillerstr-109.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-brueckenau-gaensrain-1-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-hersfeld-benno-schilde-str-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-hersfeld-h-v-stephan-str-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-kissingen-garitz-riedgraben-4-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-koenigshofen-hindenburgstr-26.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-liebenstein-bahnhofstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-nauheim-stresemannstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-nauheim-schwalheimer-str-79.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-neust-brendlorenzen-thomas-mann-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-neustadt-saalestr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-salzschlirf-fuldaer-str-52.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-salzungen-untere-beete-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-salzungen-bahnhofstr-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-soden-am-taunus-koenigsteiner-str-31-33.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-sooden-allendorf-werrastr-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-vilbel-friedberger-str-93.html",
    "https://www.tegut.com/maerkte/markt/tegut-bad-zwesten-zum-kurpark-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-bamberg-ludwigstr-25.html",
    "https://www.tegut.com/maerkte/markt/tegut-baunatal-altenritte-altenbaunaer-str-14-18.html",
    "https://www.tegut.com/maerkte/markt/tegut-bebra-lindenallee-1-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-bensheim-heidelberger-str-100.html",
    "https://www.tegut.com/maerkte/markt/tegut-biebergemuend-am-pflaster-19.html",
    "https://www.tegut.com/maerkte/markt/tegut-wipperdorf-strasse-der-einheit-105.html",
    "https://www.tegut.com/maerkte/markt/tegut-bodenheim-lange-ruthe-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-brachttal-schlierbach-fabrikstr-12.html",
    "https://www.tegut.com/maerkte/markt/tegut-braunfels-wetzlarer-strasse-18-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-bruchkoebel-keltenstr-18-20.html",
    "https://www.tegut.com/maerkte/markt/tegut-bruchkoebel-niederissigheim-heinrich-boell-str-42.html",
    "https://www.tegut.com/maerkte/markt/tegut-burghaun-marktplatz-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-burgsinn-birkenweg-14.html",
    "https://www.tegut.com/maerkte/markt/tegut-coburg-neustadter-str-9b.html",
    "https://www.tegut.com/maerkte/markt/tegut-coburg-karchestr-12.html",
    "https://www.tegut.com/maerkte/markt/tegut-creuzburg-bahnhofstr-35.html",
    "https://www.tegut.com/maerkte/markt/tegut-mihla-schornstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-darmstadt-ludwigstr-2-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-darmstadt-kasinostr-92.html",
    "https://www.tegut.com/maerkte/markt/tegut-darmstadt-frankfurter-strasse-127.html",
    "https://www.tegut.com/maerkte/markt/tegut-darmstadt-strahringerplatz-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-dietzenbach-babenhaeuser-str-29.html",
    "https://www.tegut.com/maerkte/markt/tegut-dietzenbach-massayaplatz-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-dillenburg-am-sportzentrum-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-dipperz-gewerbepark-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-drei-gleichen-wandersl-am-sportplatz-22.html",
    "https://www.tegut.com/maerkte/markt/tegut-dreieich-sprendlingen-frankfurter-str-70-72.html",
    "https://www.tegut.com/maerkte/markt/tegut-edertal-giflitz-am-kornhaus-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuestensachsen-am-schwimmbad-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-eibelstadt-wuerzburger-str-45.html",
    "https://www.tegut.com/maerkte/markt/tegut-eichenzell-rhoenhof-28.html",
    "https://www.tegut.com/maerkte/markt/tegut-eisenach-nordplatz-20.html",
    "https://www.tegut.com/maerkte/markt/tegut-eisenach-barfuesser-strecke-marienstr.html",
    "https://www.tegut.com/maerkte/markt/tegut-ellwangen-bahnhofstr-21.html",
    "https://www.tegut.com/maerkte/markt/tegut-eppstein-valterweg-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-erbach-werner-von-siemens-str-35.html",
    "https://www.tegut.com/maerkte/markt/tegut-erfurt-anger-74.html",
    "https://www.tegut.com/maerkte/markt/tegut-erfurt-marktstr-28-31.html",
    "https://www.tegut.com/maerkte/markt/tegut-erfurt-gorkistr-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-erfurt-eichendorffstr-27.html",
    "https://www.tegut.com/maerkte/markt/tegut-erfurt-haessler-str-6-8-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-erlangen-nuernberger-str-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-erlangen-lange-zeile-61.html",
    "https://www.tegut.com/maerkte/markt/tegut-erlangen-san-carlos-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-eschwege-bahnhofstr-25-27.html",
    "https://www.tegut.com/maerkte/markt/tegut-feldatal-kestrich-im-borngarten-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-fellbach-schmiden-gotthilf-bayh-str-1-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-flieden-schluechterner-str-3-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-neuhaus-schierschnitz-an-der-hofwiese-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankenblick-ot-mengersgereuth-haemm-bahnhofsallee-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-friedberger-landstr-408.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-voltastr-70-72.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-mailaender-str-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-neue-mainzer-str-6-10.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-kurt-schumacher-str-30-32.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-am-main-kaiserstrasse.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-flughafen-terminal-1-ebene-u1-bereich.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-rebstockhoefe-leonardo-da-vinci-allee-4-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-am-eschenheimer-turm-bleichstr-57.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-bergen-enkheim-triebstr-51.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-fechenheim-pfortenstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-preungesheim-gravensteiner-platz-4-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-roedelheim-radilostr-17-19.html",
    "https://www.tegut.com/maerkte/markt/tegut-frankfurt-sachsenhausen-walter-kolb-str-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-freiensteinau-im-muehlfeld-23.html",
    "https://www.tegut.com/maerkte/markt/tegut-freigericht-somborn-raiffeisenstr-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-friedberg-anna-kloos-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-friedberg-fauerbacher-str-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-fritzlar-am-hospital-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-rabanusstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-maberzeller-str-45.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-lindenstrasse-32.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-gerloser-weg-72-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-bahnhofstr-25.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-bronnzeller-str-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-petersberger-str-76.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-magdeburger-str-24.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-abt-hadamar-str-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-pacelliallee-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-emaillierwerk-am-emaillierwerk-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-haimbach-merkurstr-16-20.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-horas-schlitzer-str-79-81.html",
    "https://www.tegut.com/maerkte/markt/tegut-fulda-kaiserwiesen-keltenstr-20.html",
    "https://www.tegut.com/maerkte/markt/tegut-fuerth-gustav-schickedanz-str-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-fuerth-herrnstrasse-26.html",
    "https://www.tegut.com/maerkte/markt/tegut-geisa-gartenweg-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-gelnhausen-am-ziegelturm-2-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-gelnhausen-roth-leipziger-str-74.html",
    "https://www.tegut.com/maerkte/markt/tegut-gemuenden-wuerzburger-str-75.html",
    "https://www.tegut.com/maerkte/markt/tegut-gemuenden-am-weinberg-5-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-gerbrunn-am-kirschberg-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-gerolzhofen-schallfelder-str-38.html",
    "https://www.tegut.com/maerkte/markt/tegut-giessen-neustadt-28.html",
    "https://www.tegut.com/maerkte/markt/tegut-giessen-schlangenzahl-adolph-kolping-str-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-ginsheim-gustavsburg-adam-opel-str-4-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-gotha-leinastr-78.html",
    "https://www.tegut.com/maerkte/markt/tegut-gotha-siebleben-weimarer-str-120-b.html",
    "https://www.tegut.com/maerkte/markt/tegut-goettingen-am-kaufpark-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-goettingen-carre-weender-str-75.html",
    "https://www.tegut.com/maerkte/markt/tegut-goettingen-weende-an-der-lutter-22.html",
    "https://www.tegut.com/maerkte/markt/tegut-goettingen-zietenterrassen-alfred-delp-weg-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-grabfeld-juechsen-meininger-str-2a.html",
    "https://www.tegut.com/maerkte/markt/tegut-griesheim-feldstr-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-gross-zimmern-waldstr-71-b.html",
    "https://www.tegut.com/maerkte/markt/tegut-grossostheim-pflaumheim-rudelzauer-str-14.html",
    "https://www.tegut.com/maerkte/markt/tegut-ringheim.html",
    "https://www.tegut.com/maerkte/markt/tegut-hallstadt-michelinstr-142.html",
    "https://www.tegut.com/maerkte/markt/tegut-hambach-dittelbrunn-im-buettnerstrich-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-hanau-heldenbergener-str-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-hanau-am-hauptbahnhof.html",
    "https://www.tegut.com/maerkte/markt/tegut-heidelberg-hauptstr-110.html",
    "https://www.tegut.com/maerkte/markt/tegut-heidelberg-rheinstr-29.html",
    "https://www.tegut.com/maerkte/markt/tegut-heilbad-heiligenstadt-bruesseler-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-heldburg-roedelsweg-255-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-herbsleben-hauptstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-heusenstamm-hainhaeuser-strasse-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-hirschaid-bamberger-str-18.html",
    "https://www.tegut.com/maerkte/markt/tegut-hoechberg-waldstr-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-hofbieber-langenbieberer-str-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-hofgeismar-industriestr-17.html",
    "https://www.tegut.com/maerkte/markt/tegut-hohenroth-veitsberg-am-hohn-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-huenfeld-am-niedertor-2-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-huenfeld-josefstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-michelsrombach-koenigskuppel-15.html",
    "https://www.tegut.com/maerkte/markt/tegut-huenstetten-kesselbach-neukirchner-str-14.html",
    "https://www.tegut.com/maerkte/markt/tegut-ichtershausen-wachsenburgstr-99.html",
    "https://www.tegut.com/maerkte/markt/tegut-langewiesen-margarethenstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-jena-carl-zeiss-str-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-johannesberg-muehlbergstrasse.html",
    "https://www.tegut.com/maerkte/markt/tegut-kahla-oelwiesenweg-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-kaltennordheim-gartenstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-karben-bahnhofstr-190-196.html",
    "https://www.tegut.com/maerkte/markt/tegut-karlstadt-bodelschwinghstr-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-frankfurter-str-86.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-wilhelmshoeher-allee-89-u-91.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-wilhelmshoeher-allee-253.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-friedrich-ebert-str-29.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-atrium-wilhelmshoeher-allee-262.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-bettenhausen-leipziger-str-136.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-city-point-koenigsplatz-61.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-harleshausen-zum-hirtenkamp-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-lohfelden-elisabeth-selbert-str-40.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-marbachshoehe-ludwig-erhard-str-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-kassel-rothenditmold-wolfhager-str-278.html",
    "https://www.tegut.com/maerkte/markt/tegut-katzhuette-schwarzburger-str-14.html",
    "https://www.tegut.com/maerkte/markt/tegut-kelsterbach-moerfelder-str-22.html",
    "https://www.tegut.com/maerkte/markt/tegut-kirchhain-muehlgasse-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-kirtorf-gruener-weg-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-korbach-briloner-landstr-4-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-kronberg-im-taunus-frankfurter-str-50-52.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-abterode-vorderweg-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-alzenau-friedberger-gaesschen-5.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-bad-langensalza-marktstr-25.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-berkatalfrankershausen-am-wasser-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-borken-kleinenglis-hundsburgstr-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-coelbe-schoenstadt-am-buergerhaus-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-dachwig-bahnhofstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-erfurtmarbach-bergener-str-18.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-eschwege-wendische-mark-7-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-gertenbach-muendener-str-17.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-haina-loehlbach-raiffeisenstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-kronberg-schoenberg-taunus-mainblick-65.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-langenfeld-ullstaedter-str-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-leinach-rathausstr-33.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-marburg-rudolf-bultmann-str-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-marburg-stadtwald-jakob-kaiser-str-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-marburg-michelbach-stuempelstal-1a.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-okarben-friedhofsweg-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-rainrod-muehlstr-23.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-ranis-blumenstr-41.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-schonungen-ludwig-grobe-str-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-schweinfurt-schelmsrasen-4-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-stockhausen-welzgasse-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-villingenhungen-hoehenstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-oberweser-gieselwerder-in-der-klappe-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-laedchen-wuerzburg-oberduerrbach-gadheimer-str-1a.html",
    "https://www.tegut.com/maerkte/markt/tegut-langen-rheinstr-31.html",
    "https://www.tegut.com/maerkte/markt/tegut-langenselbold-ringstr-58.html",
    "https://www.tegut.com/maerkte/markt/tegut-laufach-hauptstr-34.html",
    "https://www.tegut.com/maerkte/markt/tegut-lauterbach-an-der-leimenkaute-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-limburg-joseph-schneider-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-lobbach-langenzeller-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-lohr-ludwigstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-lorsch-marie-curie-str-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-ludwigsau-friedlos-industriestr-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-ludwigsburg-marstallstr-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-mackenzell-huenfelder-str-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-mainhausen-mainflingen-erwin-grimm-ring-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-maintal-doernigheim-braubachstr-18.html",
    "https://www.tegut.com/maerkte/markt/tegut-mainz-holzhofstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-mainz-hechtsheimer-str-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-mainz-bahnhofstr-8a.html",
    "https://www.tegut.com/maerkte/markt/tegut-mainz-finthen-katzenberg-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-malsch-hauptstrasse-122.html",
    "https://www.tegut.com/maerkte/markt/tegut-marburg-universitaetsstr-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-marburg-cappel-marburger-str-100.html",
    "https://www.tegut.com/maerkte/markt/tegut-marburg-ketzerbach-ketzerbach-25-28.html",
    "https://www.tegut.com/maerkte/markt/tegut-marburg-wehrda-am-kaufmarkt-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-margetshoechheim-erlabrunnerstr-36.html",
    "https://www.tegut.com/maerkte/markt/tegut-marktheidenfeld-luitpoldstr-17.html",
    "https://www.tegut.com/maerkte/markt/tegut-meiningen-landsberger-str-2-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-meiningen-utendorfer-str-31.html",
    "https://www.tegut.com/maerkte/markt/tegut-meiningen-dreissigacker-berkerserstr-31.html",
    "https://www.tegut.com/maerkte/markt/tegut-melsungen-kasseler-str-52.html",
    "https://www.tegut.com/maerkte/markt/tegut-moerfelden-walldorf-gerauer-str-54-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-muehlhausen-langensalzaer-landstr-25.html",
    "https://www.tegut.com/maerkte/markt/tegut-muehlheim-am-main-schillerstr-77-79.html",
    "https://www.tegut.com/maerkte/markt/tegut-muehlheim-am-main-ulmenstrasse-13h.html",
    "https://www.tegut.com/maerkte/markt/tegut-muenchen-thomas-dehler-strasse-15.html",
    "https://www.tegut.com/maerkte/markt/tegut-muenchen-elisenhof-luitpoldstrasse-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-neuhof-hanauer-str-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-niederdorfelden-an-der-rosenhelle-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-niedernhausen-feldbergstr-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-nordhausen-salza-strasse-der-opfer-des-fasch-44.html",
    "https://www.tegut.com/maerkte/markt/tegut-nuedlingen-muehlweg-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-oberelsbach-oberwaldbehrunger-str-20.html",
    "https://www.tegut.com/maerkte/markt/tegut-oberhof-graefenrodaer-str-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-oberursel-epinay-platz-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-offenbach-berliner-str-178.html",
    "https://www.tegut.com/maerkte/markt/tegut-offenbach-am-main-grosse-marktstr-36-42.html",
    "https://www.tegut.com/maerkte/markt/tegut-offenbach-bieber-aschaffenburger-str-24.html",
    "https://www.tegut.com/maerkte/markt/tegut-ohrdruf-marktplatz-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-partenstein-im-see-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-petersberg-edith-stein-str-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-petersberg-breitunger-str-2-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-petersberg-marbach-josef-damian-schmitt-strasse-1a.html",
    "https://www.tegut.com/maerkte/markt/tegut-petersberg-steinau-schulstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-poppenhausen-am-forsthaus-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-rasdorf-landstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-riedstadt-wolfskehlen-lise-meitneroppenheimer-str.html",
    "https://www.tegut.com/maerkte/markt/tegut-roedental-kronacher-str-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-rotenburg-braacher-str-14-16.html",
    "https://www.tegut.com/maerkte/markt/tegut-saal-hauptstr-63.html",
    "https://www.tegut.com/maerkte/markt/tegut-saalfeld-reinhardtstr-56.html",
    "https://www.tegut.com/maerkte/markt/tegut-schalkau-waldstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-schleusingen-plettenberger-weg-17.html",
    "https://www.tegut.com/maerkte/markt/tegut-schlitz-bruchwiesenweg-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-schluechtern-breitenbacher-str-22.html",
    "https://www.tegut.com/maerkte/markt/tegut-schmalnau-brueckenstr-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-schoenbrunn-gabeler-str-1-a.html",
    "https://www.tegut.com/maerkte/markt/tegut-schrecksbach-kasseler-str-25.html",
    "https://www.tegut.com/maerkte/markt/tegut-schwaebisch-gmuend-an-der-oberen-halde-64.html",
    "https://www.tegut.com/maerkte/markt/tegut-schwaebisch-gmuend-vordere-schmiedgasse-22-28.html",
    "https://www.tegut.com/maerkte/markt/tegut-schwalmstadttreysa-walkmuehlenweg-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-schwarzach-am-main-zur-abtei-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-schweinfurt-niederwerrn-gretel-baumbach-str-8.html",
    "https://www.tegut.com/maerkte/markt/tegut-seligenstadt-frankfurter-str-96.html",
    "https://www.tegut.com/maerkte/markt/tegut-sondershausen-beethovenstr-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-staufenberg-porstendorfer-str-3.html",
    "https://www.tegut.com/maerkte/markt/tegut-steinau-brueder-grimm-str-132.html",
    "https://www.tegut.com/maerkte/markt/tegut-steinau-adstr-ot-ulmbach-heinz-desor-strasse-3a.html",
    "https://www.tegut.com/maerkte/markt/tegut-viernau-muehlstr-52.html",
    "https://www.tegut.com/maerkte/markt/tegut-stockstadt-industriestr-24.html",
    "https://www.tegut.com/maerkte/markt/tegut-stuttgart-heusteigstrasse-41.html",
    "https://www.tegut.com/maerkte/markt/tegut-stuttgart-alarichstr-4.html",
    "https://www.tegut.com/maerkte/markt/tegut-stuttgart-koenigsbaupassagen-koenigstrasse-26.html",
    "https://www.tegut.com/maerkte/markt/tegut-stuttgart-milaneo-mailaender-platz-7.html",
    "https://www.tegut.com/maerkte/markt/tegut-stuttgart-epplestr-14.html",
    "https://www.tegut.com/maerkte/markt/tegut-suhl-lautenberg-linsenhoferstr-63.html",
    "https://www.tegut.com/maerkte/markt/tegut-sulzbach-main-taunus-zentrum-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-tann-st-nikolaus-weg-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-tauberbischofsheim-krautgartenweg-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-themar-meininger-str-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-treysa-friedrich-ebert-str-90.html",
    "https://www.tegut.com/maerkte/markt/tegut-unterbreizbach-bahnhofstr-27.html",
    "https://www.tegut.com/maerkte/markt/tegut-unterspiesheim-lachenbrunnweg-1.html",
    "https://www.tegut.com/maerkte/markt/tegut-vellmar-rathausplatz-8-11.html",
    "https://www.tegut.com/maerkte/markt/tegut-waiblingen-albert-roller-str2fronackers.html",
    "https://www.tegut.com/maerkte/markt/tegut-walldorf-dorfplatz-40.html",
    "https://www.tegut.com/maerkte/markt/tegut-waltershausen-ibenhainer-str-65.html",
    "https://www.tegut.com/maerkte/markt/tegut-weimar-rainer-maria-rilke-str-41.html",
    "https://www.tegut.com/maerkte/markt/tegut-weimar-damaschkestr.html",
    "https://www.tegut.com/maerkte/markt/tegut-weiterstadt-max-planck-str-6.html",
    "https://www.tegut.com/maerkte/markt/tegut-wiesbaden-luisenstr-23.html",
    "https://www.tegut.com/maerkte/markt/tegut-wiesbaden-dotzheimerstr-82.html",
    "https://www.tegut.com/maerkte/markt/tegut-wiesbaden-richard-wagner-str-86.html",
    "https://www.tegut.com/maerkte/markt/tegut-wiesbaden-naurod-fondetterstr-26.html",
    "https://www.tegut.com/maerkte/markt/tegut-wiesbaden-schierstein-rheingaustr-30.html",
    "https://www.tegut.com/maerkte/markt/tegut-witzenhausen-an-der-bohlenbruecke.html",
    "https://www.tegut.com/maerkte/markt/tegut-woelfersheim-biedrichstr-13.html",
    "https://www.tegut.com/maerkte/markt/tegut-wolfhagen-schuetzeberger-str-91.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuerzburg-estenfeld-am-zehenthuegel-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuerzburg-frauenland-zeppelinstr-122.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuerzburg-rottenbauer-schleifweg-9.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuerzburg-sanderau-virchowstr-2.html",
    "https://www.tegut.com/maerkte/markt/tegut-wuerzburg-zellerau-frankfurter-str-18.html",
    "https://www.tegut.com/maerkte/markt/tegut-benshausen-hauptstr-12.html",
    "https://www.tegut.com/maerkte/markt/tegut-ziegenhain-ernst-ihle-str-8.html"
]
//https://www.tegut.com/maerkte/maerkteliste.html
//=============================================================================================
const fileName="./export/DE_tegut2.json"
const BASE_URL="https://www.tegut.com"
const WEB_URL="https://www.tegut.com/maerkte/maerkteliste.html";
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

    const navigationPromise = searchPage.waitForNavigation({waitUntil: "domcontentloaded"});

    const cookies = [{"name": "CONSENT", "value": `YES+`, "domain": ".tegut.com"}];//CONSENT=PENDING+193;
    await searchPage.setCookie(...cookies);
    // await searchPage.goto(WEB_URL,{waitUntil: "domcontentloaded", timeout: 10000});
    await searchPage.goto(WEB_URL);
    await navigationPromise;

    await searchPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');

    await searchPage.waitForSelector('#onetrust-reject-all-handler')
    await searchPage.evaluate(() => {//consent
        document.querySelector("#onetrust-reject-all-handler").click()
    })
    await waitFor(3000);

    const citiesfinal=urls
    console.log("urlCitiesFromWebsite:", citiesfinal.length);//313
    let places = [];

    for(let i=0; i<citiesfinal.length;i++ ){//citiesfinal.length
        const url=citiesfinal[i]
        await searchPage.goto(url,{waitUntil: 'networkidle0', timeout: 55000});
        const addrs=await goToCity(searchPage)
        console.log(i+", "+url+"\t found: "+addrs);
        places.push(addrs)
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
    const selStr="#store_map_overlay\\ mb-lg-0"
    // await page.waitForSelector(selStr)

    return await page.evaluate(async (selStr)=>{
        const el0 = await document.querySelector(selStr)
        if(el0){
            let adr=el0.innerText
            adr=adr.split("Mo-Sa:")[0]
            adr=adr.trim().replaceAll(" ,",",")
            return adr
        }

    },selStr)
}


