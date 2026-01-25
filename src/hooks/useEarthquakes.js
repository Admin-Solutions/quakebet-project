import { useState, useEffect, useCallback } from 'react';

const USGS_API_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// Demo earthquake data generator
const generateDemoQuakes = () => {
  const regions = [
    { place: 'Southern California', lat: 34.0, lon: -118.0 },
    { place: 'Alaska Peninsula', lat: 55.0, lon: -160.0 },
    { place: 'near the coast of Japan', lat: 35.0, lon: 140.0 },
    { place: 'Indonesia', lat: -6.0, lon: 110.0 },
    { place: 'Chile', lat: -33.0, lon: -70.0 },
    { place: 'Puerto Rico region', lat: 18.0, lon: -66.0 },
    { place: 'Hawaii region', lat: 19.5, lon: -155.5 },
    { place: 'Tonga Islands', lat: -21.0, lon: -175.0 },
    { place: 'Philippines', lat: 14.0, lon: 121.0 },
    { place: 'New Zealand', lat: -41.0, lon: 174.0 },
    { place: 'Mexico', lat: 19.0, lon: -99.0 },
    { place: 'Turkey', lat: 39.0, lon: 35.0 },
  ];
  
  const now = Date.now();
  return Array.from({ length: 25 }, (_, i) => {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const magnitude = 2.5 + Math.random() * 4.5;
    const hoursAgo = Math.random() * 24;
    
    return {
      id: `demo-${i}-${now}`,
      magnitude: Math.round(magnitude * 10) / 10,
      place: `${Math.floor(Math.random() * 50 + 10)}km ${['N', 'S', 'E', 'W', 'NW', 'SE', 'NE', 'SW'][Math.floor(Math.random() * 8)]} of ${region.place}`,
      time: new Date(now - hoursAgo * 60 * 60 * 1000),
      alert: magnitude > 6.5 ? 'orange' : magnitude > 6 ? 'yellow' : null,
      tsunami: magnitude > 7 ? 1 : 0,
      depth: Math.round((Math.random() * 100 + 5) * 10) / 10,
      coords: [region.lat + (Math.random() - 0.5) * 5, region.lon + (Math.random() - 0.5) * 5],
      hasCasualties: false,
      isDemo: true,
    };
  }).sort((a, b) => b.time - a.time);
};

/**
 * Custom hook for fetching and managing earthquake data
 * @param {Object} options - Configuration options
 * @param {number} options.refreshInterval - How often to refresh (ms), default 30000
 * @param {number} options.minMagnitude - Minimum magnitude to fetch, default 2.5
 * @param {number} options.limit - Maximum earthquakes to fetch, default 50
 * @param {number} options.hoursBack - How many hours of data to fetch, default 24
 */
export const useEarthquakes = (options = {}) => {
  const {
    refreshInterval = 30000,
    minMagnitude = 2.5,
    limit = 50,
    hoursBack = 24,
  } = options;

  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    maxMagnitude: 0,
    hasCasualties: false,
  });

  const fetchEarthquakes = useCallback(async () => {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const url = `${USGS_API_BASE}?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=${minMagnitude}&orderby=time&limit=${limit}`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const quakes = data.features.map((f) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: new Date(f.properties.time),
        alert: f.properties.alert,
        tsunami: f.properties.tsunami,
        significance: f.properties.sig,
        felt: f.properties.felt,
        depth: f.geometry.coordinates[2],
        coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
        url: f.properties.url,
        hasCasualties: f.properties.alert === 'red' || f.properties.alert === 'orange',
        isDemo: false,
      }));
      
      setEarthquakes(quakes);
      setIsDemo(false);
      setError(null);
      setLastUpdate(new Date());
      
      // Calculate stats
      setStats({
        total: quakes.length,
        maxMagnitude: quakes.length > 0 ? Math.max(...quakes.map(q => q.magnitude)) : 0,
        hasCasualties: quakes.some(q => q.hasCasualties),
      });
      
      setLoading(false);
      
      return quakes;
    } catch (err) {
      console.warn('USGS API unavailable, using demo data:', err.message);
      
      const demoQuakes = generateDemoQuakes();
      setEarthquakes(demoQuakes);
      setIsDemo(true);
      setError(null); // Don't show error for expected CORS issues
      setLastUpdate(new Date());
      
      setStats({
        total: demoQuakes.length,
        maxMagnitude: Math.max(...demoQuakes.map(q => q.magnitude)),
        hasCasualties: false,
      });
      
      setLoading(false);
      
      return demoQuakes;
    }
  }, [hoursBack, minMagnitude, limit]);

  // Initial fetch and interval
  useEffect(() => {
    fetchEarthquakes();
    
    const interval = setInterval(fetchEarthquakes, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEarthquakes, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    return fetchEarthquakes();
  }, [fetchEarthquakes]);

  return {
    earthquakes,
    loading,
    error,
    isDemo,
    lastUpdate,
    stats,
    refresh,
  };
};

export default useEarthquakes;
