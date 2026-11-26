# Datamodell

Struktur og tekst er skilt fra hverandre:

- `struktur.json` sier **hva som finnes, i hvilken rekkefølge og for hvem**.
- `sprak/xx.json` inneholder **teksten**, som en flat liste med nøkkel → tekst.

Alle verktøyene leser dem ved oppstart.

## config.json

```json
{
  "adresse": "https://tonsbergloftet.github.io/familiegjenforening/",
  "github": "tonsbergloftet/familiegjenforening",
  "redaktor": "Navn Navnesen, navn@tonsberg.kommune.no",
  "viktigste_side": "",
  "app": "veileder.html",
  "lagringsnokkel": "fgv_app_v1",
  "sprak": [
    { "kode": "ar", "navn": "العربية", "retning": "rtl", "status": "publisert" }
  ]
}
```

Felter som starter med `_` er forklaringer og blir ikke brukt av appen.

| Felt | Betydning |
|---|---|
| `github` | Repoet (eier/navn). Redaktør, tolk og mottak henter siste versjon herfra. |
| `redaktor` | Navn og e-post til redaktøren. Vises for tolkene. Tom = vises ikke. |
| `viktigste_side` | Lenke til kommunens side med de tre viktigste tingene. Tom = vises ikke. |
| `sprak[].status` | `publisert`, eller `utkast` for et språk som bare vises med `?utkast=1`. |

## struktur.json

Fila har fire lister. **Rekkefølgen i listene er rekkefølgen i appen.**

### sporsmal

```json
{ "id": "barn", "status": "publisert", "svar": ["nei", "ja"] }
```

Det finnes tre spørsmål: `ankommet`, `barn` og `bolig`. Svarene er `ja` eller `nei`.

### faser

```json
{ "id": "key", "status": "publisert", "fremhevet": true }
```

`fremhevet` gir fasen en egen farge. Dette brukes for «Det viktigste først».

### punkter

```json
{
  "id": "housing",
  "fase": "key",
  "status": "publisert",
  "viktig": true,
  "vises_hvis": ["bolig=nei"],
  "lenke": "https://…",
  "kontakter": ["kommunal-bolig", "husbanken"]
}
```

| Felt | Betydning |
|---|---|
| `id` | Fast ID. **Endres aldri**, fordi familienes avkrysninger er lagret på den. |
| `fase` | ID-en til fasen punktet hører til. |
| `status` | `publisert` eller `utkast`. Utkast vises bare med `?utkast=1`. Redaktøren lager ikke lenger utkast, men eldre punkter kan ha det. Da viser redaktøren en knapp for å vise dem. |
| `viktig` | Gir merkelappen «Viktig». |
| `vises_hvis` | Punktet vises bare når **alle** vilkårene stemmer. Mangler feltet, vises punktet for alle. |
| `lenke` | Valgfri lenke til mer informasjon. |
| `kontakter` | ID-er fra kontaktlista. Vises som kontaktkort. |

### kontakter

```json
{ "id": "legekontor", "telefon": "33 29 25 99", "nettside": "https://…" }
```

Navn og beskrivelse står i språkfilene. Telefon og nettside er like på alle språk.

## sprak/xx.json

Fila er en flat liste. Nøklene følger faste mønstre:

| Nøkkel | Eksempel |
|---|---|
| `sporsmal.<id>.tekst` / `.ja` / `.nei` | Spørsmål og svaralternativer |
| `fase.<id>.kort` / `.tittel` / `.undertekst` | Kort navn i tidslinjen, overskrift og ingress |
| `punkt.<id>.tittel` | «Bestill time hos politiet tidlig» |
| `punkt.<id>.naar` | Når og for hvem, f.eks. «Så snart familien har fått svar fra UDI» |
| `punkt.<id>.tekst` | Brødtekst (se formatering under) |
| `kontakt.<id>.navn` / `.info` | Navn og kort beskrivelse |

`no.json` er kilden. Andre språk har de samme nøklene. Mangler en tekst, vises den norske.

### Formatering i `tekst`

- **Tom linje** gir nytt avsnitt.
- **Linje som starter med `– `** blir punktliste.
- **Linje med tekst i «…»** (over 25 tegn) blir en «Dette kan du si»-boks.

