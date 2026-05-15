import networkx as nx
import igraph as ig
import leidenalg as la

def run_leiden(G: nx.Graph, weight: str = None) -> list:
    """
    Esegue l'algoritmo di Leiden convertendo il grafo in igraph, 
    seguendo la logica di communities.py.
    """
    # 1. Conversione in igraph
    # Nota: ig.Graph.from_networkx salva il nome del nodo NX in un attributo '_nx_name' o simile
    g_ig = ig.Graph.from_networkx(G)
    
    # 2. Gestione pesi
    weights_list = None
    if weight and weight in g_ig.edge_attributes():
        weights_list = g_ig.es[weight]

    # 3. Calcolo Partizione
    leiden_partition = la.find_partition(
        g_ig, 
        la.ModularityVertexPartition,
        weights=weights_list
    )
    
    # 4. Riconversione in lista di set (usando i nomi originali dei nodi NetworkX)
    leiden_communities_nx = []
    for community in leiden_partition:
        leiden_communities_nx.append(set(g_ig.vs[node]["_nx_name"] for node in community))
    
    return leiden_communities_nx