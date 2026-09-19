# NEXUS Retro Office 2.13

Scene System Prototype: Hauptbüro ↔ Meetingraum.

## Änderungen

- echtes Scene-System mit getrennten Räumen eingeführt
- obere mittlere Tür im Hauptbüro führt jetzt in einen eigenen Meetingraum
- ausgewählter Mitarbeiter läuft beim Antippen der Tür automatisch bis zum Eingang
- Tür öffnet sich animiert als zweiflügelige moderne Glasschiebetür
- Mitarbeiter läuft sichtbar durch die geöffnete Tür
- kurzer weicher Scene-Fade beim Raumwechsel
- Ansicht folgt dem Mitarbeiter automatisch in den Meetingraum
- Ziel-Tür ist beim Ankommen bereits offen und schließt anschließend animiert
- Rückweg funktioniert über die untere Tür im Meetingraum nach demselben Prinzip
- jeder der acht Mitarbeiter kann den Raumwechsel benutzen
- Mitarbeiter behalten ihren aktuellen Raumzustand; nur Personen der aktuellen Scene werden gerendert
- getrenntes Pathfinding und getrennte Kollisionskarten pro Scene
- Hauptbüro und vorhandene Steuerung bleiben erhalten

## Meetingraum

- eigener moderner 3:4-Raum statt Overlay
- großer NEXUS-Präsentationsscreen mit dezenter Animation
- langer Premium-Konferenztisch mit zwölf Stühlen
- integrierte Collaboration-Leiste, Lade-/Mikrofon-Pods und Tischdetails
- Sideboard mit Akustikholz und NEXUS-Display
- großes Agenda-Whiteboard mit Diagrammen und Sticky Notes
- separate Kaffee-/Getränkestation
- akustischer Teppich-Inlay, großformatiger Mineralboden, Wandlicht und Cyan-Lichtlinien
- Pflanzen und moderne Glas-/Metall-Türdetails

## Test

1. Im Hauptbüro einen Mitarbeiter antippen.
2. Oben die mittlere **MEETING ROOM**-Tür antippen.
3. Mitarbeiter läuft hin, Tür öffnet sich und die Scene wechselt.
4. Im Meetingraum frei herumlaufen.
5. Unten die **EXIT**-Tür antippen, um zurückzukehren.

## Version

Office 2.13 · Cache 330
