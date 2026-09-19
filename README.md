# NEXUS Retro Office 2.2

Struktureller Neustart innerhalb der Retro-Version: echtes modulares Tile-/Sprite-System statt einer monolithischen Canvas-Zeichnung.

## Aufbau

- `map-data.js`: Büro-Layout, Objekte, Kollisionen, Team-Startpunkte
- `sprite-system.js`: wiederverwendbare Möbel-, Raum- und Charakter-Sprites
- `app.js`: Bewegung, Pathfinding, Auswahl und UI
- `styles.css`: responsive Safari-/Desktop-Oberfläche
- `index.html`: schlanke App-Shell

## Darstellung

- 960 × 640 interne Renderauflösung
- weichere Kanten und Anti-Aliasing
- detaillierte Glasbüros, Schreibtische, Monitore, Treppen, Pflanzen, Empfang und Sofas
- alle 8 NEXUS-Charaktere separat konfiguriert
- kein Hintergrundbild
- kein Babylon.js / kein 3D

Das bestehende NEXUS-Backend wird nicht verändert. Die Oberfläche bleibt eine Read-only-Preview.

## Version

Office 2.2 · Cache 220

Die älteren Office-Stände bleiben über die Git-Historie erhalten.
