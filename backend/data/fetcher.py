import os
import requests
import json
import urllib3
from datetime import datetime

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://api.loraitalia.it/public"
HEADERS = {
    'Origin': 'https://tools.loraitalia.it',
    'Referer': 'https://tools.loraitalia.it/',
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json, text/plain, */*',
}

def fetch_and_save_data():
    """Scarica i dati freschi da LoRa Italia e li salva in backend/cache/"""
    print("--- Inizio aggiornamento dati ---")
    session = requests.Session()
    
    # 1. Recupero Token
    try:
        token_resp = session.get(f"{BASE_URL}/token", headers=HEADERS, verify=False)
        token_resp.raise_for_status()
        token = token_resp.json().get('token')
        if token:
            session.headers.update({'X-Ephemeral-Token': token})
    except Exception as e:
        print(f"Errore token: {e}")
        return False

    # Calcola le directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_dir = os.path.join(base_dir, "cache")
    os.makedirs(cache_dir, exist_ok=True)

    endpoints = {
        "nodes": f"{BASE_URL}/map/get/nodes",
        "edges": f"{BASE_URL}/map/get/edges"
    }

    # Generiamo la stringa della data esattamente come facevi tu
    date_string = datetime.now().strftime("%Y%m%d_%H%M")

    try:
        for name, url in endpoints.items():
            print(f"Scaricando {name}...")
            resp = session.get(url, headers=HEADERS, verify=False)
            resp.raise_for_status()
            data = resp.json()
            
            # --- SALVATAGGIO DOPPIO ---
            
            # 1. Salva la copia storica con la DATA per il tuo archivio
            storico_path = os.path.join(cache_dir, f"{name}_dump_{date_string}.json")
            with open(storico_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                
            # 2. Salva la copia "LATEST" fissa per far funzionare l'API senza intoppi
            latest_path = os.path.join(cache_dir, f"{name}_dump.json")
            with open(latest_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                
        print(f"Dati aggiornati con successo! (Archiviati con data: {date_string})")
        return True
    except Exception as e:
        print(f"Errore download: {e}")
        return False