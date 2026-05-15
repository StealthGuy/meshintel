# 📡 Meshtastic Network Analyst

Benvenuto in **Meshtastic Network Analyst**, una applicazione di analisi dei grafi progettata per monitorare, analizzare e visualizzare la struttura delle reti mesh decentralizzate, in stile **Signal Intelligence (SIGINT)**

---

## 🚀 Funzionalità Principali

* **Community Detection Avanzata**: Identificazione di cluster di nodi tramite gli algoritmi di **Louvain** e **Leiden**, calcolati su un grafo ridotto (*k-core*) per eliminare il rumore.
* **Intelligence Metrics**: Calcolo in tempo reale di metriche strutturali:
    * *Centralità (Betweenness & In-Degree)* per identificare i nodi bridge e gli hub.
    * *Connettività* (LWCC, densità, isole isolate).
    * *Distanze* (diametro e lunghezza media dei cammini).
* **Dashboard Interattiva**: Interfaccia UI/UX moderna (generata con Google Stitch) con supporto per:
    * Cambio dinamico degli algoritmi di clustering.
    * Switch tra mappa Scura e Topografica.
    * Pannello dettagli nodo "Floating" per ispezione rapida.
* **Dual-Storage Fetcher**: Routine di aggiornamento dati che mantiene uno storico datato dei dump e un file master per le API.
* **Validazione Dati**: Parsing dei dati grezzi tramite **Pydantic** per garantire la resilienza a campi mancanti o malformati.

---

## 📂 Struttura del Progetto

```text
meshtastic-na/
├── backend/
│   ├── analysis/       # Moduli per calcoli statistici e metriche
│   ├── api/            # Definizione delle rotte FastAPI
│   ├── cache/          # Dump JSON (nodes/edges) e storico storico
│   ├── communities/    # Implementazione Louvain e Leiden
│   ├── data/           # Parsing Pydantic e Fetcher API LoRa
│   ├── graph/          # Builder NetworkX e logica di riduzione (k-core)
│   ├── main.py         # Entrypoint dell'applicazione
│   └── requirements.txt
├── frontend/
│   └── index.html      # Dashboard integrata (Tailwind + Leaflet)
```

---

## 🛠️ Installazione e Avvio

### 1. Requisiti
* Python 3.10+
* `pip` (Python package manager)

### 2. Setup Ambiente
Clona il progetto e installa le dipendenze:
```bash
python3 -m venv .venv
source .venv/bin/activate  # Su Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 3. Avvio del Server
Lancia l'applicazione dalla cartella principale del progetto:
```bash
python -m uvicorn backend.main:app --reload
```

### 4. Accesso
* **Dashboard**: [http://localhost:8000](http://localhost:8000)
* **Documentazione API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔌 API Endpoints

| Metodo | Endpoint | Descrizione |
| :--- | :--- | :--- |
| `GET` | `/api/report` | Restituisce tutte le metriche di rete (centralità, distanze, etc.) |
| `GET` | `/api/geojson/{algo}` | Restituisce il GeoJSON colorato (algo: raw, louvain, leiden) |
| `POST` | `/api/refresh` | Scarica nuovi dati, archivia lo storico e resetta la cache |

---

## 📈 Roadmap di Sviluppo (Intelligence Features)

* [ ] **Anomaly Detection**: Identificazione automatica di spoofing GPS basata su SNR/Distanza.
* [ ] **Ego Network**: Visualizzazione dei contatti di un singolo nodo fino al 2° grado.
* [ ] **Vulnerability Map**: Evidenziazione dei *Bridges* e *Articulation Points* (nodi critici).
* [ ] **Historical Trends**: Grafici dell'evoluzione temporale della rete tramite database SQLite.

---
*Sviluppato per fini di Network Intelligence e analisi delle reti decentralizzate.*




Apri un terminale nella cartella meshtastic-na/ e scrivi: python -m uvicorn backend.main:app --reload
Apri un SECONDO terminale nella cartella frontend/ e scrivi: npm run dev

