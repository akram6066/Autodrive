"use client";
import { useEffect, useState, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY!;

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
}

interface Suggestion {
  formatted: string;
}

interface OpenCageResult {
  formatted: string;
}

interface OpenCageResponse {
  results: OpenCageResult[];
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
      onChange(saved);
      setInput(saved);
    }
  }, [onChange]);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${API_KEY}&limit=5`
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions.");

      const data: OpenCageResponse = await response.json();

      const results: Suggestion[] = data.results.map((item) => ({
        formatted: item.formatted,
      }));

      setSuggestions(results);
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

  const handleSelect = (address: string) => {
    setInput(address);
    setSuggestions([]);
    onChange(address);
    localStorage.setItem("deliveryAddress", address);
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
              onClick={() => handleSelect(s.formatted)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
