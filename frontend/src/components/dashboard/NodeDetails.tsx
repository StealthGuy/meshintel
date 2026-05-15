import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

// Helpers
const fmt = (val: any, suffix = ''): string => {
  if (val === null || val === undefined || val === '') return 'N/A';
  return `${val}${suffix}`;
};

const fmtFloat = (val: any, decimals = 2, suffix = ''): string => {
  const n = parseFloat(val);
  if (isNaN(n)) return 'N/A';
  return `${n.toFixed(decimals)}${suffix}`;
};

const fmtUptime = (seconds: string | number | undefined): string => {
  const s = parseInt(String(seconds), 10);
  if (isNaN(s)) return 'N/A';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${s}s (~${h}h ${m}m ${sec}s)`;
};

const fmtDate = (iso: string | undefined): string => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return 'INVALID DATE';
  }
};

export const NodeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { nodeId } = useParams<{ nodeId: string }>();
  const { selectedNodeDetails, fetchNodeDetails, isSidebarOpen, nodeError } = useAppStore();

  useEffect(() => {
    if (nodeId) {
      fetchNodeDetails(nodeId);
    }
  }, [nodeId, fetchNodeDetails]);

  if (nodeError) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-surface text-on-surface transition-all duration-300 ${!isSidebarOpen ? 'pl-[4.5rem]' : ''}`}>
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

  if (!selectedNodeDetails || (nodeId && selectedNodeDetails.id !== nodeId)) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-surface text-on-surface transition-all duration-300 ${!isSidebarOpen ? 'pl-[4.5rem]' : ''}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Loading Node Data...</h2>
      </div>
    );
  }

  const {
    id, short_name, long_name, role, hardware, fw_version, frequency,
    cluster_code, public_key, routing_enabled, last_heard, channel,
    gateway_node, last_position, last_device_metric
  } = selectedNodeDetails;

  const dm = last_device_metric;
  const batteryPct = dm?.battery_level != null ? dm.battery_level : null;
  const batteryStr = batteryPct != null ? `${batteryPct}%` : 'N/A';
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

  return (
    <div className={`flex-1 p-6 bg-surface overflow-y-auto transition-all duration-300 ${!isSidebarOpen ? 'pl-[4.5rem]' : ''}`}>
      <div className="max-w-container-max mx-auto space-y-4">

        {/* Header Identity Banner */}
        <div className="bg-surface-container-low border border-outline-variant p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div className="flex items-center gap-4">
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
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">{fmt(long_name, '') || id}</h2>
                <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant font-label-mono text-[12px] uppercase border border-outline">{fmt(role)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 font-label-mono text-[12px] text-secondary">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">tag</span> {id}</span>
                <span className="hidden md:inline">|</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">short_text</span> {fmt(short_name)}</span>
                <span className="hidden md:inline">|</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">cell_tower</span> {fmt(frequency)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest border border-outline-variant">
              <div className="w-2 h-2 bg-[#10B981]"></div>
              <span className="font-label-mono text-[12px] text-on-surface uppercase font-bold">ONLINE / ACTIVE</span>
            </div>
            <span className="font-label-mono text-[10px] text-outline uppercase tracking-wider">LAST_HEARD: {fmtDate(last_heard)}</span>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Geospatial Column */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant flex flex-col border-t-4 border-t-primary">
              <div className="p-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <span className="font-label-mono text-[12px] text-on-surface uppercase">GEOSPATIAL_DATA</span>
                <span className="material-symbols-outlined text-outline text-[16px]">my_location</span>
              </div>
              <div className="p-4 flex flex-col gap-4 flex-1">
                {/* Map placeholder */}
                <div className="w-full h-48 bg-surface-variant border border-outline-variant relative overflow-hidden">
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
                <div className="flex items-center justify-center gap-2 py-2 bg-surface-container-highest border border-outline-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {lat != null ? 'gps_fixed' : 'gps_off'}
                  </span>
                  <span className="font-label-mono text-[12px] text-on-surface font-bold uppercase tracking-widest">
                    {lat != null ? 'GPS FIX ACTIVE' : 'NO GPS DATA'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics & System Column */}
          <div className="xl:col-span-8 flex flex-col gap-4">

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Battery */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between h-32 border-l-4 border-l-primary">
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
                <div className="mt-auto">
                  <div className="font-data-tabular text-[20px] font-bold text-on-surface leading-tight">
                    {dm?.uptime_seconds != null ? `${dm.uptime_seconds}s` : 'N/A'}
                  </div>
                  <span className="font-label-mono text-[10px] text-outline uppercase tracking-wider">
                    {dm?.uptime_seconds != null ? fmtUptime(dm.uptime_seconds).split('(')[1]?.replace(')', '') : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* System Details Panel */}
            <div className="bg-surface-container-lowest border border-outline-variant flex flex-col flex-1">
              <div className="p-3 border-b border-outline-variant bg-surface-container-low">
                <span className="font-label-mono text-[12px] text-on-surface uppercase">SYSTEM_DIAGNOSTICS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
                {/* Hardware/Firmware */}
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">HARDWARE_PLATFORM</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">memory</span> {fmt(hardware)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">FIRMWARE_VER</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">terminal</span> {fw_version || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">PUBLIC_KEY</span>
                    <div className="flex items-center gap-2">
                      <code className="font-data-tabular text-[11px] bg-surface-container-highest px-2 py-1 text-on-surface border border-outline-variant flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={public_key}>
                        {public_key ? `${public_key.slice(0, 12)}...` : 'N/A'}
                      </code>
                      {public_key && (
                        <button
                          className="p-1 border border-outline-variant hover:border-primary hover:text-primary transition-colors bg-surface-container-lowest text-secondary cursor-pointer shrink-0"
                          title="Copy"
                          onClick={() => navigator.clipboard.writeText(public_key)}
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Network Context */}
                <div className="p-4 flex flex-col gap-4 bg-surface-container-lowest">
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">PRIMARY_CHANNEL</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">waves</span> {channel?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-outline-variant pb-3">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">CLUSTER_CODE</span>
                    <span className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">hub</span> {fmt(cluster_code)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-highest p-2 border border-outline-variant mt-auto">
                    <span className="font-label-mono text-[10px] text-on-surface uppercase tracking-wider font-bold">ROUTING_STATUS</span>
                    <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant font-label-mono text-[10px] uppercase border border-outline">
                      {routing_enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
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
                <span className="font-label-mono text-[12px] text-on-surface uppercase font-bold group-hover:text-primary transition-colors">LINKED_GATEWAY_NODE</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary animate-pulse">arrow_forward</span>
            </div>
            <div className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                  <div className="w-8 h-8 bg-secondary flex items-center justify-center text-on-secondary shrink-0 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">dns</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline-md text-headline-md text-on-surface truncate group-hover:text-primary transition-colors">{gw.long_name || gw.id}</h3>
                    <div className="font-label-mono text-[10px] text-secondary uppercase tracking-wider mt-1">ID: {gw.id} | HW: {gw.hardware || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  {/* GW Lat/Lon */}
                  {gwLat != null && (
                    <div className="flex flex-col gap-1 border-r border-outline-variant pr-6">
                      <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">LATITUDE</span>
                      <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(gwLat, 5)}</span>
                    </div>
                  )}
                  {gwLon != null && (
                    <div className="flex flex-col gap-1 border-r border-outline-variant pr-6">
                      <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">LONGITUDE</span>
                      <span className="font-data-tabular text-[13px] text-on-surface font-semibold">{fmtFloat(gwLon, 5)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 border-r border-outline-variant pr-6">
                    <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">BATTERY</span>
                    <div className="font-data-tabular text-[13px] text-on-surface font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">battery_full_alt</span>
                      {gwDm?.battery_level != null ? `${gwDm.battery_level}%` : 'N/A'}
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
    </div>
  );
};
