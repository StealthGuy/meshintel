import networkx as nx
import numpy as np
from .models import DistanceMetrics

def compute_distances(G: nx.DiGraph) -> DistanceMetrics:
    """
    Calcola il diametro, la distanza media e la distribuzione dei cammini minimi.
    """
    if len(G) == 0:
        return DistanceMetrics(diameter=0, avg_path_length=0.0, distribution={})

    # Usiamo il grafo non orientato per il calcolo standard delle distanze (come in metrics_old)
    U = G.to_undirected()
    
    # 1. Calcolo cammini minimi per ogni coppia
    shortest_path_lengths = dict(nx.all_pairs_shortest_path_length(U))
    
    # 2. Diametro (massimo delle eccentricità)
    # nx.eccentricity richiede un grafo connesso o restituisce errore se non lo è.
    # Gestiamo il calcolo manualmente per sicurezza.
    all_dists = []
    for source, targets in shortest_path_lengths.items():
        for target, dist in targets.items():
            if dist > 0: # Escludiamo distanza 0 (da un nodo a se stesso)
                all_dists.append(dist)
    
    if not all_dists:
        return DistanceMetrics(diameter=0, avg_path_length=0.0, distribution={})

    diameter = max(all_dists)
    avg_path = np.mean(all_dists)
    
    # 3. Distribuzione
    # Usiamo numpy unique per contare le frequenze
    unique_vals, counts = np.unique(all_dists, return_counts=True)
    distribution = {int(k): int(v) for k, v in zip(unique_vals, counts)}
    
    return DistanceMetrics(
        diameter=int(diameter),
        avg_path_length=float(avg_path),
        distribution=distribution
    )