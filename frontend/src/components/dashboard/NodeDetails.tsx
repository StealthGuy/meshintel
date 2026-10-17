import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { fmt, fmtFloat, fmtDate, fmtUptimeShort, FALLBACK_VALUE } from '../../utils/formatters';

export const NodeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { nodeId } = useParams<{ nodeId: string }>();
  const { selectedNodeDetails, fetchNodeDetails, nodeError, isLoadingNodeDetails } = useAppStore();
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (nodeId) {
      fetchNodeDetails(nodeId);
    }
  }, [nodeId, fetchNodeDetails]);

  if (nodeError) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 pt-16 md:pt-8 bg-surface text-on-surface transition-all duration-300`}>
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Data Sync Failed</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-center max-w-md">
          {nodeError}. The node might have gone offline or the network topology was refreshed.
        </p>
        <button
          onClick={() => navigate('/map')}
          className="mt-6 bg-primary text-on-primary px-6 py-2 font-label-mono text-[12px] uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Return to Topology Map
        </button>
      </div>
    );
  }

  // Mostriamo lo spinner a tutto schermo SOLO se non abbiamo proprio nessun dato (es. accesso diretto via URL)
  // Se abbiamo già dati (anche parziali dalla mappa), mostriamo la UI subito per non interrompere il caricamento dell'iframe
  if (!selectedNodeDetails || (nodeId && selectedNodeDetails.id !== nodeId)) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 pt-16 md:pt-8 bg-surface text-on-surface transition-all duration-300`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Loading Node Data...</h2>
      </div>
    );
  }

  const {
    id, short_name, long_name, role, hardware, fw_version, frequency,
    cluster_code, public_key, is_licensed, has_mqtt, last_heard, channel,
    gateway_node, last_position, last_device_metric,
    betweenness_centrality, suggested_role, role_mismatch
  } = selectedNodeDetails;

  const dm = last_device_metric;
  const batteryPct = dm?.battery_level != null ? dm.battery_level : null;
  const batteryStr = batteryPct != null ? `${batteryPct}%` : FALLBACK_VALUE;
  const batteryBar = batteryPct != null ? `${batteryPct}%` : '0%';

  const chUtil = dm?.channel_utilization;
  const chUtilStr = fmtFloat(chUtil, 2, '%');
  const chUtilBar = chUtil != null ? `${Math.min(chUtil, 100).toFixed(1)}%` : '0%';

  const airTx = dm?.air_util_tx;
  const airTxStr = fmtFloat(airTx, 2, '%');
  const airTxBar = airTx != null ? `${Math.min(airTx, 100).toFixed(1)}%` : '0%';

  // const uptimeStr = fmtUptime(dm?.uptime_seconds);

  const lat = last_position?.latitude;
  const lon = last_position?.longitude;

  const gw = gateway_node;
  const gwDm = gw?.last_device_metric;
  const gwLat = gw?.last_position?.latitude;
  const gwLon = gw?.last_position?.longitude;

  // Regex per intercettare nominativi radio (es: IW2DMO, K1ABC, ecc) 
  // ed estrarre solo la parte principale ignorando l'SSID (-23, -9, ecc)
  const callsignMatch = long_name?.match(/([a-zA-Z]{1,2}\d[a-zA-Z]{1,4})(-\d+)?/);
  const extractedCallsign = callsignMatch ? callsignMatch[1].toUpperCase() : null;

  return (
    <div className="min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 pt-16 transition-all duration-300 sm:p-6 sm:pt-16 md:pt-6">
      <div className="max-w-container-max mx-auto space-y-4 w-full min-w-0">

        {/* Node identity */}
        <header className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary cursor-pointer"
              title="Go back"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="min-w-0 flex-1 basis-full break-words text-xl font-semibold leading-snug text-on-surface [overflow-wrap:anywhere] sm:text-2xl md:basis-auto">
                  {fmt(long_name, '') || id}
                </h1>
                <span className="inline-flex max-w-full items-center rounded-full border border-outline-variant bg-surface px-2.5 py-1 font-label-mono text-[10px] uppercase tracking-wide text-on-surface-variant break-words [overflow-wrap:anywhere]">{fmt(role)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-on-surface-variant">
                  {isLoadingNodeDetails ? <span className="h-2 w-2 animate-spin rounded-full border border-primary border-t-transparent" /> : <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  {isLoadingNodeDetails ? 'Updating' : 'Observed'}
                </span>
              </div>
              <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                <span className="break-all">ID: {id}</span>
                {short_name && <span>Short name: {short_name}</span>}
                {frequency && <span>{frequency}</span>}
                <span>Last heard: {fmtDate(last_heard)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Geospatial Column */}
          <div className="order-1 flex h-full flex-col gap-4 xl:col-span-4 xl:order-1">
            <div className="bg-surface-container-lowest border border-outline-variant flex flex-col h-full">
              <div className="p-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <span className="font-label-mono text-[12px] text-on-surface uppercase">Location</span>
                <span className="material-symbols-outlined text-outline text-[16px]">my_location</span>
              </div>
              <div className="p-4 flex flex-col gap-4 flex-1">
                {/* Map placeholder */}
                <div className="relative h-64 min-h-64 w-full flex-1 overflow-hidden rounded-lg border border-outline-variant bg-surface-variant xl:min-h-[420px]">
                  {lat && lon ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${lat},${lon}&t=k&z=16&output=embed`}
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-label-mono text-[10px] text-outline uppercase tracking-wider">NO COORDINATES AVAILABLE</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-outline-variant bg-surface-container-low">
                    <span className="block font-label-mono text-[10px] text-secondary uppercase mb-1">LATITUDE</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(lat, 6)}</span>
                  </div>
                  <div className="p-2 border border-outline-variant bg-surface-container-low">
                    <span className="block font-label-mono text-[10px] text-secondary uppercase mb-1">LONGITUDE</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(lon, 6)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 py-2 bg-surface-container-highest border border-outline-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    terrain
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-label-mono text-[12px] text-on-surface font-black uppercase tracking-widest">
                      ALTITUDE:
                    </span>
                    <span className="font-data-tabular text-[14px] text-primary font-bold">
                      {fmt(last_position?.altitude, ' m ASL')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics & System Column */}
          <div className="order-2 flex flex-col gap-4 xl:col-span-8 xl:order-2">

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Battery */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-[11px] text-secondary uppercase">Battery</span>
                  <span className="material-symbols-outlined text-outline text-[18px]">battery_full_alt</span>
                </div>
                <div className="mt-auto">
                  <div className="font-data-tabular text-[28px] font-bold text-on-surface leading-none mb-2">{batteryStr}</div>
                  <div className="w-full h-1 bg-surface-variant">
                    <div className="h-full bg-primary transition-all" style={{ width: batteryBar }}></div>
                  </div>
                </div>
              </div>
              {/* Channel Util */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-[11px] text-secondary uppercase">Channel use</span>
                  <span className="material-symbols-outlined text-outline text-[18px]">data_usage</span>
                </div>
                <div className="mt-auto">
                  <div className="font-data-tabular text-[28px] font-bold text-on-surface leading-none mb-2">{chUtilStr}</div>
                  <div className="w-full h-1 bg-surface-variant">
                    <div className="h-full bg-[#10B981] transition-all" style={{ width: chUtilBar }}></div>
                  </div>
                </div>
              </div>
              {/* Air Util TX */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-[11px] text-secondary uppercase">TX airtime</span>
                  <span className="material-symbols-outlined text-outline text-[18px]">wifi_tethering</span>
                </div>
                <div className="mt-auto">
                  <div className="font-data-tabular text-[28px] font-bold text-on-surface leading-none mb-2">{airTxStr}</div>
                  <div className="w-full h-1 bg-surface-variant">
                    <div className="h-full bg-primary transition-all" style={{ width: airTxBar }}></div>
                  </div>
                </div>
              </div>
              {/* Uptime */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-[11px] text-secondary uppercase">UPTIME</span>
                  <span className="material-symbols-outlined text-outline text-[18px]">timer</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="font-data-tabular text-[32px] font-bold text-on-surface leading-none">
                    {dm?.uptime_seconds != null ? fmtUptimeShort(dm.uptime_seconds) : FALLBACK_VALUE}
                  </div>
                </div>
              </div>
            </div>
            {/* System Details Panel */}
            <div className="bg-surface-container-lowest border border-outline-variant flex flex-col flex-1">
              <div className="p-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <span className="font-label-mono text-[12px] text-on-surface uppercase">Device details</span>
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${has_mqtt ? 'text-primary' : 'text-outline'}`}>
                    {has_mqtt ? 'cloud_done' : 'cloud_off'}
                  </span>
                  <span className={`font-label-mono text-[10px] font-bold uppercase tracking-widest ${has_mqtt ? 'text-primary' : 'text-outline'}`}>
                    {has_mqtt ? 'MQTT ACTIVE' : 'MQTT NOT ACTIVE'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">

                {/* Hardware/Firmware Column */}
                <div className="p-4 flex flex-col gap-4 min-w-0 w-full">
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3 min-w-0 w-full">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Hardware</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2 break-all min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">memory</span>
                      <span className="break-all min-w-0">{fmt(hardware)}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3 min-w-0 w-full">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Firmware</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2 break-all min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">terminal</span>
                      <span className="break-all min-w-0">{fw_version || FALLBACK_VALUE}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 w-full">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">PUBLIC KEY</span>
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <code className="font-data-tabular text-[11px] bg-surface-container-highest px-2 py-1 text-on-surface border border-outline-variant flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap block" title={public_key}>
                        {public_key ? `${public_key.slice(0, 16)}...` : FALLBACK_VALUE}
                      </code>
                      {public_key && (
                        <button
                          className={`p-1 border transition-colors bg-surface-container-lowest cursor-pointer shrink-0 ${copiedKey ? 'border-success text-success' : 'border-outline-variant hover:border-primary hover:text-primary text-secondary'}`}
                          title={copiedKey ? "Copied!" : "Copy"}
                          onClick={() => {
                            navigator.clipboard.writeText(public_key);
                            setCopiedKey(true);
                            setTimeout(() => setCopiedKey(false), 2000);
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedKey ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Network Context Column */}
                <div className="p-4 flex flex-col gap-4 bg-surface-container-lowest">
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">PRIMARY CHANNEL</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">waves</span> {channel?.name || FALLBACK_VALUE}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">CLUSTER CODE</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">hub</span> {fmt(cluster_code)}
                    </span>
                  </div>
                  {/* OPERATOR_TYPE - Layout Split Orizzontale */}
                  <div className="flex flex-col gap-1 mt-auto w-full min-w-0">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">OPERATOR TYPE / LOOKUP</span>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 w-full min-w-0">

                      {/* Metà Sinistra: Status Display */}
                      <div className="flex items-center gap-2 bg-surface-container-highest p-2 border border-outline-variant min-h-[38px]">
                        <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
                        <span className={`font-label-mono text-[10px] uppercase font-bold ${is_licensed ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {is_licensed ? 'LICENSED' : 'UNLICENSED'}
                        </span>
                      </div>

                      {/* Metà Destra: Action Button (Blu) */}
                      {extractedCallsign ? (
                        <a
                          href={`https://www.google.com/search?q=${extractedCallsign}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-primary text-on-primary p-2 border border-primary hover:bg-primary/90 transition-all cursor-pointer min-h-[38px] group min-w-0 overflow-hidden"
                        >
                          <span className="font-label-mono text-[10px] font-black tracking-tighter truncate">
                            SEARCH: {extractedCallsign}
                          </span>
                          <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                            search
                          </span>
                        </a>
                      ) : (
                        <div className="flex items-center justify-center bg-surface-container-low border border-outline-variant/50 p-2 min-h-[38px] opacity-50 grayscale w-full">
                          <span className="font-label-mono text-[9px] text-outline uppercase truncate">No ID Detected</span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
              {betweenness_centrality != null && (
                <div className="border-t border-outline-variant px-4 py-3">
                  <h3 className="mb-3 text-xs font-semibold text-on-surface-variant">Role & importance</h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="min-w-0 rounded-lg bg-surface-container-low px-3 py-2">
                      <span className="block text-[10px] uppercase tracking-wide text-secondary">Current role</span>
                      <span className="mt-1 block break-words text-sm font-semibold text-on-surface">{fmt(role)}</span>
                    </div>
                    <div className={`min-w-0 rounded-lg px-3 py-2 ${role_mismatch ? 'bg-amber-50' : 'bg-surface-container-low'}`}>
                      <span className="block text-[10px] uppercase tracking-wide text-secondary">Suggested role</span>
                      <span className={`mt-1 block break-words text-sm font-semibold ${role_mismatch ? 'text-amber-700' : 'text-on-surface'}`}>{fmt(suggested_role)}</span>
                    </div>
                    <div className="min-w-0 rounded-lg bg-surface-container-low px-3 py-2">
                      <span className="block text-[10px] uppercase tracking-wide text-secondary">Centrality score</span>
                      <span className="mt-1 block text-sm font-semibold tabular-nums text-on-surface">{betweenness_centrality.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t border-outline-variant px-4 py-3">
                <h3 className="mb-3 text-xs font-semibold text-on-surface-variant">Importance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-surface-container-low px-3 py-2">
                    <span className="block text-[10px] uppercase tracking-wide text-secondary">Incoming links</span>
                    <span className="mt-1 block text-lg font-semibold tabular-nums text-on-surface">{(selectedNodeDetails as any).in_degree ?? FALLBACK_VALUE}</span>
                  </div>
                  <div className="rounded-lg bg-surface-container-low px-3 py-2">
                    <span className="block text-[10px] uppercase tracking-wide text-secondary">Outgoing links</span>
                    <span className="mt-1 block text-lg font-semibold tabular-nums text-on-surface">{(selectedNodeDetails as any).out_degree ?? FALLBACK_VALUE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gateway Sub-Node Section */}
        {gw && typeof gw === 'object' && 'id' in gw ? (
          <div
            className="bg-surface-container-low border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors group"
            onClick={() => {
              navigate(`/node-details/${gw.id}`);
            }}
          >
            <div className="p-3 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-primary transition-colors">share</span>
                <span className="font-label-mono text-[12px] text-on-surface uppercase font-bold group-hover:text-primary transition-colors">Connected gateway</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary animate-pulse">arrow_forward</span>
            </div>
            <div className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center min-w-0">
              <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                <div className="flex items-center gap-3 border-b border-outline-variant pb-3 min-w-0">
                  <div className="w-8 h-8 bg-secondary flex items-center justify-center text-on-secondary shrink-0 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">dns</span>
                  </div>
                  <div className="min-w-0 flex-1 w-full">
                    <h3 className="font-headline-md text-headline-md text-on-surface break-all min-w-0 group-hover:text-primary transition-colors leading-tight">
                      {gw.long_name || gw.id}
                    </h3>
                    <div className="font-label-mono text-[10px] text-secondary uppercase tracking-wider mt-1 truncate">ID: {gw.id} | HW: {gw.hardware || FALLBACK_VALUE}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6">
                  {/* GW Lat/Lon */}
                  {gwLat != null && (
                    <div className="flex flex-col gap-1 md:border-r md:border-outline-variant md:pr-6">
                      <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">LATITUDE</span>
                      <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(gwLat, 5)}</span>
                    </div>
                  )}
                  {gwLon != null && (
                    <div className="flex flex-col gap-1 md:border-r md:border-outline-variant md:pr-6">
                      <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">LONGITUDE</span>
                      <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(gwLon, 5)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 md:border-r md:border-outline-variant md:pr-6">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">BATTERY</span>
                    <div className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">battery_full_alt</span>
                      {gwDm?.battery_level != null ? `${gwDm.battery_level}%` : FALLBACK_VALUE}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Channel use</span>
                    <div className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">data_usage</span>
                      {fmtFloat(gwDm?.channel_utilization, 2, '%')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-32 bg-surface-variant border border-outline-variant relative overflow-hidden shrink-0 pointer-events-none">
                {gwLat && gwLon ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${gwLat},${gwLon}&t=k&z=16&output=embed`}
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-label-mono text-[10px] text-outline uppercase tracking-wider">NO COORDINATES</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant p-4 flex items-center justify-center">
            <span className="font-label-mono text-outline uppercase text-[12px]">NO DIRECT GATEWAY LINKED</span>
          </div>
        )}

      </div>
    </div >
  );
};
