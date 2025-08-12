"use client";

import { useEffect, useState, useRef } from "react";

interface AddressInputProps {
  value: string;
  onChange: (address: string, lat?: number, lon?: number, type?: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name: string;
    city?: string;
    country?: string;
    state?: string;
    street?: string;
    postcode?: string;
    housenumber?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

interface Suggestion {
  label: string;
  lat: number;
  lon: number;
  type: string;
}

export default function AddressInput({
  value,
  onChange,
  id,
  className,
  placeholder,
}: AddressInputProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("deliveryAddress");
    if (saved) {
      setInput(saved);
      onChange(saved);
    }
  }, [onChange]);

  const getType = (text: string): string => {
    text = text.toLowerCase();
    if (/apartment|apt|flat|residence/.test(text)) return "Apartment";
    if (/school|university|academy/.test(text)) return "School";
    if (/church|mosque|temple/.test(text)) return "Religious";
    if (/shop|mall|supermarket|store/.test(text)) return "Shop";
    if (/hospital|clinic/.test(text)) return "Hospital";
    if (/hotel|inn|lodge/.test(text)) return "Hotel";
    if (/office|plaza|business|building/.test(text)) return "Business";
    return "Location";
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en`
      );
      if (!response.ok) throw new Error("Failed to fetch suggestions.");

      const data: PhotonResponse = await response.json();

      const formatFeature = (f: PhotonFeature): Suggestion => {
        const p = f.properties;
        const parts = [
          p.housenumber,
          p.name,
          p.street,
          p.city,
          p.state,
          p.postcode,
          p.country,
        ].filter(Boolean);

        const label = parts.join(", ");
        return {
          label,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          type: getType(label),
        };
      };

      const kenyan = data.features
        .filter((f) => f.properties.country?.toLowerCase() === "kenya")
        .map(formatFeature);

      const global = data.features.map(formatFeature);

      setSuggestions(kenyan.length ? kenyan : global);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Could not load suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setInput(suggestion.label);
    setSuggestions([]);
    onChange(suggestion.label, suggestion.lat, suggestion.lon, suggestion.type);
    localStorage.setItem("deliveryAddress", suggestion.label);
  };

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        placeholder={placeholder || "Enter delivery address"}
        value={input}
        onChange={handleChange}
        className={`w-full p-3 border rounded-lg mt-2 ${className || ""}`}
      />

      {isLoading && (
        <p className="text-sm text-gray-500 mt-1">Loading suggestions...</p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {!isLoading && suggestions.length === 0 && input.length >= 3 && !error && (
        <p className="text-sm text-gray-500 mt-1">No suggestions found.</p>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-50 bg-white border mt-1 rounded-lg shadow w-full max-h-60 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
            >
              <span>{s.label}</span>
              <span className="text-xs text-gray-500 mt-1">{s.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
