import numpy as np
import networkx as nx
from pydantic import BaseModel
from typing import List

class SuggestionNode(BaseModel):
    id: str
    long_name: str
    role: str
    betweenness_centrality: float
    suggested_role: str
    reason: str

class SuggestionsReport(BaseModel):
    threshold: float
    hidden_backbones: List[SuggestionNode]
    under_utilized_routers: List[SuggestionNode]
    total_nodes: int
    mismatched_count: int
    correct_count: int

def annotate_role_suggestions(G: nx.DiGraph):
    """
    Computes betweenness centrality for all nodes and annotates them with suggestions.
    This modifies the graph nodes in-place.
    """
    if len(G) == 0:
        return

    # Calculate betweenness centrality
    betweenness = nx.betweenness_centrality(G)
    bet_values = list(betweenness.values())
    p90_threshold = float(np.percentile(bet_values, 90)) if bet_values else 0.0

    for node_id, data in G.nodes(data=True):
        node_bet = betweenness.get(node_id, 0.0)
        current_role = data.get('role', 'UNKNOWN').upper()

        # Determine suggestion (Top 10% of betweenness is recommended to be ROUTER)
        if node_bet >= p90_threshold:
            suggested_role = "ROUTER"
            reason = f"High topology importance (betweenness: {node_bet:.6f} >= threshold: {p90_threshold:.6f})"
        else:
            suggested_role = "CLIENT"
            reason = f"Low topology importance (betweenness: {node_bet:.6f} < threshold: {p90_threshold:.6f})"

        # A mismatch occurs if:
        # - suggested is ROUTER, but current configuration is NOT router-like
        # - suggested is CLIENT, but current configuration IS router-like
        is_router_like = 'ROUTER' in current_role
        has_mismatch = (suggested_role == "ROUTER" and not is_router_like) or \
                       (suggested_role == "CLIENT" and is_router_like)

        # Annotate node attributes
        data['betweenness_centrality'] = node_bet
        data['suggested_role'] = suggested_role
        data['role_threshold'] = p90_threshold
        data['role_reason'] = reason
        data['role_mismatch'] = has_mismatch
