'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Papa from 'papaparse';
import { buyerFormSchema } from '@/lib/validations';

interface ParsedRow {
  row: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
}

export default function ImportBuyersPage() {
  const router = useRouter();
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = results.data.slice(0, 200).map((row: Record<string, unknown>, index: number) => {
          const rowNumber = index + 2; // +2 because header is row 1, data starts at 2

          // Parse data
          const parsedRow = {
            fullName: row.fullName?.trim(),
            email: row.email?.trim() || undefined,
            phone: row.phone?.trim(),
            city: row.city?.trim(),
            propertyType: row.propertyType?.trim(),
            bhk: row.bhk?.trim() || undefined,
            purpose: row.purpose?.trim(),
            budgetMin: row.budgetMin ? parseInt(row.budgetMin) : undefined,
            budgetMax: row.budgetMax ? parseInt(row.budgetMax) : undefined,
            timeline: row.timeline?.trim(),
            source: row.source?.trim(),
            notes: row.notes?.trim() || undefined,
            tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : undefined,
            status: row.status?.trim() || 'New',
          };

          // Validate
          const result = buyerFormSchema.safeParse(parsedRow);
          const errors = result.success ? [] : result.error.errors.map(e => e.message);

          return {
            row: rowNumber,
            data: parsedRow,
            isValid: result.success,
            errors,
          };
        });

        setParsedData(rows);
      },
    });
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);

    try {
      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: JSON.stringify({ buyers: validRows.map(row => row.data) }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        router.push('/buyers');
      } else {
        alert('Import failed');
      }
    } catch {
      alert('Import error');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedData.filter(row => row.isValid).length;
  const invalidCount = parsedData.filter(row => !row.isValid).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import Buyers from CSV</h1>
        <Link
          href="/buyers"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to List
        </Link>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File (max 200 rows)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          CSV should have headers: fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
        </p>
      </div>

      {parsedData.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <span className="text-green-600">Valid: {validCount}</span>
            <span className="text-red-600">Invalid: {invalidCount}</span>
          </div>

          {validCount > 0 && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : `Import ${validCount} Valid Rows`}
            </button>
          )}
        </div>
      )}

      {parsedData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left">Row</th>
                <th className="px-4 py-2 border-b text-left">Full Name</th>
                <th className="px-4 py-2 border-b text-left">Phone</th>
                <th className="px-4 py-2 border-b text-left">City</th>
                <th className="px-4 py-2 border-b text-left">Property Type</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
                <th className="px-4 py-2 border-b text-left">Errors</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row) => (
                <tr key={row.row} className={row.isValid ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-4 py-2 border-b">{row.row}</td>
                  <td className="px-4 py-2 border-b">{row.data.fullName}</td>
                  <td className="px-4 py-2 border-b">{row.data.phone}</td>
                  <td className="px-4 py-2 border-b">{row.data.city}</td>
                  <td className="px-4 py-2 border-b">{row.data.propertyType}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={row.isValid ? 'text-green-600' : 'text-red-600'}>
                      {row.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {row.errors.length > 0 && (
                      <ul className="text-red-600 text-sm">
                        {row.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}