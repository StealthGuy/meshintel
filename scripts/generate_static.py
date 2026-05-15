import sys
import os
import json
from datetime import datetime

# Aggiungiamo la root del progetto al path così i moduli backend sono importabili
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data.fetcher import fetch_and_save_data
from backend.data.parser import parse_nodes, parse_edges
from backend.graph.builder import build_graph
from backend.graph.reducer import reduce_graph_k_core
from backend.communities.louvain import run_louvain
from backend.communities.leiden import run_leiden
from backend.exporters.geojson import to_geojson
from backend.analysis.connectivity import compute_connectivity
from backend.analysis.centrality import compute_centrality
from backend.analysis.distances import compute_distances
from backend.analysis.degree_dist import compute_degree_distribution
from backend.analysis.stats import compute_node_stats
from backend.analysis.robustness import generate_robustness_plot

# --- CONFIGURAZIONE PERCORSI ---
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT_DIR, "backend", "cache")
OUTPUT_DIR = os.path.join(ROOT_DIR, "frontend", "public", "data")
ROBUSTNESS_OUTPUT = os.path.join(OUTPUT_DIR, "robustness.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def to_serializable(obj):
    """Converte oggetti Pydantic o dict in formato JSON serializzabile."""
    if hasattr(obj, 'model_dump'):
        return obj.model_dump()
    if hasattr(obj, 'dict'):
        return obj.dict()
    if isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_serializable(i) for i in obj]
    return obj

def is_monday():
    return datetime.now().weekday() == 0  # 0 = Lunedì

def main():
    print("=" * 50)
    print("MeshIntel — Static Data Generator")
    print(f"Avviato: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    # --- STEP 1: Scarica i dati freschi ---
    print("\n[1/4] Download dati da api.loraitalia.it...")
    success = fetch_and_save_data()
    if not success:
        print("ERRORE: impossibile scaricare i dati. Aborting.")
        sys.exit(1)

    # --- STEP 2: Costruzione del grafo ---
    print("\n[2/4] Costruzione del grafo...")
    nodes_path = os.path.join(CACHE_DIR, "nodes_dump.json")
    edges_path = os.path.join(CACHE_DIR, "edges_dump.json")
    nodes = parse_nodes(nodes_path)
    edges = parse_edges(edges_path)
    G = build_graph(nodes, edges)
    G_kcore = reduce_graph_k_core(G, k=2)
    print(f"Grafo: {len(G)} nodi, {G.number_of_edges()} archi")

    # --- STEP 3: Calcolo metriche ---
    print("\n[3/4] Calcolo metriche di rete...")

    report = {
        "connectivity": to_serializable(compute_connectivity(G)),
        "centrality": to_serializable(compute_centrality(G)),
        "distances": to_serializable(compute_distances(G)),
        "degree_distribution": to_serializable(compute_degree_distribution(G)),
        "stats": to_serializable(compute_node_stats()),
        "generated_at": datetime.now().isoformat()
    }
    with open(os.path.join(OUTPUT_DIR, "report.json"), "w") as f:
        json.dump(report, f)
    print("  ✓ report.json")

    # --- STEP 4: GeoJSON community ---
    print("\n[4/4] Generazione GeoJSON...")

    # Raw
    geojson_raw = to_geojson(G, [set(G.nodes())])
    with open(os.path.join(OUTPUT_DIR, "geojson_raw.json"), "w") as f:
        json.dump(geojson_raw, f)
    print("  ✓ geojson_raw.json")

    # Louvain
    communities_louvain = run_louvain(G_kcore, weight=None)
    geojson_louvain = to_geojson(G_kcore, communities_louvain)
    with open(os.path.join(OUTPUT_DIR, "geojson_louvain.json"), "w") as f:
        json.dump(geojson_louvain, f)
    print("  ✓ geojson_louvain.json")

    # Leiden
    communities_leiden = run_leiden(G_kcore, weight=None)
    geojson_leiden = to_geojson(G_kcore, communities_leiden)
    with open(os.path.join(OUTPUT_DIR, "geojson_leiden.json"), "w") as f:
        json.dump(geojson_leiden, f)
    print("  ✓ geojson_leiden.json")

    # --- STEP 5: Robustezza (solo il lunedì o se non esiste) ---
    should_compute_robustness = is_monday() or not os.path.exists(ROBUSTNESS_OUTPUT)
    if should_compute_robustness:
        reason = "è lunedì" if is_monday() else "file non trovato"
        print(f"\n[5/5] Calcolo robustezza ({reason})...")
        robustness = generate_robustness_plot(G)
        with open(ROBUSTNESS_OUTPUT, "w") as f:
            json.dump(to_serializable(robustness), f)
        print("  ✓ robustness.json")
    else:
        print("\n[5/5] Robustezza: skip (non è lunedì, file già esistente)")

    print("\n" + "=" * 50)
    print("Generazione completata con successo!")
    print(f"Output in: {OUTPUT_DIR}")
    print("=" * 50)

if __name__ == "__main__":
    main()
