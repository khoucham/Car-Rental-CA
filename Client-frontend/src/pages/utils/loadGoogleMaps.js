export function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    // already loaded
    if (window.google && window.google.maps) {
      resolve(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      reject("Google Maps API key is missing");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(true);
    script.onerror = () => reject("Failed to load Google Maps");

    document.head.appendChild(script);
  });
}
