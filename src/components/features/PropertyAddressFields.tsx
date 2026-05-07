'use client';

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { ListingFormData } from '@/lib/validations/listing.schema';

export type PropertyAddressFieldsProps = {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
  setValue: (name: keyof ListingFormData, value: ListingFormData[keyof ListingFormData]) => void;
};

type PlacePrediction = {
  description: string;
  place_id: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceDetails = {
  name?: string;
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: AddressComponent[];
};

type AutocompletePredictionLike = {
  description: string;
  place_id: string;
};

type AutocompleteServiceLike = {
  getPlacePredictions: (
    request: { input: string; componentRestrictions?: { country: string } },
    callback: (result: AutocompletePredictionLike[] | null, status: string) => void,
  ) => void;
};

type PlacesServiceLike = {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (place: PlaceDetails | null, status: string) => void,
  ) => void;
};

type GoogleMapsLike = {
  maps?: {
    places?: {
      AutocompleteService: new () => AutocompleteServiceLike;
      PlacesService: new (container: Element) => PlacesServiceLike;
    };
  };
};

let placesScriptPromise: Promise<void> | null = null;

function getGoogleMaps(): GoogleMapsLike | undefined {
  return (window as unknown as { google?: GoogleMapsLike }).google;
}

function loadGooglePlacesScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (getGoogleMaps()) return Promise.resolve();
  if (placesScriptPromise) return placesScriptPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Add it to your environment variables.'),
    );
  }

  placesScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-places-script="true"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Places script')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googlePlacesScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Places script'));
    document.head.appendChild(script);
  });

  return placesScriptPromise;
}

function parseAddressComponents(components: AddressComponent[] | undefined): {
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  /** Best-effort "street + number" line. */
  addressLine1?: string;
  /** Best-effort "flat / floor / building / locality" line. */
  addressLine2?: string;
} {
  const out: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
  } = {};
  if (!components?.length) return out;

  let streetNumber: string | undefined;
  let route: string | undefined;
  let premise: string | undefined;
  let subpremise: string | undefined;
  let neighborhood: string | undefined;
  let sublocality: string | undefined;

  for (const c of components) {
    if (c.types.includes('locality') || c.types.includes('postal_town')) {
      out.city = c.long_name;
    }
    if (c.types.includes('administrative_area_level_1')) {
      out.state = c.long_name;
    }
    if (c.types.includes('country')) {
      out.country = c.long_name;
    }
    if (c.types.includes('postal_code')) {
      out.postalCode = c.long_name;
    }

    if (c.types.includes('street_number')) streetNumber = c.long_name;
    if (c.types.includes('route')) route = c.long_name;
    if (c.types.includes('premise')) premise = c.long_name;
    if (c.types.includes('subpremise')) subpremise = c.long_name;
    if (c.types.includes('neighborhood')) neighborhood = c.long_name;
    if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1')) {
      sublocality = c.long_name;
    }
  }

  const line1 = [streetNumber, route].filter(Boolean).join(' ');
  if (line1) out.addressLine1 = line1;

  const line2 = [subpremise, premise, neighborhood, sublocality].filter(Boolean).join(', ');
  if (line2) out.addressLine2 = line2;

  return out;
}

