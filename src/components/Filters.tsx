'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum,
} from '@/lib/db/schema';

interface FiltersProps {
  currentFilters: {
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    search?: string;
  };
}

export default function Filters({ currentFilters }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filtering
    router.push(`/buyers?${params.toString()}`);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
      <select
        value={currentFilters.city || ''}
        onChange={(e) => updateFilter('city', e.target.value)}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">All Cities</option>
        {cityEnum.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <select
        value={currentFilters.propertyType || ''}
        onChange={(e) => updateFilter('propertyType', e.target.value)}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">All Property Types</option>
        {propertyTypeEnum.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        value={currentFilters.status || ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">All Statuses</option>
        {statusEnum.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={currentFilters.timeline || ''}
        onChange={(e) => updateFilter('timeline', e.target.value)}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">All Timelines</option>
        {timelineEnum.map((timeline) => (
          <option key={timeline} value={timeline}>
            {timeline}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const search = formData.get('search') as string;
          updateFilter('search', search);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          name="search"
          defaultValue={currentFilters.search || ''}
          placeholder="Search by name, phone, email"
          className="border border-gray-300 rounded p-2 flex-1"
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Search
        </button>
      </form>
    </div>
  );
}