import React, { useEffect, useRef, useState } from 'react';

interface NateeWarehouseMapProps {
  lat: number | null;
  lng: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  address?: string;
  onAddressChange?: (addr: string) => void;
}

export function NateeWarehouseMap({
  lat,
  lng,
  onChange,
  readOnly = false,
  address,
  onAddressChange,
}: NateeWarehouseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load Leaflet CSS and JS dynamically from CDN
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // CSS injection
    let link = document.getElementById('leaflet-css') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // JS injection
    let script = document.getElementById('leaflet-js') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(script);
      script.onload = () => {
        setLeafletLoaded(true);
      };
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const initialLat = lat || 13.7563; // Default to Bangkok
    const initialLng = lng || 100.5018;

    if (!mapInstanceRef.current) {
      // Create Map instance
      const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);
      mapInstanceRef.current = map;

      // Clean OpenStreetMap Road Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create Custom Pin Icon
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: !readOnly,
      }).addTo(map);
      markerRef.current = marker;

      // Click to pin on map (if not readOnly)
      if (!readOnly) {
        map.on('click', (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          marker.setLatLng([clickLat, clickLng]);
          if (onChange) onChange(clickLat, clickLng);
          triggerReverseGeocode(clickLat, clickLng);
        });

        marker.on('dragend', () => {
          const position = marker.getLatLng();
          if (onChange) onChange(position.lat, position.lng);
          triggerReverseGeocode(position.lat, position.lng);
        });
      }
    } else {
      // Update Marker position if lat/lng changes from outside
      if (lat && lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      }
    }

    // Helper to perform reverse geocoding via Nominatim OpenStreetMap (safe & free!)
    async function triggerReverseGeocode(latitude: number, longitude: number) {
      if (readOnly || !onAddressChange) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=th`
        );
        const data = await response.json();
        if (data && data.display_name) {
          // Clean address for Thai language
          onAddressChange(data.display_name);
        }
      } catch (err) {
        console.error('Error reverse geocoding:', err);
      }
    }
  }, [leafletLoaded, readOnly]);

  // Search Address with local Thai province coordinates fallback + OSM Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query || !leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    setIsSearching(true);

    // 1. Local High-Fidelity Thai Provinces Coordinates dictionary for instant, 100% reliable results
    const thProvinces: { [key: string]: [number, number] } = {
      'กรุงเทพ': [13.7563, 100.5018], 'bangkok': [13.7563, 100.5018],
      'เชียงใหม่': [18.7883, 98.9853], 'chiang mai': [18.7883, 98.9853],
      'ชุมพร': [10.4930, 99.1800], 'chumphon': [10.4930, 99.1800],
      'ภูเก็ต': [7.8804, 98.3922], 'phuket': [7.8804, 98.3922],
      'ชลบุรี': [13.3611, 100.9847], 'chonburi': [13.3611, 100.9847], 'พัทยา': [12.9276, 100.8756],
      'นครราชสีมา': [14.9799, 102.0978], 'โคราช': [14.9799, 102.0978], 'nakhon ratchasima': [14.9799, 102.0978],
      'ขอนแก่น': [16.4322, 102.8236], 'khon kaen': [16.4322, 102.8236],
      'สุราษฎร์ธานี': [9.1381, 99.3242], 'surat thani': [9.1381, 99.3242], 'สมุย': [9.5120, 100.0136],
      'สงขลา': [7.1898, 100.5954], 'หาดใหญ่': [6.9846, 100.4789], 'songkhla': [7.1898, 100.5954],
      'นนทบุรี': [13.8591, 100.5217], 'nonthaburi': [13.8591, 100.5217],
      'สมุทรปราการ': [13.5991, 100.5968], 'samut prakan': [13.5991, 100.5968],
      'ปทุมธานี': [14.0208, 100.5250], 'pathum thani': [14.0208, 100.5250],
      'เชียงราย': [19.9070, 99.8325], 'chiang rai': [19.9070, 99.8325],
      'พิษณุโลก': [16.8219, 100.2659], 'phitsanulok': [16.8219, 100.2659],
      'ระยอง': [12.6815, 101.2813], 'rayong': [12.6815, 101.2813],
      'จันทบุรี': [12.6111, 102.1139], 'chanthaburi': [12.6111, 102.1139],
      'กระบี่': [8.0863, 98.9063], 'krabi': [8.0863, 98.9063],
      'ตรัง': [7.5644, 99.6114], 'trang': [7.5644, 99.6114],
      'นครศรีธรรมราช': [8.4333, 99.9667], 'nakhon si thammarat': [8.4333, 99.9667],
      'อุบลราชธานี': [15.2287, 104.8564], 'ubon ratchathani': [15.2287, 104.8564],
      'อุดรธานี': [17.4138, 102.7872], 'udon thani': [17.4138, 102.7872],
      'บุรีรัมย์': [14.9930, 103.1026], 'buriram': [14.9930, 103.1026],
      'ลพบุรี': [14.7995, 100.6534], 'lopburi': [14.7995, 100.6534],
      'กาญจนบุรี': [14.0228, 99.5328], 'kanchanaburi': [14.0228, 99.5328],
      'อยุธยา': [14.3532, 100.5681], 'ayutthaya': [14.3532, 100.5681],
      'ประจวบ': [11.8124, 99.7972], 'หัวหิน': [12.5712, 99.9576], 'prachuap': [11.8124, 99.7972],
      'เพชรบุรี': [13.1111, 99.9444], 'phetchaburi': [13.1111, 99.9444],
      'พังงา': [8.4503, 98.5298], 'phang nga': [8.4503, 98.5298],
      'ฉะเชิงเทรา': [13.6890, 101.0754], 'chachoengsao': [13.6890, 101.0754],
      'ลำปาง': [18.2855, 99.4923], 'lampang': [18.2855, 99.4923],
      'แม่ฮ่องสอน': [19.3021, 97.9654], 'mae hong son': [19.3021, 97.9654]
    };

    // Check if query is inside our high-fidelity dictionary
    const queryLower = query.toLowerCase();
    let matchedProvince: [number, number] | null = null;
    let matchedName = "";

    for (const [key, coords] of Object.entries(thProvinces)) {
      if (queryLower.includes(key)) {
        matchedProvince = coords;
        matchedName = key;
        break;
      }
    }

    if (matchedProvince) {
      const [latitude, longitude] = matchedProvince;
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 13);
        markerRef.current.setLatLng([latitude, longitude]);
        if (onChange) onChange(latitude, longitude);
        if (onAddressChange) onAddressChange(`จังหวัด${matchedName} ประเทศไทย`);
      }
      setIsSearching(false);
      return; // Handled locally!
    }

    // 2. Otherwise query OpenStreetMap Nominatim with proper headers for compliance
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=th`,
        {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      );
      const results = await response.json();
      if (results && results.length > 0) {
        const first = results[0];
        const latitude = parseFloat(first.lat);
        const longitude = parseFloat(first.lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
          if (onChange) onChange(latitude, longitude);
          if (onAddressChange) onAddressChange(first.display_name || query);
        }
      }
    } catch (err) {
      console.error('Error searching address via Nominatim:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
          🗺️ แผนที่พิกัดคลังสินค้า Google Map / OpenStreetMap Pinpoint *
        </label>
        {!readOnly && (
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
            📍 ปักหมุดได้เลย
          </span>
        )}
      </div>

      {!readOnly && (
        <form onSubmit={handleSearch} className="flex gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์จังหวัด, อำเภอ หรือชื่อสถานที่ เช่น ชุมพร, เชียงใหม่..."
            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0 cursor-pointer disabled:bg-indigo-300"
          >
            {isSearching ? 'กำลังค้น...' : '🔍 ค้นหาและปักหมุด'}
          </button>
        </form>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner"
        style={{ height: readOnly ? '200px' : '260px', zIndex: 1 }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[10px] text-slate-500 font-mono">
        <span>📍 พิกัด GPS: {lat ? lat.toFixed(6) : '13.756300'} , {lng ? lng.toFixed(6) : '100.501800'}</span>
        {!readOnly && (
          <span className="text-slate-400 font-medium italic">
            * ท่านสามารถคลิกหรือลากจุดสีน้ำเงินเพื่อความแม่นยำสูงสุด
          </span>
        )}
      </div>
    </div>
  );
}
