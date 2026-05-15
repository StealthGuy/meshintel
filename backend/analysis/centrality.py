import networkx as nx
from .models import CentralityReport, CentralityNode

def compute_centrality(G: nx.DiGraph, top_k: int = 5) -> CentralityReport:
    """
    Calcola la Betweenness Centrality seguendo la logica di main.py.
    """
    if len(G) == 0:
        return CentralityReport(top_betweenness=[])

    # 1. Calcolo Betweenness Centrality
    bc = nx.betweenness_centrality(G)
    
    # 2. Ordinamento e recupero nomi lunghi
    nodi_ordinati = sorted(bc.items(), key=lambda x: x[1], reverse=True)
    nomi_lunghi = nx.get_node_attributes(G, "longName")
    
    top_nodes = []
    for node_id, val in nodi_ordinati[:top_k]:
        top_nodes.append(CentralityNode(
            id=str(node_id),
            name=str(nomi_lunghi.get(node_id, node_id)),
            value=round(float(val), 5)
        ))

    return CentralityReport(top_betweenness=top_nodes)