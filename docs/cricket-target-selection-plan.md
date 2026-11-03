# Plaan: Cricketi valitavad sihtmärgid

## Nõuded ja kokkulepped

- Lisa „Täpsemad seaded” ploki kõige alla sihtmärkide valikunupud: **10–20 ja Bull**.
- Korraga saab valida kuni **8 sihtmärki**; Bull läheb arvestusse ühe sihtmärgina.
- Seadistusvaate esmakordsel avamisel on alati valitud **15, 16, 17, 18, 19, 20 ja Bull** ehk seitse sihtmärki. Varasema mängu kohandatud valikut ei taastata uue seadistusvaate vaikevalikuks.
- Plaani eeldus: lubatud on **1–8** sihtmärki ja Bull ei ole kohustuslik. Vähemalt üks sihtmärk peab jääma valituks, et mängul oleks võidutingimus.
- Valik kehtib kogu matšile, kõigile mängijatele ja leg’idele ning kordusmängule. Käimasoleva matši sihtmärgid on fikseeritud. Seadistustesse tagasi tulles säilib sama seadistuskomponendi valik, et seda saaks muuta.
- Mängus näita valitud numbreid kahanevalt, Bull alati viimasena; valimise järjekord mängu ei mõjuta.

See on teostusplaan. Rakenduse käitumist selle koostamisel ei muudeta.

## Praegune olukord

[Mänguloogikas](../src/lib/cricket.ts) määrab `CRICKET_TARGETS` korraga tüübi, lubatud sündmused ja võiduks sulgetavad sihtmärgid. Märkide algolek on samuti fikseeritud numbritele 15–20 ja Bull.

[1v1 tabel](../src/app/play/cricket/cricket-scoreboard.tsx), [mitme mängija tabel](../src/app/play/cricket/cricket-multiplayer-scoreboard.tsx), [kompaktne sisestus](../src/app/play/cricket/cricket-compact-controls.tsx) ja [mänguvaade](../src/app/play/cricket/cricket-game.tsx) kasutavad sama fikseeritud loendit. [Visete sisestuses](../src/app/play/cricket/cricket-controls.tsx) on numbrid 20–15 eraldi loendina ning Bulli nupud kuvatakse alati. [Stiilides](../src/app/play/cricket/cricket-scoreboard.css) leidub seitsmele sihtmärgile määratud veergude arv.

## 1. Seadistus ja valikunupud

Muuda [seadistusvaadet](../src/app/play/cricket/cricket-setup.tsx):

- Lisa valitud sihtmärkide olek vaikimisi väärtusega 20–15 ja Bull.
- Lisa punktiarvestuse valiku järele viimane seadistusrühm „Sihtmärgid”. Kuva nupud 10, 11, …, 20, Bull ning loendur „Valitud 7/8”.
- Nupp lülitab sihtmärgi sisse või välja. Valitud olek peab eristuma visuaalselt ja olema abitehnoloogiale loetav näiteks `aria-pressed` kaudu; nupud on `type="button"`.
- Kaheksa valiku korral keela üksnes valimata sihtmärgid. Valitud nupud peavad võimaldama valiku eemaldamist. Ühe valiku korral takista viimase eemaldamist ja selgita miinimumi.
- Näita lühikest juhist „Vali 1–8 sihtmärki”. Lisa ligipääsetav teavitus valikute arvu muutumisel ja nähtav klaviatuurifookus.
- Anna valik edasi nii matši alustamisel kui ka kordusmängul. Valideeri see enne alustamist ka siis, kui kasutajaliides juba piiranguid rakendab.
- Paiguta 12 nuppu mobiilis mitmele reale, ilma horisontaalse kerimiseta; hoia mängu alustamise nupp senises jaluses.

## 2. Ühine mängupõhine konfiguratsioon

Muuda [Cricketi loogikat](../src/lib/cricket.ts):

- Eralda kõigi lubatud sihtmärkide loend (10–20 ja 25) vaikimisi loendist (20–15 ja 25). Laienda `CricketTarget` tüüp kogu lubatud vahemikule. Bulli sisemine väärtus jääb 25.
- Lisa mängu konfiguratsiooni valikuline `targets` ja tuletatud mänguolekusse normaliseeritud sihtmärkide loend. Puuduv väli tähendab senist vaikevalikut, et vanad mänguobjektid toimiksid edasi.
- Loo ühine abifunktsioon, mis kontrollib 1–8 erinevat lubatud sihtmärki ja tagastab need mängu kuvamisjärjekorras. Selgesõnaliselt vigane väärtus, tühi loend, duplikaadid või üle kaheksa valiku lükatakse tagasi. Ära muuda vigast valikut vaikimisi valikuks.
- Säilita olemasolev `CRICKET_TARGETS` vaikevaliku tähenduses või paku samaväärne ühilduvus, et praegused vaikevalikule rajatud testid ei hakkaks ootamatult 12 sihtmärki kasutama.
- Laienda mängu ja matši loomise funktsioone tagasiühilduvalt valiku vastuvõtmiseks. Kopeeri sisendloend, et seadistuse hilisem muutmine ei muudaks loodud mängu.
- Initsialiseeri märkide ja punkte andnud märkide kirjed kogu lubatud sihtmärkide vahemikule. Mängu aktiivsed sihtmärgid määrab eraldi normaliseeritud loend.
- Kontrolli sündmuste valideerimisel ka sihtmärgi kuulumist selle mängu valikusse: valimata sihtmärgi `hit` ja `mark` lükatakse tagasi.
- Võit eeldab ainult valitud sihtmärkide sulgemist koos senise Standardi või Cutthroati punktitingimusega. Kontrolli ka olukorda, kus Cutthroati sündmus annab võidu teisele mängijale.
- Punktid kasutavad sihtmärgi tegelikku väärtust: näiteks 10 annab lisamärgi eest 10 punkti. Bull annab endiselt 25 punkti märgi kohta ja lubab üksnes kordajaid 1 või 2.
- Säilita mängijapõhine sulgemispiir, kolm noolt käigus ja kompaktse sisestuse üheksa märgi piir. **Kaheksa sihtmärgi piir ei ole käigu tabamuste piir.**

