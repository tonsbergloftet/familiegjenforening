# Familiegjenforeningsveileder

Digital sjekkliste for familier som er gjenforent i Tønsberg kommune. Den finnes på flere språk og viser bare det som gjelder familien, ut fra tre spørsmål.

- **App for familiene:** `veileder.html`
- **Redaktørverktøy:** `redaktor.html`
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

## Testing på egen maskin

Appen henter JSON-filer og virker derfor ikke ved dobbeltklikk på fila. Kjør i stedet:

```
cd familiegjenforening
python3 -m http.server 8000
```

Åpne deretter http://localhost:8000/veileder.html. Legg til `?utkast=1` for å se punkter med status «utkast».

## Slik legger du inn en endring fra redaktør

1. **Hent siste versjon først.** I GitHub Desktop: *Fetch origin* → *Pull*.
2. Redaktøren sender `endringer-ÅÅÅÅ-MM-DD.json`. Den inneholder bare det som er endret:
   - `tekster`: nøkkel → ny norsk tekst (`null` = slettet)
   - `struktur`: ny `struktur.json` hvis punkter, faser eller kontakter er lagt til eller flyttet
3. Legg de nye tekstene inn i `data/sprak/no.json`, og erstatt `data/struktur.json` hvis den er med.
4. **KI-oversett de endrede nøklene** til alle språk (se under).
5. Test lokalt og sjekk at alle språk lastes.
6. Commit med en beskrivende melding, f.eks. `Innhold: nye tekster om bostøtte (redaktør 2026-12-03)`, og trykk *Push*.

Siden oppdateres på GitHub Pages etter 1–2 minutter.

Alternativ: Redaktøren kan også laste ned hele `no.json` og `struktur.json` fra verktøyet (under «For teknisk eier»). Da kan du erstatte filene direkte.

## KI-oversettelse

**Regel: Ingen norsk tekst lastes opp uten oversettelse.** Familiene ser KI-teksten merket «Maskinoversatt» til en tolk har godkjent den.

1. Lim de endrede norske nøklene inn i Claude, ChatGPT eller Copilot med denne instruksen:

   > Oversett verdiene i dette JSON-objektet til [språk]. Behold nøklene uendret. Behold linjeskift, linjer som starter med «– », og teksten innenfor «…» som egne setninger. Ikke oversett telefonnumre, adresser eller navn på etater. Svar bare med JSON.

2. Lim svaret inn i `data/sprak/xx.json`.
3. Sett status for de samme nøklene i `data/sprak/xx.status.json` til `{"s":"ki"}`.
4. Når en tolk har godkjent teksten, endrer du den til `{"s":"kontrollert"}`.

Ved store mengder tekst: Oversett én fase om gangen (ca. 20–30 nøkler). Lange svar blir oftere kuttet eller får feil.

**Sjekk etter KI:**
- Er antall nøkler likt i `no.json` og `xx.json`?
- Er telefonnumre og tall uendret?
- Står teksten i riktig skrift (arabisk, tigrinja osv.)?

## Nytt språk

1. Legg språket til i `data/config.json` under `sprak` med `kode`, `navn` (på eget språk) og `retning` (`ltr` eller `rtl`).
2. KI-oversett hele `no.json` og `ui/no.json` til `sprak/xx.json` og `ui/xx.json`.
3. Lag `sprak/xx.status.json` der alle nøkler har `{"s":"ki"}`.
4. Test og last opp, og be en tolk gå gjennom teksten.

## Kommunens side

Flygebladet og de tre viktigste punktene ligger på kommunens nettside, som har en fast og offisiell adresse til QR-koden. Lenken dit legges i `viktigste_side` i `config.json`. Står feltet tomt, vises ikke lenken.

## Hvis noe går galt

- **Appen viser feilmelding om innlasting:** Sannsynligvis en JSON-feil. Lim fila inn på https://jsonlint.com eller se siste commit i GitHub.
- **Angre en endring:** I GitHub Desktop: *History* → høyreklikk commit → *Revert*.
