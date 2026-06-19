import networkx as nx
from .models import CentralityReport, CentralityNode

def compute_centrality(G: nx.DiGraph, top_k: int = 5) -> CentralityReport:
    """
    Calcola o recupera la Betweenness Centrality.
    """
    if len(G) == 0:
        return CentralityReport(top_betweenness=[])

    # 1. Recupero o Calcolo Betweenness Centrality
    first_node = next(iter(G.nodes())) if len(G) > 0 else None
    if first_node and 'betweenness_centrality' in G.nodes[first_node]:
        bc = {node_id: data.get('betweenness_centrality', 0.0) for node_id, data in G.nodes(data=True)}
    else:
        bc = nx.betweenness_centrality(G)
    
    # 2. Ordinamento e recupero nomi lunghi
    nodi_ordinati = sorted(bc.items(), key=lambda x: x[1], reverse=True)
    nomi_lunghi = nx.get_node_attributes(G, "longName")
    
    top_nodes = []
    for node_id, val in nodi_ordinati[:top_k]:
        name_val = nomi_lunghi.get(node_id) or G.nodes[node_id].get('long_name', node_id)
        top_nodes.append(CentralityNode(
            id=str(node_id),
            name=str(name_val),
            value=round(float(val), 5)
        ))

    return CentralityReport(top_betweenness=top_nodes)