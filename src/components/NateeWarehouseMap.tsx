import React, { useEffect, useRef, useState } from 'react';

interface NateeWarehouseMapProps {
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  onChange?: (lat: number, lng: number) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  isEditable?: boolean;
  address?: string;
  onAddressChange?: (addr: string) => void;
}

// Helper to format clean, standard Thai address from Nominatim data
export function formatThaiNominatimAddress(data: any): string {
  if (!data) return '';
  const addr = data.address || {};

  // House number / building
  const houseNumber = addr.house_number || addr.building || '';

  // Road
  let road = addr.road || addr.street || addr.pedestrian || addr.path || '';
  if (road && !road.startsWith('ถนน') && !road.startsWith('ถ.') && !road.startsWith('ซอย') && !road.startsWith('ซ.')) {
    road = `ถนน${road}`;
  }

  // Subdistrict / Tambon / Khwaeng
  let subdistrict = addr.subdistrict || addr.quarter || addr.township || '';
  if (!subdistrict && addr.suburb && !addr.suburb.includes('บ้าน') && !addr.suburb.includes('เทศบาล')) {
    subdistrict = addr.suburb;
  }
  if (!subdistrict && addr.village && !addr.village.includes('บ้าน') && !addr.village.includes('เทศบาล')) {
    subdistrict = addr.village;
  }

  if (subdistrict) {
    subdistrict = subdistrict.replace(/^(ตำบล|ต\.|แขวง)\s*/, '');
    subdistrict = `ตำบล${subdistrict}`;
  }

  // District / Amphoe / Khet
  let district = addr.district || addr.city_district || addr.county || addr.city || '';
  if (district) {
    district = district.replace(/^(อำเภอ|อ\.|เขต)\s*/, '');
    if (district && !district.includes('เทศบาล')) {
      district = `อำเภอ${district}`;
    } else {
      district = '';
    }
  }

  // Province / Changwat
  let province = addr.province || addr.state || '';
  if (province) {
    province = province.replace(/^(จังหวัด|จ\.)\s*/, '');
    province = `จังหวัด${province}`;
  }

  const postcode = addr.postcode || '';

  const parts: string[] = [];
  if (houseNumber) parts.push(houseNumber);
  if (road) parts.push(road);
  if (subdistrict) parts.push(subdistrict);
  if (district) parts.push(district);
  if (province) parts.push(province);
  if (postcode) parts.push(postcode);

  if (parts.length >= 2) {
    return parts.join(' ');
  }

  // Fallback cleanup if structured fields are sparse
  if (data.display_name) {
    return data.display_name
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => {
        if (!s) return false;
        if (s === 'ประเทศไทย' || s === 'Thailand') return false;
        if (s.includes('เทศบาล')) return false;
        if (s.includes('บ้านใหม่') && !s.startsWith('ตำบล')) return false;
        return true;
      })
      .join(' ');
  }

  return '';
}

