import networkx as nx
import random

def reduce_graph_k_core(G: nx.DiGraph, k: int = 2) -> nx.DiGraph:
    """Estrae il k-core del grafo restituendo una copia indipendente."""
    if k < 0:
        raise ValueError("k deve essere >= 0")
        
    core_numbers = nx.core_number(G)
    max_k = max(core_numbers.values()) if core_numbers else 0
    
    if k > max_k:
        print(f"⚠️ Attenzione: richiesto k={k}, ma il massimo possibile è {max_k}. Il grafo sarà vuoto.")

    return nx.k_core(G, k=k).copy()

def reduce_graph_edge_sampling(G: nx.DiGraph, fraction: float = 0.5) -> nx.DiGraph:
    """Campiona casualmente una percentuale degli archi."""
    all_edges = list(G.edges(data=True))
    num_edges_to_keep = int(len(all_edges) * fraction)
    sampled_edges = random.sample(all_edges, num_edges_to_keep)
    
    G_reduced = G.__class__()
    G_reduced.add_nodes_from(G.nodes(data=True))
    G_reduced.add_edges_from(sampled_edges)
    
    return G_reduced