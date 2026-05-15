import networkx as nx

def detect_anomalies(G: nx.DiGraph) -> dict:
    """
    Analizza il grafo e classifica le anomalie RF e di Rete.
    Estrae anche i nomi in chiaro per facilitare la lettura nel frontend.
    """
    
    report = {
        "suspect_nodes": set(),
        "impossible_links": []
    }
    
    for u, v, data in G.edges(data=True):
        snr = data.get('snr', -20)
        dist_meters = data.get('distance', 0)
        
        if dist_meters is None:
            continue
            
        dist_km = dist_meters / 1000.0
        
        # Estraiamo i nomi dai metadati salvati nel nodo, con fallback se mancano
        u_short = G.nodes[u].get('short_name', 'N/A')
        u_long = G.nodes[u].get('long_name', 'Unknown')
        v_short = G.nodes[v].get('short_name', 'N/A')
        v_long = G.nodes[v].get('long_name', 'Unknown')

        # CATEGORIA 1: PONTI MQTT (INTERNET)
        if dist_km > 300:
            report["impossible_links"].append({
                "source": u,
                "source_short_name": u_short,
                "source_long_name": u_long,
                "target": v,
                "target_short_name": v_short,
                "target_long_name": v_long,
                "distance": round(dist_km, 2),
                "snr": snr,
                "type": "MQTT_BRIDGE",
                "reason": "Distanza oltre l'orizzonte radio terrestre (MQTT)"
            })
            
        # CATEGORIA 2: GPS SPOOFING (Sospetto)
        elif dist_km > 50 and snr > 5:
            report["impossible_links"].append({
                "source": u,
                "source_short_name": u_short,
                "source_long_name": u_long,
                "target": v,
                "target_short_name": v_short,
                "target_long_name": v_long,
                "distance": round(dist_km, 2),
                "snr": snr,
                "type": "SPOOF_RISK",
                "reason": f"Segnale ({snr}dB) troppo potente per {round(dist_km, 1)}km"
            })
            report["suspect_nodes"].add(u)
            report["suspect_nodes"].add(v)

    report["suspect_nodes"] = list(report["suspect_nodes"])
    report["total_anomalies"] = len(report["impossible_links"])
    
    return report