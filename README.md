# 📡 Meshtastic Network Analyst

> Network analysis dashboard for Italian Meshtastic mesh network.


---

## Overview

<!-- TODO: Describe what this project does and why it's useful -->

This project provides a web dashboard for analyzing the topology and performance of the Italian [Meshtastic](https://meshtastic.org/) mesh radio network. It processes raw node/edge data and computes key network science metrics, visualized through an interactive frontend.

---

## Features

- 🗺️ **Interactive Map** — Visualize nodes and links with community detection overlays (Louvain, Leiden)
- 📊 **Network Metrics** — Density, average degree, clustering coefficient, diameter
- 🎯 **Centrality Analysis** — Top nodes by Betweenness Centrality
- 📏 **Distance Distribution** — Shortest path lengths across the network
- 📡 **Node Statistics** — Hardware models, roles, and MQTT gateway breakdownn
- ⚔️ **Robustness / Attack Simulation** — Once a week it simulates Random, Degree, PageRank, and Betweenness-based attacks on the network

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Map | Leaflet / MapLibre |
| Backend (local/CI) | Python + FastAPI |
| Network Analysis | NetworkX, igraph, leidenalg |
| Data Validation | Pydantic |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |

---


## Project Structure

```
meshintel/
├── backend/              # Python backend (FastAPI + NetworkX)
│   ├── analysis/         # Network metrics modules
│   ├── communities/      # Louvain & Leiden detection
│   ├── api/              # FastAPI routes
│   ├── graph/            # Graph builder & reducer
│   └── data/             # Data parser & fetcher
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── store/        # Zustand state management
│   │   └── api/          # API client
│   └── public/data/      # Pre-generated static JSON (CI output)
└── scripts/              # CI data generation scripts
    └── generate_static.py
```

---

## Local Development

### Backend

```bash
cd meshintel
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

API available at `http://localhost:8000` — docs at `http://localhost:8000/docs`

### Frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`


## Deployment

This project is deployed as a **static site** on Cloudflare Pages.

A GitHub Actions workflow runs daily at 02:00 UTC:
1. Fetches fresh Meshtastic network data
2. Runs all analysis scripts locally
3. Saves pre-computed JSON files to `frontend/public/data/`
4. Commits and pushes the updated data
5. Cloudflare Pages automatically rebuilds and deploys

To deploy, simply commit any changes to the repository:
```bash
git add .
git commit -m "Update data"
git push
```

---

## License

<!-- TODO: Choose a license -->
MIT

---

A special thank you to the <a href="https://www.loraitalia.it/">loraitalia</a> community for providing the data.

*Built with ❤️ for the Meshtastic community.*