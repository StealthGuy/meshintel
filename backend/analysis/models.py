from pydantic import BaseModel
from typing import List, Dict, Optional

class ConnectivityMetrics(BaseModel):
    nodes: int
    edges: int
    density: float
    avg_degree: float
    avg_clustering: float
    diameter: int

class CentralityNode(BaseModel):
    id: str
    name: str
    value: float

class CentralityReport(BaseModel):
    top_betweenness: List[CentralityNode]

class DegreeDistribution(BaseModel):
    in_degree: Dict[int, int]
    out_degree: Dict[int, int]
    assortativity: float

class DistanceMetrics(BaseModel):
    diameter: int
    avg_path_length: float
    distribution: Dict[int, int]

class NodeStatItem(BaseModel):
    label: str
    count: int

class NodeStatsReport(BaseModel):
    roles: List[NodeStatItem]
    hardware: List[NodeStatItem]
    mqtt: List[NodeStatItem]

class RobustnessItem(BaseModel):
    strategy: str
    nodes_to_50_percent: int
    auc: float

class RobustnessReport(BaseModel):
    plot_base64: str
    best_strategy: str
    summary: List[RobustnessItem]

class NetworkReport(BaseModel):
    connectivity: ConnectivityMetrics
    centrality: CentralityReport
    degree_distribution: DegreeDistribution
    distances: DistanceMetrics
    stats: NodeStatsReport
