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

  // Search Address via Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=th`
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
          if (onAddressChange) onAddressChange(first.display_name || searchQuery);
        }
      }
    } catch (err) {
      console.error('Error searching address:', err);
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
            placeholder="พิมพ์จังหวัด, อำเภอ หรือชื่อสถานที่ แล้วกดปุ่มเพื่อปักหมุดอัตโนมัติ..."
            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0 cursor-pointer disabled:bg-indigo-300"
          >
            {isSearching ? 'กำลังค้น...' : 'ปักหมุดทันที'}
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
