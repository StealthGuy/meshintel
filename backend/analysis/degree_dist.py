import networkx as nx
from collections import Counter
import numpy as np
from .models import DegreeDistribution

def compute_degree_distribution(G: nx.DiGraph) -> DegreeDistribution:
    """
    Calcola la distribuzione dei gradi (In/Out) e l'assortatività seguendo metrics.py e main.py.
    """
    # 1. Rimuoviamo i nodi isolati per la distribuzione (come in metrics.py)
    G_active = G.copy()
    G_active.remove_nodes_from(list(nx.isolates(G_active)))
    
    if len(G_active) == 0:
        return DegreeDistribution(in_degree={}, out_degree={}, assortativity=0.0)

    # 2. Distribuzione In-Degree
    in_degrees = [deg for node, deg in G_active.in_degree()]
    in_counts = Counter(in_degrees)
    
    # 3. Distribuzione Out-Degree
    out_degrees = [deg for node, deg in G_active.out_degree()]
    out_counts = Counter(out_degrees)
    
    # 4. Assortatività (seguendo main.py: x='out', y='in')
    try:
        assortativity = nx.degree_assortativity_coefficient(G, x='out', y='in')
        if np.isnan(assortativity):
            assortativity = 0.0
    except:
        assortativity = 0.0

    return DegreeDistribution(
        in_degree={int(k): int(v) for k, v in in_counts.items()},
        out_degree={int(k): int(v) for k, v in out_counts.items()},
        assortativity=float(assortativity)
    )