import networkx as nx
import random
import matplotlib
matplotlib.use('Agg') # Necessario per ambienti server senza GUI
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from typing import List, Dict
from .models import RobustnessReport, RobustnessItem

def get_giant_component(G: nx.Graph) -> nx.Graph:
    """Estrae la Componente Gigante (Giant Component)."""
    if len(G) == 0:
        return G
    if G.is_directed():
        components = list(nx.weakly_connected_components(G))
    else:
        components = list(nx.connected_components(G))
    
    if not components:
        return G
    largest_cc = max(components, key=len)
    return G.subgraph(largest_cc).copy()

def simulate_attack(G: nx.Graph, strategy: str = "random") -> list:
    """Simula un attacco rimuovendo nodi ad ogni iterazione."""
    current_gc = get_giant_component(G).copy()
    N_initial = len(current_gc)
    if N_initial == 0: return []
    
    results = []
    nodes_removed_total = 0
    results.append({"fraction_removed": 0.0, "g_n_ratio": 1.0, "gc_size": N_initial})

    while len(current_gc) > 1:
        if strategy == "random":
            target = random.choice(list(current_gc.nodes()))
            nodes_to_remove = [target]
        elif strategy == "degree":
            degrees = dict(current_gc.degree())
            target = max(degrees, key=degrees.get)
            nodes_to_remove = [target]
        elif strategy == "pagerank":
            try:
                pr = nx.pagerank(current_gc, max_iter=100)
                target = max(pr, key=pr.get)
            except:
                target = random.choice(list(current_gc.nodes()))
            nodes_to_remove = [target]
        elif strategy == "betweenness":
            k_samples = min(100, len(current_gc))
            bw = nx.betweenness_centrality(current_gc, k=k_samples)
            target = max(bw, key=bw.get)
            nodes_to_remove = [target]
        else:
            break

        current_gc.remove_nodes_from(nodes_to_remove)
        nodes_removed_total += len(nodes_to_remove)
        current_gc = get_giant_component(current_gc).copy()
        
        new_gc_size = len(current_gc)
        results.append({
            "fraction_removed": nodes_removed_total / N_initial,
            "g_n_ratio": new_gc_size / N_initial,
            "gc_size": new_gc_size
        })
        if new_gc_size <= 1: break

    return results

def generate_robustness_plot(G: nx.DiGraph) -> RobustnessReport:
    """Genera il grafico di robustezza, calcola metriche di sintesi e restituisce tutto."""
    G_undir = G.to_undirected()
    strategies = ["random", "degree", "pagerank", "betweenness"]
    colors = {"random": "green", "degree": "red", "pagerank": "blue", "betweenness": "orange"}
    
    plt.figure(figsize=(10, 6))
    summary_items = []
    
    for strategy in strategies:
        if strategy == "random":
            all_runs = []
            for _ in range(3): # Ridotto a 3 per velocità
                res = simulate_attack(G_undir, strategy="random")
                all_runs.append(res)
            
            if not all_runs: continue
            
            # Calcolo media per il plot
            max_len = max(len(run) for run in all_runs)
            y_matrix = []
            for run in all_runs:
                y_vals = [step["g_n_ratio"] for step in run]
                y_vals += [0.0] * (max_len - len(y_vals))
                y_matrix.append(y_vals)
            
            y_avg = np.mean(y_matrix, axis=0)
            x_values = np.linspace(0, 1.0, len(y_avg))
            
            # Metriche per il riepilogo
            auc = np.trapezoid(y_avg, x_values)
            nodes_to_50 = 0
            for i, val in enumerate(y_avg):
                if val <= 0.5:
                    nodes_to_50 = int(x_values[i] * len(G_undir))
                    break
            
            summary_items.append(RobustnessItem(
                strategy="Random",
                nodes_to_50_percent=nodes_to_50,
                auc=round(float(auc), 3)
            ))
            plt.plot(x_values, y_avg, label="Random (Avg)", color=colors["random"], linewidth=2)
            
        else:
            res = simulate_attack(G_undir, strategy=strategy)
            if not res: continue
            
            x_values = [step["fraction_removed"] for step in res]
            y_values = [step["g_n_ratio"] for step in res]
            
            auc = np.trapezoids5622012(y_values, x_values)
            nodes_to_50 = 0
            for step in res:
                if step["g_n_ratio"] <= 0.5:
                    nodes_to_50 = int(step["fraction_removed"] * len(G_undir))
                    break
            
            summary_items.append(RobustnessItem(
                strategy=strategy.capitalize(),
                nodes_to_50_percent=nodes_to_50,
                auc=round(float(auc), 3)
            ))
            plt.plot(x_values, y_values, label=strategy.capitalize(), color=colors.get(strategy, "black"), linewidth=2)

    plt.title("Network Robustness: Giant Component Size under Attack")
    plt.xlabel("Fraction of Nodes Removed")
    plt.ylabel("Giant Component Size (G/N)")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Identificazione best strategy (quella con AUC minore)
    best_strategy = min(summary_items, key=lambda x: x.auc).strategy if summary_items else "Unknown"
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    
    return RobustnessReport(
        plot_base64=img_base64,
        best_strategy=best_strategy,
        summary=summary_items
    )
