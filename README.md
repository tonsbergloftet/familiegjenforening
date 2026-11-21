# Familiegjenforeningsveileder

Digital sjekkliste for familier som er gjenforent i Tønsberg kommune. Den finnes på flere språk og viser bare det som gjelder familien, ut fra tre spørsmål.

- **App for familiene:** `veileder.html`
- **Redaktørverktøy:** `redaktor.html`
- **Mottak for teknisk eier:** `mottak.html`
- **Adresse:** https://tonsbergloftet.github.io/familiegjenforening/

Appen er en statisk nettside uten database. Alt innhold ligger i JSON-filer i `data/`.

## Roller

| Rolle | Gjør |
|---|---|
| **Redaktør** (1) | Skriver og endrer norsk tekst i `redaktor.html` og sender endringsfila til teknisk eier. |
| **Teknisk eier** (1) | Legger endringer inn i repoet, kjører KI-oversettelse og laster opp (commit). |
| **Tolker** (flere) | Kontrollerer oversettelser. Er de usikre, tar de kontakt med redaktør. |

## Mapper og filer

```
veileder.html            appen familiene bruker (IKKE endre navnet – QR-koder peker hit)
redaktor.html            redaktørverktøyet
mottak.html              mottak for teknisk eier: kontroll, KI-oversettelse, lagring
index.html               sender videre til veileder.html
data/config.json         språkliste, adresse, lenke til kommunens side
data/struktur.json       spørsmål, faser, punkter og kontakter (rekkefølge, vilkår)
data/sprak/no.json       all norsk tekst (kilden)
data/sprak/xx.json       oversettelser, samme nøkler som no.json
data/sprak/xx.status.json  per tekst: «ki» (maskinoversatt) eller «kontrollert»
data/ui/xx.json          knapper og faste tekster i appen
docs/                    datamodell og skriveveiledning
```

Detaljer finnes i [docs/DATAMODELL.md](docs/DATAMODELL.md). Råd om tekst finnes i [docs/skriveveiledning.md](docs/skriveveiledning.md).

## Dette må aldri endres

- **Filnavnet `veileder.html`.** Flygeblad og QR-koder peker dit.
- **ID-ene til punkter** (f.eks. `police`, `school`). Familienes avkrysninger er lagret på ID. Bytt tittel, aldri ID.
- **Lagringsnøkkelen `fgv_app_v1`** i `config.json`. Endres den, mister alle familier fremdriften sin.

## Slik legger du inn endringer: bruk mottaket

Alt gjøres i nettleseren. Du trenger ikke installere noe.

Åpne **https://tonsbergloftet.github.io/familiegjenforening/mottak.html**. Verktøyet tar deg gjennom fire steg:

1. **Hent siste versjon.** Dette skjer automatisk, rett fra GitHub. Verktøyet kontrollerer filene og viser hvem som lastet opp sist.
2. **Se gjennom endringene.** Slipp inn endringsfila fra redaktøren. Du ser hver tekst før og etter, nye og fjernede punkter og endrede telefonnumre. Har noen andre endret samme tekst i mellomtiden, velger du hvilken versjon som skal gjelde. Her kan du også legge til et nytt språk.
3. **KI-oversett.** For hvert språk kopierer du en ferdig pakke, limer den inn i Copilot, ChatGPT eller Claude og limer svaret tilbake. Verktøyet kontrollerer svaret:
   - at alle tekster er med
   - at teksten har riktig skrift
   - at punktlister og «Dette kan du si» er beholdt
   - at tallene er de samme

   Du kommer ikke videre før alle språk er oversatt.
4. **Last opp.** Du får en zip med mappa `data`, som bare inneholder de endrede filene.
   - Pakk ut zip-fila.
   - Åpne opplastingssiden (https://github.com/tonsbergloftet/familiegjenforening/upload/main) og dra mappa `data` inn.
   - Lim inn den ferdige commit-meldingen og trykk *Commit changes*.
   - Trykk *Kontroller opplastingen* i mottaket. Verktøyet sjekker at filene på GitHub er nøyaktig de det laget.

Mottaket kan også brukes uten endringsfil, for å oversette tekster som mangler.

### Hvis du må gjøre det for hånd

1. Legg de nye tekstene fra endringsfila (`tekster`) inn i `data/sprak/no.json`. `null` betyr at teksten er slettet. Er `struktur` med, erstatter den `data/struktur.json`.
2. KI-oversett de endrede nøklene til alle språk, og sett status `{"s":"ki"}` i `data/sprak/xx.status.json`.
3. Last opp filene på github.com med en beskrivende commit-melding.

**Regel: Ingen norsk tekst lastes opp uten oversettelse.** Familiene ser KI-teksten merket «Maskinoversatt» til en tolk har godkjent den. Da endres status til `{"s":"kontrollert"}`.

## Kommunens side

Flygebladet og de tre viktigste punktene ligger på kommunens nettside, som har en fast og offisiell adresse til QR-koden. Lenken dit legges i `viktigste_side` i `config.json`. Står feltet tomt, vises ikke lenken.

## Hvis noe går galt

- **Appen viser feilmelding om innlasting:** Sannsynligvis en JSON-feil. Lim fila inn på https://jsonlint.com eller se siste commit i GitHub.
- **Angre en endring:** GitHub i nettleseren har ingen angreknapp for vanlige opplastinger. Det enkleste er å la redaktøren rette i redaktørverktøyet og ta det gjennom mottaket på nytt.
  - Haster det med én fil: Åpne fila på GitHub og trykk *History*. Åpne versjonen før feilen og trykk *Raw*. Kopier alt. Gå tilbake til fila, trykk blyanten (*Edit*), lim inn og trykk *Commit changes*.
- **For utviklere:** Appen kan testes lokalt med `python3 -m http.server` i repo-mappa. Den virker ikke ved dobbeltklikk på fila.
