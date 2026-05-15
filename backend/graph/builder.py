import networkx as nx
from typing import List
from backend.data.parser import NodeModel, EdgeModel

def build_graph(nodes: List[NodeModel], edges: List[EdgeModel]) -> nx.DiGraph:
    """Costruisce un grafo orientato dai modelli validati."""
    G = nx.DiGraph()
    print("Inizio costruzione grafo...")

    # Aggiunta Nodi
    for node in nodes:
        # Convertiamo il modello Pydantic in dizionario completo
        node_data = node.model_dump() 
        
        # Estraiamo la posizione per NetworkX (fondamentale per la mappa)
        pos = (node.last_position.longitude, node.last_position.latitude) if node.last_position else None
        
        # Aggiungiamo il nodo passando TUTTO il dizionario node_data come attributi
        G.add_node(node.id, pos=pos, **node_data)

    # Aggiunta Archi
    for edge in edges:
        src_id = edge.node_src.id
        dst_id = edge.node_dst.id
        
        # Ci assicuriamo che entrambi i nodi esistano nel grafo
        if src_id in G and dst_id in G:
            # Calcoliamo subito il peso lineare dall'SNR per Louvain/Leiden
            weight_snr_linear = 10 ** (edge.snr / 10.0)
            
            G.add_edge(
                src_id, 
                dst_id, 
                snr=edge.snr,
                distance=edge.distance,
                weight_snr_linear=weight_snr_linear
            )

    print(f"Grafo completato: {G.number_of_nodes()} nodi e {G.number_of_edges()} archi.")
    return G