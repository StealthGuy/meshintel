import networkx as nx
from .models import ConnectivityMetrics

def compute_connectivity(G: nx.DiGraph) -> ConnectivityMetrics:
    """
    Calcola le metriche di connettività di base seguendo la logica di metrics.py e main.py.
    """
    n = G.number_of_nodes()
    m = G.number_of_edges()
    
    if n == 0:
        return ConnectivityMetrics(
            nodes=0, edges=0, density=0.0, avg_degree=0.0, avg_clustering=0.0, diameter=0
        )

    # 1. Densità
    density = nx.density(G)
    
    # 2. Grado medio
    avg_degree = m / n
    
    # 3. Clustering Coefficient (su grafo non orientato come in metrics.py)
    avg_clustering = nx.average_clustering(G.to_undirected())
    
    # 4. Diametro (distanza massima tra cammini minimi)
    # Implementazione ispirata a compute_diameter in metrics.py
    cammini_minimi = dict(nx.all_pairs_shortest_path_length(G))
    diameter = 0
    for nodo_origine, destinazioni in cammini_minimi.items():
        if destinazioni:
            distanza_max_locale = max(destinazioni.values())
            if distanza_max_locale > diameter:
                diameter = distanza_max_locale

    return ConnectivityMetrics(
        nodes=n,
        edges=m,
        density=float(density),
        avg_degree=float(avg_degree),
        avg_clustering=float(avg_clustering),
        diameter=int(diameter)
    )