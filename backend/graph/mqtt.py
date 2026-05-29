import networkx as nx
from typing import List, Optional
from backend.data.parser import NodeModel, EdgeModel
from backend.graph.builder import build_graph

def add_mqtt_broker_to_graph(G: nx.DiGraph) -> nx.DiGraph:
    """
    Prende un grafo orientato NetworkX esistente (G), ne crea una copia,
    aggiunge un nodo virtuale chiamato "MQTT_BROKER" e crea archi bidirezionali
    tra "MQTT_BROKER" e tutti i nodi nel grafo che hanno l'attributo 'has_mqtt' pari a 1 (o True).
    """
    G_mqtt = G.copy()
    
    # Aggiunge il nodo "MQTT_BROKER" se non è già presente
    if "MQTT_BROKER" not in G_mqtt:
        G_mqtt.add_node(
            "MQTT_BROKER", 
            id="MQTT_BROKER",
            long_name="MQTT Broker Virtuale",
            longName="MQTT Broker Virtuale",
            short_name="MQTT",
            role="BROKER",
            has_mqtt=1,
            pos=None  # Nodo virtuale senza posizione geografica
        )
    
    # Collega ogni nodo che ha has_mqtt == 1 al broker MQTT
    for node_id, data in G_mqtt.nodes(data=True):
        if node_id == "MQTT_BROKER":
            continue
        
        # Consideriamo vari formati possibili per l'attributo has_mqtt (int, bool, str)
        has_mqtt_val = data.get("has_mqtt")
        if has_mqtt_val in (1, True, "1", "true"):
            # Aggiungiamo un arco bidirezionale (in entrata e in uscita)
            G_mqtt.add_edge(node_id, "MQTT_BROKER", type="mqtt", weight_snr_linear=1.0)
            G_mqtt.add_edge("MQTT_BROKER", node_id, type="mqtt", weight_snr_linear=1.0)
            
    return G_mqtt

def build_mqtt_graph(nodes: List[NodeModel], edges: Optional[List[EdgeModel]] = None) -> nx.DiGraph:
    """
    Costruisce un grafo orientato NetworkX da zero a partire da una lista di nodi
    e archi RF opzionali, e collega tutti i nodi aventi has_mqtt == 1 al nodo "MQTT_BROKER".
    """
    if edges is None:
        edges = []
    G_rf = build_graph(nodes, edges)
    return add_mqtt_broker_to_graph(G_rf)
