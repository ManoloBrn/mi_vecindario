import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CATEGORIES } from '../data';

export default function MapView({
  reports = [], userLoc, onTapMap, onTapPin,
  highlightedId, droppedPin, mapStyle = 'carto-light',
  zoom = 16, centered = null, interactive = true,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const droppedRef = useRef(null);
  const tileRef = useRef(null);

  const tileUrls = {
    'osm':           { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                           attr: '© OpenStreetMap' },
    'carto-light':   { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',                  attr: '© OSM © Carto' },
    'carto-voyager': { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',         attr: '© OSM © Carto' },
    'carto-dark':    { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',                   attr: '© OSM © Carto' },
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [userLoc.lat, userLoc.lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      tap: interactive,
    });
    mapRef.current = map;

    const { url, attr } = tileUrls[mapStyle] || tileUrls['carto-light'];
    tileRef.current = L.tileLayer(url, { attribution: attr, maxZoom: 19, subdomains: 'abcd' }).addTo(map);

    if (onTapMap) {
      map.on('click', (e) => onTapMap({ lat: e.latlng.lat, lng: e.latlng.lng }));
    }

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    const { url, attr } = tileUrls[mapStyle] || tileUrls['carto-light'];
    tileRef.current = L.tileLayer(url, { attribution: attr, maxZoom: 19, subdomains: 'abcd' }).addTo(map);
  }, [mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); }
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="position:relative;width:22px;height:22px">
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:rgba(46,125,91,0.25);animation:pulse-ring 2s var(--ease-out) infinite"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:#2E7D5B;border:3px solid #fff;box-shadow:0 2px 6px rgba(46,125,91,0.4)"></div>
        </div>`,
      iconSize: [22, 22], iconAnchor: [11, 11],
    });
    userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], { icon: userIcon, interactive: false }).addTo(map);
  }, [userLoc.lat, userLoc.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.keys(markersRef.current).forEach(id => {
      if (!reports.find(r => r.id === id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });
    reports.forEach(r => {
      const cat = CATEGORIES[r.cat];
      const isHigh = highlightedId === r.id;
      const size = isHigh ? 44 : 36;
      const html = `
        <div class="drop" style="position:relative;width:${size}px;height:${size + 8}px">
          <div style="position:absolute;left:50%;top:0;transform:translate(-50%,0);width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform-origin:center;transform:translate(-50%,0) rotate(-45deg);background:${cat.color};box-shadow:0 4px 10px rgba(20,30,24,0.25),0 1px 3px rgba(20,30,24,0.15);border:3px solid #fff;display:flex;align-items:center;justify-content:center">
            <div style="transform:rotate(45deg);font-size:${size * 0.45}px;line-height:1">${cat.emoji}</div>
          </div>
          ${r.urgent ? `<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#DC2626;border:2px solid #fff"></div>` : ''}
        </div>
      `;
      const icon = L.divIcon({ className: 'report-marker', html, iconSize: [size, size + 8], iconAnchor: [size / 2, size + 4] });

      if (markersRef.current[r.id]) {
        markersRef.current[r.id].setIcon(icon);
      } else {
        const m = L.marker([r.lat, r.lng], { icon }).addTo(map);
        m.on('click', () => onTapPin && onTapPin(r));
        markersRef.current[r.id] = m;
      }
    });
  }, [reports, highlightedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (droppedRef.current) { map.removeLayer(droppedRef.current); droppedRef.current = null; }
    if (droppedPin) {
      const html = `
        <div class="drop" style="position:relative;width:52px;height:60px">
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:rgba(46,125,91,0.2);animation:pulse-ring 1.8s var(--ease-out) infinite"></div>
          <div style="position:absolute;left:50%;top:0;width:48px;height:48px;border-radius:50% 50% 50% 0;transform:translate(-50%,0) rotate(-45deg);background:#2E7D5B;box-shadow:0 6px 14px rgba(46,125,91,0.5);border:4px solid #fff;display:flex;align-items:center;justify-content:center">
            <div style="transform:rotate(45deg);color:#fff;font-size:22px;font-weight:700">+</div>
          </div>
        </div>`;
      const icon = L.divIcon({ className: 'dropped-marker', html, iconSize: [52, 60], iconAnchor: [26, 56] });
      droppedRef.current = L.marker([droppedPin.lat, droppedPin.lng], { icon, interactive: false }).addTo(map);
    }
  }, [droppedPin?.lat, droppedPin?.lng]);

  useEffect(() => {
    if (!mapRef.current || !centered) return;
    mapRef.current.flyTo([centered.lat, centered.lng], centered.zoom || zoom, { duration: 0.8 });
  }, [centered?.lat, centered?.lng, centered?.zoom]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}