## 3. Kõik mänguvaated ja sisestused

Kasuta kõikjal mänguolekust pärit aktiivsete sihtmärkide loendit:

- [1v1 tabelis](../src/app/play/cricket/cricket-scoreboard.tsx) genereeri ainult valitud sihtmärkide read ja kompaktse sisestuse nupud.
- [Mitme mängija tabelis](../src/app/play/cricket/cricket-multiplayer-scoreboard.tsx) kuva kõigi mängijate kaartidel sama valik ja järjestus. See hõlmab ka alternatiivse 1v1 vaate väljalülitamisel kasutatavat paigutust.
- [Kompaktsetes juhtnuppudes](../src/app/play/cricket/cricket-compact-controls.tsx) genereeri nupud aktiivse loendi põhjal; käigu kinnitamine jääb eraldi toiminguks.
- [Visete juhtnuppudes](../src/app/play/cricket/cricket-controls.tsx) genereeri valitud numbritele single/double/triple. Kuva Bull 25/50 ainult siis, kui Bull on valitud.
- [Mänguvaates](../src/app/play/cricket/cricket-game.tsx) kasuta sama loendit suletud sihtmärkide leidmisel ja eelmise käigu märkide kokkuvõttes.
- Kontrolli [sihtmärkide olekustiile](../src/app/play/cricket/cricket-target-style.ts) ja [märginuppu](../src/app/play/cricket/cricket-mark-button.tsx), et uued numbrid saaksid senised sulgemise, ohu ja sisestuse keelamise olekud.
- Kohanda [tabeli](../src/app/play/cricket/cricket-scoreboard.css) ja [sisestuse stiilides](../src/app/play/cricket/cricket-controls.css) sihtmärkide arvust sõltuvad veerud dünaamiliseks. Kontrolli 1, 7 ja 8 sihtmärki ning Bullita mängu; viimase sihtmärgi või käigu kinnitamise nupu asukoht ei tohi eeldada seitsmerealist tabelit.
- Täienda olemasolevat tõlkelahendust uute siltide ja piirangute tekstidega. Mängukirjeldus peab selgitama valitud sihtmärkidega mängimist, mitte väitma, et alati kasutatakse numbreid 15–20 ja Bulli.

## 4. Leg’id, kordusmäng ja ajaloo taastamine

- `nextCricketLeg` peab andma uuele leg’ile eelmise leg’i sihtmärgid edasi koos mängijate sulgemispiiridega.
- Kordusmäng kasutab sama konfiguratsiooni. Tagasivõtmine ja uuesti tegemine säilitavad sihtmärgid, sh leg’i piiri ületades.
- Sündmuste taasesitus kontrollib konkreetse leg’i konfiguratsiooni. Sihtmärke ei tuletata sündmustest ega seadistusvaate hetkeolekust.
- Praegune mäng töötab kliendi mälus; see muudatus ei vaja Prisma skeemi ega migratsiooni.

## 5. Kontrollimine ja vastuvõtutingimused

Lisa sisulised mänguloogika testid olemasolevate [testide](../tests/) kõrvale:

- Vaikimisi valik on täpselt 15–20 ja Bull; ka ilma `targets` väljata mäng toimib seniselt.
- Valik 10–16 ja Bull on lubatud kaheksa sihtmärgiga mäng; üheksas, tühi, korduv või vahemikust väljas sihtmärk on keelatud.
- Valimata sihtmärgile ei saa sündmust salvestada kummaski sisestusrežiimis.
- 10–14 tabamused ja lisapunktid toimivad nii Standardis kui ka Cutthroatis ning erinevate mängijapõhiste sulgemispiiridega.
- Võiduks tuleb sulgeda täpselt valitud sihtmärgid. Kata ühe sihtmärgi mäng, ainult Bull, Bullita valik ja kaheksa sihtmärki; valimata numbrite sulgemist ei nõuta.
- Järgmine leg, kordusmäng, undo/redo ja leg’i piiril tagasivõtmine säilitavad valiku ning tulemuse.

Kontrolli brauseris järgmisi kombinatsioone:

| Mõõde | Kontrollitavad variandid |
| --- | --- |
| Mängijad ja tabel | 2 mängijat mõlema 1v1 paigutusega; 3 ja 6 mängijat |
| Sisestus | Nooled ja märgid |
| Punktiarvestus | Standard ja Cutthroat |
| Valik | Vaikimisi 7; kohandatud 8; ainult üks; Bullita |
| Ekraan | Mobiil ja lauaarvuti |

Kontrolli nuppude valitud/keelatud olekuid, klaviatuuriga kasutamist, valikute loendurit, tabeli ja juhtnuppude kattuvust ning paigutuse mahtumist. Käivita `npm test`, `npm run typecheck` ja `npm run build`.

## Teostamise järjekord

1. Ühine sihtmärkide konfiguratsioon, valideerimine ja mänguloogika testid.
2. Valikunupud seadistusvaates ning valiku edasiandmine matšile ja kordusmängule.
3. Kõigi tabelite, sisestusviiside, kokkuvõtete ja leg’i vahetuse kohandamine.
4. Dünaamiline paigutus, tõlked ja brauserikontrollid koos projekti kontrollkäskudega.
