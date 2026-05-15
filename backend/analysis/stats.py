import json
import os
from collections import Counter
from typing import List
from .models import NodeStatsReport, NodeStatItem

def get_nodes_path():
    """Recupera il percorso del file nodes_dump.json nella cache del backend."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "cache", "nodes_dump.json")

def compute_node_stats() -> NodeStatsReport:
    """
    Calcola le statistiche dei nodi leggendo direttamente dal file JSON,
    seguendo esattamente la logica di stats.py in tmp_metrics.
    """
    nodes_filename = get_nodes_path()
    
    try:
        if not os.path.exists(nodes_filename):
            return NodeStatsReport(roles=[], hardware=[], mqtt=[])

        with open(nodes_filename, 'r', encoding='utf-8') as f:
            nodes_data = json.load(f)
            
        # 1. Ruoli
        ruoli = [nodo.get('role', 'Sconosciuto') for nodo in nodes_data]
        conteggio_ruoli = Counter(ruoli)
        roles_list = [
            NodeStatItem(label=str(k), count=int(v)) 
            for k, v in sorted(conteggio_ruoli.items(), key=lambda item: item[1], reverse=True)
        ]
        
        # 2. Hardware
        hws = [nodo.get('hardware', 'Sconosciuto') for nodo in nodes_data]
        conteggio_hws = Counter(hws)
        hw_list = [
            NodeStatItem(label=str(k), count=int(v)) 
            for k, v in sorted(conteggio_hws.items(), key=lambda item: item[1], reverse=True)
        ]
        
        # 3. MQTT
        mqtts = [str(nodo.get('has_mqtt', 'Sconosciuto')) for nodo in nodes_data]
        conteggio_mqtt = Counter(mqtts)
        mqtt_list = [
            NodeStatItem(label=str(k), count=int(v)) 
            for k, v in sorted(conteggio_mqtt.items(), key=lambda item: item[1], reverse=True)
        ]
        
        return NodeStatsReport(
            roles=roles_list,
            hardware=hw_list,
            mqtt=mqtt_list
        )
        
    except Exception as e:
        print(f"Errore nel calcolo delle statistiche: {e}")
        return NodeStatsReport(roles=[], hardware=[], mqtt=[])