export function NateeWarehouseMap({
  lat,
  lng,
  latitude,
  longitude,
  onChange,
  onLocationSelect,
  readOnly,
  isEditable,
  address,
  onAddressChange,
}: NateeWarehouseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const effectiveLat = lat !== undefined && lat !== null ? lat : (latitude !== undefined && latitude !== null ? latitude : null);
  const effectiveLng = lng !== undefined && lng !== null ? lng : (longitude !== undefined && longitude !== null ? longitude : null);
  const effectiveReadOnly = readOnly !== undefined ? readOnly : (isEditable !== undefined ? !isEditable : false);
  const effectiveOnChange = onChange || onLocationSelect;

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

    const initialLat = effectiveLat || 13.7563; // Default to Bangkok
    const initialLng = effectiveLng || 100.5018;

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
        draggable: !effectiveReadOnly,
      }).addTo(map);
      markerRef.current = marker;

      // Click to pin on map (if not effectiveReadOnly)
      map.on('click', (e: any) => {
        if (effectiveReadOnly) return;
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        if (effectiveOnChange) effectiveOnChange(clickLat, clickLng);
        triggerReverseGeocode(clickLat, clickLng);
      });

      marker.on('dragend', () => {
        if (effectiveReadOnly) return;
        const position = marker.getLatLng();
        if (effectiveOnChange) effectiveOnChange(position.lat, position.lng);
        triggerReverseGeocode(position.lat, position.lng);
      });
    } else {
      // Dynamic drag enable/disable based on readOnly
      if (markerRef.current && markerRef.current.dragging) {
        if (effectiveReadOnly) {
          markerRef.current.dragging.disable();
        } else {
          markerRef.current.dragging.enable();
        }
      }

      // Update Marker position if lat/lng changes from outside
      if (effectiveLat && effectiveLng && markerRef.current) {
        markerRef.current.setLatLng([effectiveLat, effectiveLng]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([effectiveLat, effectiveLng], mapInstanceRef.current.getZoom());
        }
      }
    }

    // Helper to perform reverse geocoding via Nominatim OpenStreetMap with clean Thai address formatting
    async function triggerReverseGeocode(latVal: number, lngVal: number) {
      if (effectiveReadOnly || !onAddressChange) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latVal}&lon=${lngVal}&accept-language=th`
        );
        const data = await response.json();
        const formatted = formatThaiNominatimAddress(data);
        if (formatted) {
          onAddressChange(formatted);
        } else if (data && data.display_name) {
          onAddressChange(data.display_name);
        }
      } catch (err) {
        console.error('Error reverse geocoding:', err);
      }
    }
  }, [leafletLoaded, effectiveReadOnly, effectiveLat, effectiveLng]);

  // Search Address with local Thai province coordinates fallback + OSM Nominatim
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      const [latitudeVal, longitudeVal] = matchedProvince;
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([latitudeVal, longitudeVal], 13);
        markerRef.current.setLatLng([latitudeVal, longitudeVal]);
        if (effectiveOnChange) effectiveOnChange(latitudeVal, longitudeVal);
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
        const latitudeVal = parseFloat(first.lat);
        const longitudeVal = parseFloat(first.lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitudeVal, longitudeVal], 15);
          markerRef.current.setLatLng([latitudeVal, longitudeVal]);
          if (effectiveOnChange) effectiveOnChange(latitudeVal, longitudeVal);
          if (onAddressChange) onAddressChange(first.display_name || query);
        }
      }
    } catch (err) {
      console.error('Error searching address via Nominatim:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLatChange = (newLatStr: string) => {
    const parsedLat = parseFloat(newLatStr);
    const currentLng = effectiveLng || 100.5018;
    if (!isNaN(parsedLat) && effectiveOnChange) {
      effectiveOnChange(parsedLat, currentLng);
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([parsedLat, currentLng]);
        mapInstanceRef.current.setView([parsedLat, currentLng], mapInstanceRef.current.getZoom());
      }
    }
  };

  const handleLngChange = (newLngStr: string) => {
    const parsedLng = parseFloat(newLngStr);
    const currentLat = effectiveLat || 13.7563;
    if (!isNaN(parsedLng) && effectiveOnChange) {
      effectiveOnChange(currentLat, parsedLng);
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([currentLat, parsedLng]);
        mapInstanceRef.current.setView([currentLat, parsedLng], mapInstanceRef.current.getZoom());
      }
    }
  };

  const displayLat = effectiveLat !== null && effectiveLat !== undefined ? effectiveLat : 13.7563;
  const displayLng = effectiveLng !== null && effectiveLng !== undefined ? effectiveLng : 100.5018;

  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
          🗺️ แผนที่พิกัดคลังสินค้า Google Map / OpenStreetMap Pinpoint *
        </label>
        {!effectiveReadOnly && (
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
            📍 คลิกเพื่อปักหมุดบนแผนที่
          </span>
        )}
      </div>

      {!effectiveReadOnly && (
        <div className="space-y-2">
          {/* Address Search Bar & GPS Button */}
          <div className="flex flex-col sm:flex-row gap-1.5">
            <div className="flex gap-1.5 flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSearch();
                  }
                }}
                placeholder="พิมพ์สถานที่, อำเภอ หรือจังหวัด เช่น ชุมพร, บางลำพู, เชียงใหม่..."
                className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer disabled:bg-indigo-300 shadow-sm"
              >
                {isSearching ? 'กำลังค้น...' : '🔍 ค้นหา'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  alert("อุปกรณ์ของคุณไม่รองรับการดึงพิกัด GPS อัตโนมัติค่ะ");
                  return;
                }
                setIsSearching(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const latitudeVal = pos.coords.latitude;
                    const longitudeVal = pos.coords.longitude;
                    if (mapInstanceRef.current && markerRef.current) {
                      mapInstanceRef.current.setView([latitudeVal, longitudeVal], 16);
                      markerRef.current.setLatLng([latitudeVal, longitudeVal]);
                      if (effectiveOnChange) effectiveOnChange(latitudeVal, longitudeVal);
                      if (onAddressChange) {
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitudeVal}&lon=${longitudeVal}&accept-language=th`)
                          .then(r => r.json())
                          .then(data => {
                            const formatted = formatThaiNominatimAddress(data);
                            if (formatted) onAddressChange(formatted);
                            else if (data?.display_name) onAddressChange(data.display_name);
                          })
                          .catch(() => {});
                      }
                    }
                    setIsSearching(false);
                  },
                  () => {
                    alert("ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาอนุญาตให้ระบบเข้าถึงพิกัดในเบราว์เซอร์ค่ะ");
                    setIsSearching(false);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              disabled={isSearching}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shrink-0 cursor-pointer shadow-sm flex items-center justify-center gap-1"
            >
              <span>📍 GPS พิกัดปัจจุบัน</span>
            </button>
          </div>

          {/* Latitude & Longitude Inputs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600">
                📍 ละติจูด (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={displayLat}
                onChange={(e) => handleLatChange(e.target.value)}
                placeholder="เช่น 13.756300"
                className="w-full border border-slate-200 bg-white rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600">
                📍 ลองจิจูด (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={displayLng}
                onChange={(e) => handleLngChange(e.target.value)}
                placeholder="เช่น 100.501800"
                className="w-full border border-slate-200 bg-white rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner"
        style={{ height: effectiveReadOnly ? '200px' : '260px', zIndex: 1 }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[10px] text-slate-500 font-mono">
        <span>📍 พิกัด GPS: {Number(displayLat).toFixed(6)} , {Number(displayLng).toFixed(6)}</span>
        {!effectiveReadOnly && (
          <span className="text-slate-400 font-medium italic">
            * ท่านสามารถลากจุดสีน้ำเงิน หรือพิมพ์พิกัดตัวเลขในช่องละติจูด/ลองจิจูดได้โดยตรงค่ะ
          </span>
        )}
      </div>
    </div>
  );
}
