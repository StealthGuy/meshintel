import colorsys
import networkx as nx

def generate_distinct_colors(n: int) -> list[str]:
    """Genera n colori esadecimali distinti."""
    colors = []
    for i in range(n):
        hue = i / n
        rgb = colorsys.hls_to_rgb(hue, 0.5, 0.8)
        colors.append('#%02x%02x%02x' % (int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255)))
    return colors

def to_geojson(G: nx.DiGraph, communities: list[set]) -> dict:
    """Converte Grafo e Comunità in una FeatureCollection GeoJSON."""
    features = []
    
    node_to_community = {}
    for comm_id, nodes_in_comm in enumerate(communities):
        for node in nodes_in_comm:
            node_to_community[node] = comm_id
            
    num_communities = len(communities)
    community_colors = generate_distinct_colors(num_communities)

    for node_id, data in G.nodes(data=True):
        if data.get('pos'):
            comm_id = node_to_community.get(node_id, -1)
            node_color = community_colors[comm_id] if comm_id != -1 else "#808080"
            
            # Creiamo le proprietà partendo da TUTTI i dati presenti nel nodo nx
            properties = data.copy()
            
            # Rimuoviamo 'pos' dalle proprietà perché è già nella 'geometry'
            if 'pos' in properties: del properties['pos']
            
            # Aggiungiamo i dati calcolati (comunità e colore)
            properties.update({
                "community_id": comm_id,
                "color": node_color,
                "type": "node"
            })

            features.append({
                "type": "Feature",
                "id": node_id,
                "geometry": {
                    "type": "Point",
                    "coordinates": [data['pos'][0], data['pos'][1]] 
                },
                "properties": properties # Ora contiene TUTTI i metadati
            })

    # Archi
    for u, v, data in G.edges(data=True): # Aggiungiamo data=True qui
        pos_u = G.nodes[u].get('pos')
        pos_v = G.nodes[v].get('pos')
        
        if pos_u and pos_v:
            # Copiamo TUTTI i dati dell'arco (compresa la distanza in metri!)
            edge_properties = data.copy()
            edge_properties.update({
                "source": u,
                "target": v,
                "type": "link"
            })
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [pos_u[0], pos_u[1]],
                        [pos_v[0], pos_v[1]]
                    ]
                },
                "properties": edge_properties # Ora la distanza viaggia verso il frontend!
            })

    # Restituiamo il dizionario, non salviamo nulla!
    return {
        "type": "FeatureCollection",
        "features": features
    }