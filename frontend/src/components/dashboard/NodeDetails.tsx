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
    betweenness_centrality, suggested_role, role_threshold, role_mismatch
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
    <div className={`flex-1 p-6 pt-16 md:pt-6 bg-surface overflow-y-auto overflow-x-hidden w-full transition-all duration-300 min-w-0`}>
      <div className="max-w-container-max mx-auto space-y-4 w-full min-w-0">

        {/* Header Identity Banner */}
        <div className="bg-surface-container-low border border-outline-variant p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto min-w-0">
            {/* Top row on mobile: buttons + title */}
            <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 border border-outline-variant hover:bg-surface-container-highest transition-colors flex items-center justify-center text-secondary hover:text-primary cursor-pointer shrink-0"
                title="Go Back"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <div className="w-12 h-12 bg-primary flex items-center justify-center text-on-primary shrink-0">
                <span className="material-symbols-outlined text-[28px]">router</span>
              </div>
              <h2 className="font-headline-lg text-[22px] md:text-headline-lg text-on-surface uppercase break-all md:hidden leading-tight flex-1 min-w-0">
                {fmt(long_name, '') || id}
              </h2>
            </div>
            
            {/* Badges and metadata */}
            <div className="flex flex-col items-start justify-center min-w-0 w-full md:w-auto">
              <div className="flex flex-wrap items-center gap-2 mb-1 hidden md:flex min-w-0 w-full">
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase break-all max-w-full xl:max-w-md min-w-0">
                  {fmt(long_name, '') || id}
                </h2>
                <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant font-label-mono text-[12px] uppercase border border-outline shrink-0">{fmt(role)}</span>
              </div>
              {/* Mobile Role Badge */}
              <div className="md:hidden mb-2 min-w-0">
                <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant font-label-mono text-[12px] uppercase border border-outline inline-block break-all">{fmt(role)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 font-label-mono text-[12px] text-secondary min-w-0 w-full">
                <span className="flex items-center gap-1 min-w-0 break-all"><span className="material-symbols-outlined text-[14px] shrink-0">tag</span> {id}</span>
                <span className="hidden md:inline shrink-0">|</span>
                <span className="flex items-center gap-1 min-w-0 break-all"><span className="material-symbols-outlined text-[14px] shrink-0">short_text</span> {fmt(short_name)}</span>
                <span className="hidden md:inline shrink-0">|</span>
                <span className="flex items-center gap-1 min-w-0 break-all"><span className="material-symbols-outlined text-[14px] shrink-0">cell_tower</span> {fmt(frequency)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto shrink-0 min-w-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest border border-outline-variant min-w-0">
              {isLoadingNodeDetails ? (
                <div className="w-2 h-2 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
              ) : (
                <div className="w-2 h-2 bg-[#10B981] shrink-0"></div>
              )}
              <span className="font-label-mono text-[12px] text-on-surface uppercase font-bold truncate">
                {isLoadingNodeDetails ? 'SYNCHRONIZING...' : 'ONLINE / ACTIVE'}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-0">
              <span className="font-label-mono text-[10px] text-outline uppercase tracking-wider truncate max-w-full">LAST_HEARD: {fmtDate(last_heard)}</span>
              <span className="font-label-mono text-[9px] text-primary uppercase font-bold flex items-center gap-1 truncate max-w-full">
                <span className="material-symbols-outlined text-[11px] shrink-0">sync</span>
                SYNCHRONIZED DAILY
              </span>
            </div>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Geospatial Column */}
          <div className="xl:col-span-4 flex flex-col gap-4 h-full order-2 xl:order-1">
            <div className="bg-surface-container-lowest border border-outline-variant flex flex-col h-full">
              <div className="p-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <span className="font-label-mono text-[12px] text-on-surface uppercase">GEOSPATIAL_DATA</span>
                <span className="material-symbols-outlined text-outline text-[16px]">my_location</span>
              </div>
              <div className="p-4 flex flex-col gap-4 flex-1">
                {/* Map placeholder */}
                <div className="w-full flex-1 bg-surface-variant border border-outline-variant relative overflow-hidden">
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
          <div className="xl:col-span-8 flex flex-col gap-4 order-1 xl:order-2">

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Battery */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-[11px] text-secondary uppercase">BATTERY_LVL</span>
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
                  <span className="font-label-mono text-[11px] text-secondary uppercase">CH_UTIL</span>
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
                  <span className="font-label-mono text-[11px] text-secondary uppercase">AIR_TX_UTIL</span>
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
                <span className="font-label-mono text-[12px] text-on-surface uppercase">SYSTEM_DIAGNOSTICS</span>
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
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">HARDWAR PLATFORM</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2 break-all min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">memory</span> 
                      <span className="break-all min-w-0">{fmt(hardware)}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3 min-w-0 w-full">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">FIRMWARE VER</span>
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
            </div>
          </div>
        </div>

        {/* Role Recommendation Optimizer */}
        {betweenness_centrality != null && (
          <div className="bg-surface-container-lowest border border-outline-variant flex flex-col">
            <div className="p-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <span className="font-label-mono text-[12px] text-on-surface uppercase">ROLE_RECOMMENDATION_OPTIMIZER</span>
              <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
            </div>
            <div className="p-6 flex flex-col gap-6">
              
              {/* Status Banner */}
              <div className={`p-4 border flex flex-col md:flex-row gap-4 items-start md:items-center rounded-sm ${
                role_mismatch 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-955 dark:text-emerald-200'
              }`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 shrink-0">
                  <span className="material-symbols-outlined text-[28px]">
                    {role_mismatch ? 'warning' : 'check_circle'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[16px] leading-tight">
                    {role_mismatch ? 'Configuration Mismatch Detected' : 'Optimal Role Configuration'}
                  </h4>
                  <p className="text-[13px] opacity-90 mt-1">
                    {role_mismatch 
                      ? `This node is currently configured as ${role}, but its network position suggests it should be set to ${suggested_role}.`
                      : `The node's configured role (${role}) perfectly matches its topological position in the network.`}
                  </p>
                </div>
                {role_mismatch && (
                  <div className="bg-amber-500 text-slate-900 px-3 py-1 font-label-mono text-[11px] font-black uppercase tracking-wider rounded-sm shrink-0">
                    Reconfiguration Advised
                  </div>
                )}
              </div>

              {/* Side-by-side Role Comparison & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Current Role Card */}
                <div className="p-4 border border-outline-variant bg-surface-container-low flex flex-col justify-between h-28">
                  <div>
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider block">Current Role</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-black uppercase mt-1 block">
                      {role}
                    </span>
                  </div>
                  <span className="text-[11px] text-outline font-label-mono uppercase tracking-wider font-semibold">Configured on Device</span>
                </div>

                {/* Suggested Role Card */}
                <div className={`p-4 border bg-surface-container-low flex flex-col justify-between h-28 ${
                  role_mismatch ? 'border-amber-500/50 border-l-4 border-l-amber-500' : 'border-outline-variant'
                }`}>
                  <div>
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider block">Suggested Role</span>
                    <span className={`font-headline-md text-headline-md font-black uppercase mt-1 block ${
                      role_mismatch ? 'text-amber-500 font-bold' : 'text-[#10B981] font-bold'
                    }`}>
                      {suggested_role}
                    </span>
                  </div>
                  <span className="text-[11px] text-outline font-label-mono uppercase tracking-wider font-semibold">Topology Recommendation</span>
                </div>

                {/* Betweenness Centrality Score Card */}
                <div className="p-4 border border-outline-variant bg-surface-container-low flex flex-col justify-between h-28">
                  <div>
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider block">Centrality Score</span>
                    <span className="font-data-tabular text-[24px] font-bold text-on-surface mt-1 block">
                      {betweenness_centrality.toFixed(6)}
                    </span>
                  </div>
                  <span className="text-[10px] text-outline font-label-mono uppercase tracking-wider font-semibold">
                    Threshold: {role_threshold ? role_threshold.toFixed(6) : '0.000000'} (Top 10%)
                  </span>
                </div>

              </div>

              {/* Centrality Visual Progress Bar */}
              <div className="border border-outline-variant bg-surface-container-low p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label-mono text-[11px] text-secondary uppercase tracking-wider">Network Centrality Spectrum</span>
                  <span className="text-[11px] font-label-mono text-outline font-semibold">
                    {betweenness_centrality >= (role_threshold || 0) ? 'Top 10% (Router Zone)' : 'Client Zone'}
                  </span>
                </div>
                
                {/* Progress bar container */}
                <div className="relative w-full h-3 bg-surface-container-highest border border-outline-variant rounded-full overflow-visible my-4">
                  {/* Threshold Mark Indicator */}
                  <div className="absolute left-[90%] top-[-8px] bottom-[-8px] w-0.5 bg-red-600 z-10" title="90th Percentile (Router Threshold)">
                    <span className="absolute bottom-[16px] left-1/2 -translate-x-1/2 bg-red-600 text-white font-label-mono text-[9px] px-1 py-0.5 rounded-sm whitespace-nowrap font-bold">
                      Router Threshold (Top 10%)
                    </span>
                  </div>
                  
                  {/* Background segments */}
                  <div className="absolute left-0 right-[10%] h-full bg-[#10B981]/20 rounded-l-full"></div>
                  <div className="absolute left-[90%] right-0 h-full bg-red-500/20 rounded-r-full"></div>

                  {/* Node Value Cursor */}
                  {(() => {
                    const th = role_threshold || 0.0001;
                    const percentagePosition = betweenness_centrality < th
                      ? (betweenness_centrality / th) * 90
                      : 90 + Math.min(((betweenness_centrality - th) / Math.max(1 - th, 0.0001)) * 10, 8);
                    return (
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-on-surface border-2 border-white shadow-md rounded-full z-20 transition-all duration-700 cursor-help"
                        style={{ left: `${Math.min(Math.max(percentagePosition, 0.5), 99.5)}%` }}
                        title={`Your node's betweenness centrality: ${betweenness_centrality.toFixed(6)}`}
                      >
                        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest font-label-mono text-[9px] px-1 py-0.5 rounded-sm whitespace-nowrap font-bold">
                          {betweenness_centrality.toFixed(4)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex justify-between font-label-mono text-[9px] text-outline uppercase tracking-wider mt-4">
                  <span>0.0 (Low Transit)</span>
                  <span>1.0 (Maximum Transit)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Network Graph Metrics Box */}
        <div className="bg-surface-container-lowest border border-outline-variant flex flex-col">
          <div className="p-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <span className="font-label-mono text-[12px] text-on-surface uppercase">NETWORK_GRAPH_METRICS</span>
            <span className="material-symbols-outlined text-[16px] text-outline">hub</span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-outline-variant p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-[11px] text-secondary uppercase">IN_DEGREE</span>
                <span className="material-symbols-outlined text-outline text-[18px]">south_east</span>
              </div>
              <div className="mt-auto">
                <div className="font-data-tabular text-[28px] font-bold text-on-surface leading-none">
                  {(selectedNodeDetails as any).in_degree ?? FALLBACK_VALUE}
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-[11px] text-secondary uppercase">OUT_DEGREE</span>
                <span className="material-symbols-outlined text-outline text-[18px]">north_east</span>
              </div>
              <div className="mt-auto">
                <div className="font-data-tabular text-[28px] font-bold text-on-surface leading-none">
                  {(selectedNodeDetails as any).out_degree ?? FALLBACK_VALUE}
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
                <span className="font-label-mono text-[12px] text-on-surface uppercase font-bold group-hover:text-primary transition-colors">LINKED_GATEWAY_NODE</span>
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
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">CH_UTIL</span>
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
