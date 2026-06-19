import os
import sys
import numpy as np
import networkx as nx


"""
QUESTO SCRIPT È AI-GENERATO, DA VALIDARE; NON È RILEVANTE PER L'ESAME.
PERMETTE DI TROVARE I NODI CHE DOVREBBERO ESSERE ROUTER MA SONO IMPOSTATI COME CLIENT E VICEVERSA.
--> Prossimamente potrebbe essere utile alla community per capire quali nodi impostare come router
"""

# Add current directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.graph import init_graph_loraitalia

def main():
    # Resolve paths relative to where this script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    
    # Try different paths for nodes and edges dumps
    nodes_path = os.path.join(project_root, 'loraitalia_dump', 'nodes_dump.json')
    edges_path = os.path.join(project_root, 'loraitalia_dump', 'edges_dump.json')
    
    if not os.path.exists(nodes_path):
        # Fallback to local execution dir paths
        nodes_path = 'loraitalia_dump/nodes_dump.json'
        edges_path = 'loraitalia_dump/edges_dump.json'
        
    if not os.path.exists(nodes_path):
        print(f"Error: Could not find nodes dump. Checked paths:\n  - {nodes_path}\n  - loraitalia_dump/nodes_dump.json")
        sys.exit(1)

    print(f"Loading graph using:\nNodes: {nodes_path}\nEdges: {edges_path}")
    G = init_graph_loraitalia(nodes_filename=nodes_path, edges_filename=edges_path)
    
    print("\nCalculating betweenness centrality for all nodes (this takes a moment)...")
    betweenness = nx.betweenness_centrality(G)
    
    # Group nodes by role
    router_nodes = []
    client_nodes = []
    
    for node, data in G.nodes(data=True):
        role = data.get('role', 'UNKNOWN').upper()
        bet_val = betweenness.get(node, 0.0)
        
        if 'ROUTER' in role:
            router_nodes.append(bet_val)
        elif 'CLIENT' in role:
            client_nodes.append(bet_val)
            
    avg_router = np.mean(router_nodes) if router_nodes else 0.0
    avg_client = np.mean(client_nodes) if client_nodes else 0.0
    
    print("\n" + "="*50)
    print("BETWEENNESS CENTRALITY COMPARISON")
    print("="*50)
    print(f"Average Betweenness for ROUTER nodes: {avg_router:.6f} (Count: {len(router_nodes)})")
    print(f"Average Betweenness for CLIENT nodes: {avg_client:.6f} (Count: {len(client_nodes)})")
    
    if avg_router > avg_client:
        ratio = avg_router / avg_client if avg_client > 0 else float('inf')
        print(f" -> Routers have {ratio:.2f}x higher average centrality than clients. As expected.")
    else:
        print(" -> Warning: Routers do not have higher average centrality than clients. Your network configuration is messy.")
        
    # Suggestion Threshold: 90th percentile of betweenness
    bet_values = list(betweenness.values())
    p90_threshold = np.percentile(bet_values, 90)
    print(f"90th Percentile Betweenness Threshold (Top 10% of nodes): {p90_threshold:.6f}")
    
    print("\n" + "="*50)
    print("ROLE MISCONFIGURATION SAMPLES")
    print("="*50)
    
    # 1. Under-utilized Routers (Configured as ROUTER but low betweenness)
    bad_routers = []
    for node, data in G.nodes(data=True):
        role = data.get('role', 'UNKNOWN').upper()
        if 'ROUTER' in role and betweenness[node] < p90_threshold:
            bad_routers.append((node, data.get('longName'), betweenness[node]))
            
    bad_routers.sort(key=lambda x: x[2])
    print(f"\nTop 5 configured ROUTERs with very low betweenness (should probably be CLIENTs):")
    for node, name, bet in bad_routers[:5]:
        print(f" - {name} ({node}): betweenness = {bet:.6f}")
        
    # 2. Hidden Backbone Clients (Configured as CLIENT but high betweenness)
    hidden_backbones = []
    for node, data in G.nodes(data=True):
        role = data.get('role', 'UNKNOWN').upper()
        if 'CLIENT' in role and betweenness[node] >= p90_threshold:
            hidden_backbones.append((node, data.get('longName'), betweenness[node]))
            
    hidden_backbones.sort(key=lambda x: x[2], reverse=True)
    print(f"\nTop 5 configured CLIENTs with high betweenness (strong candidates for ROUTER):")
    for node, name, bet in hidden_backbones[:5]:
        print(f" - {name} ({node}): betweenness = {bet:.6f}")


def suggest_op_mode(node_id, G, betweenness_dict, threshold=None):
    """
    Given a node ID, suggests whether it should be a CLIENT or a ROUTER.
    
    If a node is poorly connected or not in the network, we suggest CLIENT (safe default).
    If its betweenness centrality is high (>= threshold), we suggest ROUTER.
    """
    if node_id not in G:
        return "CLIENT (Node not found in graph - safe default)"
        
    # If no threshold is provided, use the 90th percentile of all nodes
    if threshold is None:
        bet_values = list(betweenness_dict.values())
        threshold = np.percentile(bet_values, 90)
        
    node_bet = betweenness_dict.get(node_id, 0.0)
    node_data = G.nodes[node_id]
    current_role = node_data.get('role', 'UNKNOWN')
    name = node_data.get('longName', 'Unknown')
    
    if node_bet >= threshold:
        suggestion = "ROUTER"
        reason = f"high topology importance (betweenness: {node_bet:.6f} >= threshold: {threshold:.6f})"
    else:
        suggestion = "CLIENT"
        reason = f"low topology importance (betweenness: {node_bet:.6f} < threshold: {threshold:.6f})"
        
    return {
        "node_id": node_id,
        "name": name,
        "current_role": current_role,
        "suggested_role": suggestion,
        "betweenness": node_bet,
        "threshold": threshold,
        "reason": reason
    }

if __name__ == "__main__":
    main()
