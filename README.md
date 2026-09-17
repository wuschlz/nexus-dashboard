# NEXUS Dashboard

Eigenständige 3D-Dashboard-Vorschau für NEXUS Office.

## Aktueller Stand

- echtes Three.js/WebGL-Office
- geriggter James
- Neutral Idle / Standard Walk / Waving
- James kann zwischen Schreibtisch und Meetingraum laufen
- Team-, Inspector- und Activity-Shell
- noch kein Backend-Zugriff

## Architektur

```text
Existing NEXUS Backend
  -> READ ONLY Dashboard Projection Layer
  -> Dashboard UI
```

Der bestehende NEXUS-Backend-Code wird von diesem Repository nicht verändert.

## Lokal starten

```bash
python3 -m http.server 8787
```

Dann im Browser öffnen:

```text
http://localhost:8787
```

## Nächste Schritte

- 3D-Assets für Nora, Kevin, Gisela, Lina, Walter, Sarah und Finn
- Read-only Projection Layer anbinden
- Actor-State auf Animationen und Positionen abbilden
- Cases, Tasks, Meetings, Consultations und Handoffs im Inspector darstellen
- Action Flow Requested -> Authorized -> Gateway -> Executed -> Verified visualisieren
