import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { networkApi } from '../../api/networkApi';

type FeatureProperties = {
  type?: string;
  id?: string;
  long_name?: string;
  short_name?: string;
  role?: string;
};
type GeoFeature = { id?: string | number; properties: FeatureProperties };
type NetworkFeatures = { features: GeoFeature[] };
type Language = 'it' | 'en';

const copy = {
  it: {
    title: 'My Node', intro: 'Cerca il tuo nodo per aprire la sua scheda dettagli.',
    placeholder: 'Nome, short name o ID del nodo', search: 'Cerca', loading: 'Caricamento snapshot della rete…',
    noResults: 'Nessun nodo trovato. Prova con un nome o ID più specifico.',
    snapshotError: 'Non è stato possibile caricare i dati della rete. Riprova.',
  },
  en: {
    title: 'My Node', intro: 'Find your node to open its details page.',
    placeholder: 'Node name, short name, or ID', search: 'Search', loading: 'Loading network snapshot…',
    noResults: 'No node found. Try a more specific name or ID.',
    snapshotError: 'Could not load network data. Please try again.',
  },
};

const getNodeId = (feature: GeoFeature) => String(feature.id ?? feature.properties.id ?? '');
const getNodeName = (feature: GeoFeature) => feature.properties.long_name || feature.properties.short_name || getNodeId(feature);
const isNode = (feature: GeoFeature) => feature.properties.type === 'node';

export const MyNodeCard: React.FC<{ language: Language }> = ({ language }) => {
  const labels = copy[language];
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<NetworkFeatures | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const nodes = useMemo(() => data?.features.filter(isNode) ?? [], [data]);
  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term || !nodes.length) return [];
    return nodes.filter((node) => [getNodeName(node), node.properties.short_name, getNodeId(node)]
      .some((value) => value?.toLocaleLowerCase().includes(term))).slice(0, 6);
  }, [nodes, query]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (data || loading) return;
    setError(false);
    setLoading(true);
    try {
      const snapshot = await networkApi.getGeoJson('raw') as NetworkFeatures;
      setData(snapshot);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-outline-variant bg-surface p-5 text-on-background sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary">{labels.title}</div>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{labels.intro}</p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
            className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-background px-3 py-2.5 text-sm text-on-surface outline-none placeholder:text-outline focus:border-primary"
          />
          <button type="submit" disabled={loading} className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary/90 disabled:opacity-60">
            {loading ? '…' : labels.search}
          </button>
        </form>
      </div>

      {loading && <p className="mt-4 text-sm text-on-surface-variant">{labels.loading}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-error">{labels.snapshotError}</p>}

      {query.trim() && data && (
        <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {matches.length ? matches.map((node) => (
            <button
              key={getNodeId(node)}
              onClick={() => navigate(`/node-details/${encodeURIComponent(getNodeId(node))}`)}
              className="min-w-0 rounded-lg border border-outline-variant px-3 py-2 text-left transition-colors hover:bg-surface-container-low"
            >
              <span className="block truncate text-sm font-medium text-on-surface">{getNodeName(node)}</span>
              <span className="mt-0.5 block truncate text-xs text-on-surface-variant">{getNodeId(node)} · {node.properties.role || '—'}</span>
            </button>
          )) : <p className="text-sm text-on-surface-variant">{labels.noResults}</p>}
        </div>
      )}
    </section>
  );
};
