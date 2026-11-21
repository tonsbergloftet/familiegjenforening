# Datamodell

Struktur og tekst er skilt fra hverandre:

- `struktur.json` sier **hva som finnes, i hvilken rekkefølge og for hvem**.
- `sprak/xx.json` inneholder **teksten**, som en flat liste med nøkkel → tekst.

Begge leses av `veileder.html` og `redaktor.html` ved oppstart.

## config.json

```json
{
  "adresse": "https://tonsbergloftet.github.io/familiegjenforening/",
  "viktigste_side": "",
  "app": "veileder.html",
  "lagringsnokkel": "fgv_app_v1",
  "sprak": [
    { "kode": "ar", "navn": "العربية", "retning": "rtl", "status": "publisert" }
  ]
}
```

Felter som starter med `_` er forklaringer og blir ikke brukt av appen.

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
| `status` | `publisert` eller `utkast`. Utkast vises bare med `?utkast=1`. |
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

Faste tekster i appen, som knapper, overskrifter og merkelapper. Disse endres sjelden, og redaktøren redigerer dem ikke. Teknisk eier oversetter dem når et nytt språk legges til.

## Lagret i nettleseren

Familienes svar og avkrysninger lagres i `localStorage` under `fgv_app_v1`:

```json
{ "lang": "ar", "svar": { "ankommet": "ja", "barn": "ja", "bolig": "nei" }, "checked": { "police": true } }
```

Eldre versjoner av appen lagret `arrived`/`kids`/`housing`. Disse oversettes automatisk til `svar`.

Redaktørverktøyet lagrer utkast under `fgv_redaktor`. Det er bare lagret i redaktørens nettleser til endringsfila er sendt og lagt inn.