export function PropertyAddressFields({ register, errors, setValue }: PropertyAddressFieldsProps) {
  const [query, setQuery] = React.useState('');
  const [predictions, setPredictions] = React.useState<PlacePrediction[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = React.useState(false);
  const [placesReady, setPlacesReady] = React.useState(false);
  const [placesError, setPlacesError] = React.useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const autocompleteSvcRef = React.useRef<AutocompleteServiceLike | null>(null);
  const placesSvcRef = React.useRef<PlacesServiceLike | null>(null);
  const debounceRef = React.useRef<number | null>(null);

  const addressLine1Field = register('addressLine1');

  React.useEffect(() => {
    let active = true;
    void loadGooglePlacesScript()
      .then(() => {
        if (!active) return;
        const maps = getGoogleMaps()?.maps;
        if (!maps?.places) {
          setPlacesError('Google Places library is unavailable.');
          return;
        }
        autocompleteSvcRef.current = new maps.places.AutocompleteService();
        const div = document.createElement('div');
        placesSvcRef.current = new maps.places.PlacesService(div);
        setPlacesReady(true);
      })
      .catch((e) => {
        if (!active) return;
        setPlacesError(e instanceof Error ? e.message : 'Could not load Google Places');
      });
    return () => {
      active = false;
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const runPredictionQuery = React.useCallback((value: string) => {
    const svc = autocompleteSvcRef.current;
    if (!svc || !value.trim()) {
      setPredictions([]);
      return;
    }
    setIsLoadingPredictions(true);
    svc.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'in' },
      },
      (result, status) => {
        setIsLoadingPredictions(false);
        if (status !== 'OK' || !result) {
          setPredictions([]);
          return;
        }
        setPredictions(result.map((r) => ({ description: r.description, place_id: r.place_id })));
      },
    );
  }, []);

  const handleAddressInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    addressLine1Field.onChange(e);
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setValue('placeId', undefined);
    setValue('formattedAddress', undefined);
    if (!placesReady) return;
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => runPredictionQuery(value), 250);
  };

  const handleSelectPrediction = React.useCallback(
    (prediction: PlacePrediction) => {
      const svc = placesSvcRef.current;
      if (!svc) return;
      svc.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['name', 'formatted_address', 'geometry.location', 'address_components', 'place_id'],
        },
        (place, status) => {
          if (status !== 'OK' || !place) return;
          const details = place as PlaceDetails;
          const lat = details.geometry?.location?.lat();
          const lng = details.geometry?.location?.lng();
          const parsed = parseAddressComponents(details.address_components);

          // Keep address fields structured (do not save full formatted address text).
          const nameLine = (details.name ?? prediction.description).trim();
          // Keep within schema max length (addressLine1 max 200).
          setValue('addressLine1', nameLine.slice(0, 200));
          if (parsed.addressLine2) setValue('addressLine2', parsed.addressLine2);
          else setValue('addressLine2', undefined);
          if (details.formatted_address) setValue('formattedAddress', details.formatted_address);
          if (details.place_id) setValue('placeId', details.place_id);
          if (typeof lat === 'number') setValue('latitude', lat);
          if (typeof lng === 'number') setValue('longitude', lng);
          if (parsed.city) setValue('city', parsed.city);
          if (parsed.state) setValue('state', parsed.state);
          if (parsed.country) setValue('country', parsed.country);
          if (parsed.postalCode) setValue('postalCode', parsed.postalCode);

          setQuery(prediction.description);
          setPredictions([]);
          setShowSuggestions(false);
        },
      );
    },
    [setValue],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-800">Address</p>

      <div className="relative">
        <Input
          label="Address line 1 *"
          placeholder="Street, building, area"
          error={errors.addressLine1?.message}
          autoComplete="off"
          {...addressLine1Field}
          onChange={handleAddressInputChange}
          onFocus={(e) => {
            void e;
            setShowSuggestions(true);
          }}
        />
        {showSuggestions && query.trim().length >= 3 && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {isLoadingPredictions ? (
              <p className="px-3 py-2 text-xs text-gray-500">Searching addresses...</p>
            ) : predictions.length > 0 ? (
              predictions.map((p) => (
                <button
                  key={p.place_id}
                  type="button"
                  className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 last:border-b-0 hover:bg-gray-50"
                  onClick={() => handleSelectPrediction(p)}
                >
                  {p.description}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-gray-500">
                {placesError ?? (placesReady ? 'No matching addresses found.' : 'Loading address search...')}
              </p>
            )}
          </div>
        )}
      </div>
      <Input
        label="Address line 2"
        placeholder="Flat, floor, landmark (optional)"
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City *" placeholder="City" error={errors.city?.message} {...register('city')} />
        <Input label="State *" placeholder="State" error={errors.state?.message} {...register('state')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country *" placeholder="Country" error={errors.country?.message} {...register('country')} />
        <Input
          label="Postal code"
          placeholder="PIN / ZIP"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 space-y-3">
        <p className="text-xs font-medium text-gray-700">Coordinates *</p>
        <p className="text-[11px] text-gray-500 leading-snug">
          Required for map and search. Paste from Google Maps (right-click a place → the first number is lat, the second
          is lng).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude *"
            type="number"
            step="any"
            placeholder="e.g. 23.0225"
            error={errors.latitude?.message}
            {...register('latitude', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = typeof v === 'number' ? v : Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input
            label="Longitude *"
            type="number"
            step="any"
            placeholder="e.g. 72.5714"
            error={errors.longitude?.message}
            {...register('longitude', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = typeof v === 'number' ? v : Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
        </div>
      </div>
    </div>
  );
}
