import os
import json
from fastapi import APIRouter, HTTPException
import networkx as nx

from backend.data.parser import parse_nodes, parse_edges
from backend.graph.builder import build_graph
from backend.graph.reducer import reduce_graph_k_core
from backend.communities.louvain import run_louvain
from backend.communities.leiden import run_leiden
from backend.exporters.geojson import to_geojson
from backend.data.fetcher import fetch_and_save_data

from backend.analysis.connectivity import compute_connectivity
from backend.analysis.centrality import compute_centrality
from backend.analysis.distances import compute_distances
from backend.analysis.degree_dist import compute_degree_distribution
from backend.analysis.stats import compute_node_stats
from backend.analysis.robustness import generate_robustness_plot


from backend.analysis.models import NetworkReport, RobustnessReport

router = APIRouter()

# --- CONFIGURAZIONE PERCORSI ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(BASE_DIR, "cache")
ROBUSTNESS_CACHE_FILE = os.path.join(CACHE_DIR, "robustness_cache.json")

# Assicuriamoci che la cartella cache esista
os.makedirs(CACHE_DIR, exist_ok=True)

# --- GESTIONE STATO IN MEMORIA ---
APP_STATE = {
    "graph_orig": None,
    "graph_kcore": None,
    "report_cache": None,
    "communities_cache": {}
}

def load_graphs_if_needed(use_k_core: int = 2):
    """Costruisce i grafi e li salva in memoria."""
    if APP_STATE["graph_orig"] is None:
        nodes_path = os.path.join(CACHE_DIR, "nodes_dump.json")
        edges_path = os.path.join(CACHE_DIR, "edges_dump.json")
        
        print("Inizio costruzione grafo...")
        nodes = parse_nodes(nodes_path)
        edges = parse_edges(edges_path)
        APP_STATE["graph_orig"] = build_graph(nodes, edges)
        APP_STATE["graph_kcore"] = reduce_graph_k_core(APP_STATE["graph_orig"], k=use_k_core)
        print(f"Grafo completato: {len(APP_STATE['graph_orig'])} nodi.")

# --- ENDPOINTS ---

@router.get("/report", response_model=NetworkReport)
def get_network_report():
    if APP_STATE["report_cache"] is not None:
        return APP_STATE["report_cache"]
        
    load_graphs_if_needed()
    G = APP_STATE["graph_orig"]
    
    report = {
        "connectivity": compute_connectivity(G),
        "centrality": compute_centrality(G),
        "distances": compute_distances(G),
        "degree_distribution": compute_degree_distribution(G),
        "stats": compute_node_stats()
    }
    
    APP_STATE["report_cache"] = report
    return report

@router.get("/geojson/{algorithm}")
def get_network_geojson(algorithm: str):
    if algorithm not in ["louvain", "leiden", "raw"]:
        raise HTTPException(status_code=400, detail="Algoritmo non supportato.")
    
    load_graphs_if_needed()
    
    if algorithm not in APP_STATE["communities_cache"]:
        if algorithm == "louvain":
            G = APP_STATE["graph_kcore"]
            communities = run_louvain(G, weight=None)
        elif algorithm == "leiden":
            G = APP_STATE["graph_kcore"]
            communities = run_leiden(G, weight=None)
        else:
            G = APP_STATE["graph_orig"]
            communities = [set(G.nodes())]
            
        APP_STATE["communities_cache"][algorithm] = to_geojson(G, communities)
        
    return APP_STATE["communities_cache"][algorithm]

@router.get("/robustness", response_model=RobustnessReport)
def get_robustness_analysis():
    """Restituisce l'analisi di robustezza usando una cache su file."""
    # 1. Controlla se esiste la cache su file
    if os.path.exists(ROBUSTNESS_CACHE_FILE):
        try:
            with open(ROBUSTNESS_CACHE_FILE, "r") as f:
                cached_data = json.load(f)
                return RobustnessReport(**cached_data)
        except Exception as e:
            print(f"Errore lettura cache robustezza: {e}")

    # 2. Se non c'è cache, calcola
    load_graphs_if_needed()
    G = APP_STATE["graph_orig"]
    report = generate_robustness_plot(G)
    
    # 3. Salva su file per la prossima volta
    try:
        with open(ROBUSTNESS_CACHE_FILE, "w") as f:
            json.dump(report.dict(), f)
    except Exception as e:
        print(f"Errore salvataggio cache robustezza: {e}")
        
    return report


@router.get("/nodes/{node_id}")
def get_node_details(node_id: str):
    load_graphs_if_needed()
    G = APP_STATE["graph_orig"]
    if node_id not in G:
        raise HTTPException(status_code=404, detail=f"Nodo {node_id} non trovato.")
    return G.nodes[node_id]

@router.post("/refresh")
def refresh_network_data():
    """Aggiorna i dati e svuota tutte le cache (memoria e file)."""
    success = fetch_and_save_data()
    if not success:
        raise HTTPException(status_code=500, detail="Errore nel download dei dati.")
    
    # Reset cache in memoria
    APP_STATE["graph_orig"] = None
    APP_STATE["graph_kcore"] = None
    APP_STATE["report_cache"] = None
    APP_STATE["communities_cache"] = {}
    
    # Rimuovi cache su file della robustezza
    if os.path.exists(ROBUSTNESS_CACHE_FILE):
        os.remove(ROBUSTNESS_CACHE_FILE)
    
    load_graphs_if_needed()
    return {"status": "success", "message": "Dati e cache aggiornati."}