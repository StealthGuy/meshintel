import json
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- MODELLI SUB-COMPONENTE ---

class Position(BaseModel):
    latitude: float
    longitude: float

class NodeRef(BaseModel):
    id: str

# --- MODELLI PRINCIPALI ---

class NodeModel(BaseModel):
    id: str
    # Definiamo i campi certi per avere l'autocompletamento
    long_name: str = "Unknown"
    short_name: str = "????"
    role: str = "UNKNOWN"
    last_position: Optional[Position] = None
    
    # Questo permette di catturare TUTTI gli altri campi del JSON originale
    class Config:
        extra = "allow"

class EdgeModel(BaseModel):
    node_src: NodeRef
    node_dst: NodeRef
    snr: float = -20.0  # Valore di default se mancante
    distance: Optional[float] = None

# --- FUNZIONI DI PARSING ---

def parse_nodes(filepath: str) -> List[NodeModel]:
    """Legge il dump JSON dei nodi e restituisce una lista di oggetti validati."""
    valid_nodes = []
    with open(filepath, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        for item in raw_data:
            try:
                # Pydantic proverà a validare e convertire i tipi
                node = NodeModel(**item)
                valid_nodes.append(node)
            except Exception:
                # Se un nodo è gravemente malformato (es. manca l'ID), lo scartiamo
                continue
    return valid_nodes

def parse_edges(filepath: str) -> List[EdgeModel]:
    """Legge il dump JSON degli archi e restituisce una lista di oggetti validati."""
    valid_edges = []
    with open(filepath, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        for item in raw_data:
            try:
                edge = EdgeModel(**item)
                # Evitiamo self-loop fin dall'inizio
                if edge.node_src.id != edge.node_dst.id:
                    valid_edges.append(edge)
            except Exception:
                continue
    return valid_edges