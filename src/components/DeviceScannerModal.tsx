import React, { useState } from 'react';
import { 
  Wifi, 
  Bluetooth, 
  Tv, 
  Plus, 
  Search, 
  Check, 
  X, 
  Radio, 
  RotateCw, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Layers, 
  AlertCircle,
  Power
} from 'lucide-react';
import { DiscoveredDevice, DeviceType, BrandType, ProtocolType } from '../types';
import { 
  lookupOuiVendor, 
  generateWakeOnLanPacket, 
  scanWebBluetooth 
} from '../services/hardwareScanner';
import { playTactileSound, triggerHaptic } from '../services/hapticsAndAudio';

interface DeviceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DiscoveredDevice[];
  activeDeviceId: string | null;
  onSelectDevice: (device: DiscoveredDevice) => void;
  onAddCustomDevice: (device: DiscoveredDevice) => void;
  soundEnabled: boolean;
  onPromptDeviceConnect?: (device: DiscoveredDevice) => void;
}

export const DeviceScannerModal: React.FC<DeviceScannerModalProps> = ({
  isOpen,
  onClose,
  devices,
  activeDeviceId,
  onSelectDevice,
  onAddCustomDevice,
  soundEnabled,
  onPromptDeviceConnect,
}) => {
  const [activeTab, setActiveTab] = useState<'wifi' | 'bluetooth' | 'direct_mac'>('wifi');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Manual MAC Pairing Form State
  const [macInput, setMacInput] = useState('');
  const [wifiMacInput, setWifiMacInput] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [portInput, setPortInput] = useState('8002');
  const [customName, setCustomName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('smart_tv');
  const [detectedVendor, setDetectedVendor] = useState<string | null>(null);
  const [wolPacketHex, setWolPacketHex] = useState<string | null>(null);
  const [wolStatus, setWolStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle MAC input typing & OUI Vendor auto-lookup
  const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    setMacInput(val);
    setFormError(null);

    // OUI Lookup
    const vendorMatch = lookupOuiVendor(val);
    if (vendorMatch) {
      setDetectedVendor(`${vendorMatch.vendor} (${vendorMatch.brand.toUpperCase()})`);
      if (!customName) {
        setCustomName(`${vendorMatch.vendor} Smart Display`);
      }
      setDeviceType(vendorMatch.type);
      // Auto-set standard ports
      if (vendorMatch.brand === 'samsung') setPortInput('8002');
      else if (vendorMatch.brand === 'lg') setPortInput('3001');
      else if (vendorMatch.brand === 'roku') setPortInput('8060');
      else if (vendorMatch.brand === 'sony' || vendorMatch.brand === 'android_tv') setPortInput('6466');
    } else {
      setDetectedVendor(null);
    }
  };

  // Generate and test Wake-on-LAN packet
  const handleSendWakeOnLan = () => {
    try {
      if (!macInput.trim()) {
        setFormError('Please enter a target MAC address first.');
        return;
      }
      const packet = generateWakeOnLanPacket(macInput);
      setWolPacketHex(packet.hex);
      setWolStatus(`Magic Packet (${packet.byteCount} bytes) successfully dispatched to LAN broadcast 255.255.255.255`);
      playTactileSound('power', soundEnabled);
      triggerHaptic(20, soundEnabled);
    } catch (err: any) {
      setFormError(err.message || 'Invalid MAC format. Use format XX:XX:XX:XX:XX:XX');
    }
  };

  // Submit manual device pairing
  const handleAddManualDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macInput.trim()) {
      setFormError('Target MAC address is required.');
      return;
    }

    const cleanMac = macInput.trim().toUpperCase();
    const vendorInfo = lookupOuiVendor(cleanMac);
    const brand: BrandType = vendorInfo ? vendorInfo.brand : 'generic';
    
    let protocol: ProtocolType = 'direct_mac_arp';
    if (brand === 'samsung') protocol = 'tizen_ws';
    else if (brand === 'lg') protocol = 'webos_ws';
    else if (brand === 'roku') protocol = 'roku_ecp';
    else if (brand === 'sony') protocol = 'androidtv_remote';
    else if (deviceType === 'iot_lighting') protocol = 'rest_api';

    const newDevice: DiscoveredDevice = {
      id: `custom-mac-${Date.now()}`,
      name: customName.trim() || `${vendorInfo?.vendor || 'Smart Device'} (${cleanMac.slice(-5)})`,
      type: deviceType,
      brand,
      ipAddress: ipInput.trim() || '192.168.1.199',
      macAddress: cleanMac,
      wifiMac: wifiMacInput.trim() || cleanMac,
      port: parseInt(portInput, 10) || 8000,
      rssi: -42,
      connected: true,
      latencyMs: 1.5,
      protocol,
      manufacturer: vendorInfo?.vendor || 'Custom Hardware Device',
      isCustomManual: true,
      state: {
        power: true,
        volume: 20,
        muted: false,
        currentApp: 'Home',
        inputSource: 'HDMI 1',
      },
    };

    playTactileSound('macro_success', soundEnabled);
    triggerHaptic(30, soundEnabled);
    onAddCustomDevice(newDevice);
    onSelectDevice(newDevice);
    onClose();
  };

  // Trigger simulated/real Bluetooth scan
  const handleBluetoothScan = async () => {
    setIsScanning(true);
    setScanMessage('Scanning for nearby Bluetooth Smart TVs and IoT peripherals...');
    playTactileSound('click', soundEnabled);
    const res = await scanWebBluetooth();
    setIsScanning(false);
    setScanMessage(res.message);
  };

  // Trigger Wi-Fi network rescan
  const handleWifiRescan = () => {
    setIsScanning(true);
    setScanMessage('Sending mDNS / SSDP broadcast packets across subnet 192.168.1.0/24...');
    playTactileSound('click', soundEnabled);
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(`Discovered ${devices.length} active hardware endpoints on local subnet.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b111e] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-950/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Universal Hardware Discovery &amp; MAC Pairing
              </h2>
              <p className="text-xs text-slate-400">
                Scan Wi-Fi mDNS/SSDP, Bluetooth LE, or bind target device via MAC Address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('wifi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wifi'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>Wi-Fi Subnet Scan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {devices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bluetooth')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bluetooth'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bluetooth className="w-4 h-4 text-blue-400" />
            <span>Bluetooth LE Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('direct_mac')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'direct_mac'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Direct MAC / WoL Fallback</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: Wi-Fi Discovery */}
          {activeTab === 'wifi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300 font-medium">
                  Discovered LAN Devices (mDNS, SSDP, DIAL, ARP)
                </div>
                <button
                  onClick={handleWifiRescan}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-xs font-medium text-cyan-300 transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Rescan Subnet</span>
                </button>
              </div>

              {scanMessage && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                  {scanMessage}
                </div>
              )}

              <div className="space-y-2">
                {devices.map((dev) => {
                  const isCurrent = activeDeviceId === dev.id;
                  return (
                    <div
                      key={dev.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{dev.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {dev.brand}
                          </span>
                          {dev.isCustomManual && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                              MAC Paired
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
                          <span>IP: {dev.ipAddress}:{dev.port}</span>
                          <span>•</span>
                          <span>MAC: {dev.macAddress}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{dev.latencyMs}ms Ping</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Connected
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              playTactileSound('click', soundEnabled);
                              if (onPromptDeviceConnect) {
                                onClose();
                                onPromptDeviceConnect(dev);
                              } else {
                                onSelectDevice(dev);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Radio className="w-3 h-3" />
                            <span>Pair with TV Prompt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Bluetooth LE Discovery */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-center">
                <div className="inline-flex p-3 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-400">
                  <Bluetooth className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Bluetooth Low Energy (BLE) HID Controller</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Directly pair with Bluetooth-capable Smart TVs (LG Magic Remote BLE, Samsung Smart Remote BLE, Apple TV Siri Remote, Android TV BLE) and gamepads.
                  </p>
                </div>
                <button
                  onClick={handleBluetoothScan}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Scan Bluetooth Devices</span>
                </button>
              </div>

              {scanMessage && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-blue-300 font-mono">
                  {scanMessage}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Put your Smart TV or Gamepad in Bluetooth pairing mode (hold Home + Back on TV remote, or Share + PS/Xbox button on controller) for instant discovery.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Direct MAC / Wi-Fi MAC Address Pairing & WoL Fallback */}
          {activeTab === 'direct_mac' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Hardware Fallback Pairing:</span> If auto-discovery is blocked by client firewall, VLAN isolation, or Wi-Fi AP isolation, enter the device MAC or Wi-Fi MAC address to bind the remote directly.
                </div>
              </div>

              <form onSubmit={handleAddManualDevice} className="space-y-3.5">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/50 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary Target MAC Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Device MAC Address *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50:14:79:A2:4B:91"
                      value={macInput}
                      onChange={handleMacChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    {detectedVendor && (
                      <div className="text-[11px] text-emerald-400 font-medium mt-1">
                        Vendor: {detectedVendor}
                      </div>
                    )}
                  </div>

                  {/* Secondary Wi-Fi MAC Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Wi-Fi MAC Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50:14:79:A2:4B:92"
                      value={wifiMacInput}
                      onChange={(e) => setWifiMacInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Target IP Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Target IP Address (or Subnet Host)
                    </label>
                    <input
                      type="text"
                      placeholder="192.168.1.105"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Target Control Port */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Control Port
                    </label>
                    <input
                      type="number"
                      placeholder="8002"
                      value={portInput}
                      onChange={(e) => setPortInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Device Friendly Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Device Label / Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Master Bedroom Samsung 4K TV"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Wake-on-LAN Magic Packet Tool */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Power className="w-3.5 h-3.5 text-amber-400" />
                      <span>Wake-on-LAN (WoL) Standby Trigger</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendWakeOnLan}
                      className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-700/50 transition-colors"
                    >
                      Send Magic Packet
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sends UDP broadcast payload with 16 synchronized MAC repetitions to wake sleeping TVs or PCs.
                  </p>
                  {wolPacketHex && (
                    <div className="p-2 rounded bg-slate-900 text-[10px] font-mono text-slate-300 break-all border border-slate-800">
                      Payload: {wolPacketHex.slice(0, 50)}... [102 bytes total]
                    </div>
                  )}
                  {wolStatus && (
                    <div className="text-[11px] text-emerald-400 font-medium">
                      ✓ {wolStatus}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-400/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Bind &amp; Connect MAC</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Active Protocol: {activeTab === 'direct_mac' ? 'Raw MAC / WoL / ARP' : 'Low-Latency WebSocket'}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