## sprak/xx.status.json

```json
{ "punkt.police.tittel": { "s": "ki", "kilde": "c06dd76034" } }
```

| Felt | Betydning |
|---|---|
| `s` | `ki` (maskinoversatt) eller `kontrollert` (godkjent av tolk). |
| `kilde` | Valgfri. De første 10 tegnene av SHA-1 av den norske teksten da oversettelsen ble laget. Kan brukes til å finne oversettelser der den norske teksten har endret seg siden. |

Hvis noen av tekstene i et punkt mangler eller ikke er `kontrollert`, vises «Maskinoversatt» på punktet. Norsk har ingen statusfil.

## ui/xx.json

Faste tekster i appen, som knapper, overskrifter og merkelapper. `ui/no.json` er kilden. `felles.ki_merknad` vises øverst i appen når noe på språket ikke er kontrollert av tolk. Norsk har den bare som kilde for oversettelse. Disse endres sjelden, og redaktøren redigerer dem ikke. Teknisk eier oversetter dem når et nytt språk legges til.

## Lagret i nettleseren

Familienes svar og avkrysninger lagres i `localStorage` under `fgv_app_v1`:

```json
{ "lang": "ar", "svar": { "ankommet": "ja", "barn": "ja", "bolig": "nei" }, "checked": { "police": true } }
```

Eldre versjoner av appen lagret `arrived`/`kids`/`housing`. Disse oversettes automatisk til `svar`.

Redaktørverktøyet lagrer utkast under `fgv_redaktor`. Det er bare lagret i redaktørens nettleser til endringsfila er sendt og lagt inn.

Andre nøkler i nettleseren: `fgv_tolk_<språk>` (tolkens arbeid til det er publisert), `fgv_mottak_venter` (zip som ikke er kontrollert), `fgv_redaktor_intro`, `fgv_tolk_intro` og `fgv_mottak_intro`.

## Endringsfil fra redaktøren

`endringer-ÅÅÅÅ-MM-DD.json`:

```json
{
  "type": "endringer",
  "versjon": 2,
  "laget": "2026-11-23T10:12:00.000Z",
  "grunnlag": "48213:-129833",
  "eldre_utkast": true,
  "tekster": { "punkt.police.tekst": "Ny tekst …", "punkt.gammel.tittel": null },
  "forrige": { "punkt.police.tekst": "Teksten slik den var …" },
  "struktur": { "sporsmal": [], "faser": [], "punkter": [], "kontakter": [] }
}
```

| Felt | Betydning |
|---|---|
| `tekster` | Bare norske tekster som er endret. `null` betyr slettet. |
| `forrige` | Hvordan tekstene så ut da redaktøren lastet ned. Mottaket bruker det til å oppdage at noen andre har endret samme tekst. |
| `grunnlag` | Fingeravtrykk av versjonen redaktøren startet fra. |
| `eldre_utkast` | Bare med når redaktøren fortsatte på et utkast fra en eldre versjon. |
| `struktur` | Hele `struktur.json`. Bare med når faser, punkter eller kontakter er endret, og erstatter da hele fila. |

## Kontrollfil fra tolk

`kontroll-<språk>-ÅÅÅÅ-MM-DD.json`:

```json
{
  "type": "kontroll",
  "versjon": 1,
  "sprak": "ar",
  "laget": "2026-11-23T10:12:00.000Z",
  "grunnlag": "<commit-sha>",
  "tekster": {
    "punkt.police.tittel": { "norsk": "…", "sett": "…", "ny": "…", "godkjent": true },
    "ui.liste.viktig": { "norsk": "…", "sett": "…", "ny": "…", "godkjent": false }
  }
}
```

| Felt | Betydning |
|---|---|
| `norsk` | Den norske teksten tolken så. Er den endret siden, tar mottaket ikke med teksten. |
| `sett` | Oversettelsen tolken så. Er den endret av andre siden, tar mottaket ikke med en godkjenning uten rettelse, og ber om valg ved rettelse. |
| `ny` | Tolkens rettede tekst. Bare med når tolken har endret noe. |
| `godkjent` | Om tolken godkjente teksten. Gir status `kontrollert`. Nøkler som starter med `ui.` får ikke status. |
