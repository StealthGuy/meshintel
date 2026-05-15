import networkx as nx
from networkx.algorithms.community import louvain_communities

def run_louvain(G: nx.Graph, resolution: float = 1.0, weight: str = None) -> list:
    """
    Esegue l'algoritmo di Louvain seguendo la logica di communities.py.
    """
    # Se weight è None, l'algoritmo ignora i pesi (unweighted)
    communities = louvain_communities(G, resolution=resolution, weight=weight)
    return list(communities)