# 🌐 Meshtastic Network Analysis

> Real-time network analysis dashboard for Meshtastic mesh networks.

<!-- TODO: Add a screenshot or GIF of the dashboard here -->

---

## Overview

<!-- TODO: Describe what this project does and why it's useful -->

This project provides a web dashboard for analyzing the topology and performance of a [Meshtastic](https://meshtastic.org/) mesh radio network. It processes raw node/edge data and computes key network science metrics, visualized through an interactive frontend.

---

## Features

- 🗺️ **Interactive Map** — Visualize nodes and links with community detection overlays (Louvain, Leiden)
- 📊 **Network Metrics** — Density, average degree, clustering coefficient, diameter
- 🎯 **Centrality Analysis** — Top nodes by Betweenness Centrality
- 📏 **Distance Distribution** — Shortest path lengths across the network
- 📡 **Node Statistics** — Hardware models, roles, and MQTT gateway breakdown
- ⚔️ **Robustness / Attack Simulation** — Simulates Random, Degree, PageRank, and Betweenness-based attacks on the network

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
meshtastic-na/
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
cd meshtastic-na
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

API available at `http://localhost:8000` — docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Deployment

This project is deployed as a **static site** on Cloudflare Pages.

A GitHub Actions workflow runs daily at 02:00 UTC:
1. Fetches fresh Meshtastic network data
2. Runs all analysis scripts locally
3. Saves pre-computed JSON files to `frontend/public/data/`
4. Commits and pushes the updated data
5. Cloudflare Pages automatically rebuilds and deploys

See [deployment_pipeline.md](./.gemini/deployment_pipeline.md) for the full setup guide.

---

## License

<!-- TODO: Choose a license -->
MIT

---

*Built with ❤️ for the Meshtastic community.*
