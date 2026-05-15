import networkx as nx
import random
import matplotlib.pyplot as plt

def get_giant_component(G: nx.Graph) -> nx.Graph:
    """
    Estrae la Componente Gigante (Giant Component) dal grafo.
    Se il grafo è diretto, usa la Weakly Connected Component.
    """
    if len(G) == 0:
        return G
        
    if G.is_directed():
        largest_cc = max(nx.weakly_connected_components(G), key=len)
    else:
        largest_cc = max(nx.connected_components(G), key=len)
        
    return G.subgraph(largest_cc).copy()

def simulate_attack(G: nx.Graph, strategy: str = "random", batch_fraction: float = 0.01) -> list[dict]:
    """
    Simula un attacco rimuovendo nodi e isolando ogni volta la nuova Componente Gigante.
    
    :param G: Il grafo di partenza (verrà fatta una copia interna)
    :param strategy: 'random', 'degree', 'pagerank', o 'betweenness'
    :param batch_fraction: Percentuale di nodi da rimuovere ad ogni iterazione (es. 0.01 = 1%)
    :return: Lista di dizionari con i risultati per ogni step
    """
    print(f"[*] Avvio simulazione attacco: {strategy.upper()} (Batch: {batch_fraction*100}%)")
    
    # Lavoriamo su una copia per non modificare il grafo originale dell'app
    current_gc = get_giant_component(G).copy()
    N_initial = len(current_gc)
    
    # Calcoliamo quanti nodi rimuovere per ogni step (es. 1% di N_initial)
    batch_size = max(1, int(N_initial * batch_fraction))
    
    results = []
    nodes_removed_total = 0
    
    # Stato iniziale (0 nodi rimossi)
    results.append({
        "nodes_removed": 0,
        "fraction_removed": 0.0,
        "gc_size": N_initial,
        "g_n_ratio": 1.0 # G/N come richiesto dall'assignment
    })

    while len(current_gc) > 0:
        nodes_to_remove = []
        current_size = len(current_gc)
        
        # Assicuriamoci di non cercare di rimuovere più nodi di quanti ne restano
        actual_batch_size = min(batch_size, current_size)

        # 1. Identificazione dei nodi target in base alla strategia
        if strategy == "random":
            nodes_to_remove = random.sample(list(current_gc.nodes()), actual_batch_size)
            
        elif strategy == "degree":
            # Calcoliamo In-Degree + Out-Degree se diretto, altrimenti Degree normale
            degrees = dict(current_gc.degree()) 
            sorted_nodes = sorted(degrees, key=degrees.get, reverse=True)
            nodes_to_remove = sorted_nodes[:actual_batch_size]
            
        elif strategy == "pagerank":
            pr = nx.pagerank(current_gc)
            sorted_nodes = sorted(pr, key=pr.get, reverse=True)
            nodes_to_remove = sorted_nodes[:actual_batch_size]
            
        elif strategy == "betweenness":
            bw = nx.betweenness_centrality(current_gc)
            sorted_nodes = sorted(bw, key=bw.get, reverse=True)
            nodes_to_remove = sorted_nodes[:actual_batch_size]
            
        else:
            raise ValueError(f"Strategia sconosciuta: {strategy}")

        # 2. Rimozione dei nodi
        current_gc.remove_nodes_from(nodes_to_remove)
        nodes_removed_total += actual_batch_size

        # 3. Come da consegna: "forget the others and repeat the same operations"
        # Estraiamo la nuova componente gigante scartando i cluster isolati
        current_gc = get_giant_component(current_gc).copy()
        
        new_gc_size = len(current_gc)
        
        # 4. Registrazione metriche
        results.append({
            "nodes_removed": nodes_removed_total,
            "fraction_removed": nodes_removed_total / N_initial,
            "gc_size": new_gc_size,
            "g_n_ratio": new_gc_size / N_initial
        })
        
        # Condizione di uscita anticipata (se il grafo si è polverizzato)
        if new_gc_size <= 1:
            break

    return results

def plot_robustness(G: nx.Graph, strategies: list[str] = None, batch_fraction: float = 0.05):
    """
    Esegue simulazioni multiple e genera il plot richiesto dall'assignment.
    """
    if strategies is None:
        strategies = ["random", "degree", "pagerank", "betweenness"]
        
    plt.figure(figsize=(10, 6))
    
    colors = {"random": "green", "degree": "red", "pagerank": "blue", "betweenness": "orange"}
    
    for strategy in strategies:
        results = simulate_attack(G, strategy=strategy, batch_fraction=batch_fraction)
        
        # Estraiamo le assi X e Y per il plot
        x_values = [res["fraction_removed"] for res in results]
        y_values = [res["g_n_ratio"] for res in results]
        
        plt.plot(x_values, y_values, label=strategy.capitalize(), color=colors.get(strategy, "black"), linewidth=2, marker='o', markersize=4)

    plt.title("Network Robustness: Giant Component Size under Attack")
    plt.xlabel("Fraction of Nodes Removed")
    plt.ylabel("Giant Component Size (G/N)")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Salva il grafico invece di bloccare il server mostrandolo a schermo
    plt.savefig("robustness_plot.png")
    print("[*] Plot salvato come 'robustness_plot.png'")