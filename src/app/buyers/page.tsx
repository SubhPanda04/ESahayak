import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getBuyers } from '@/lib/queries';
import Filters from '@/components/Filters';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BuyersPage({ searchParams }: PageProps) {
  const userId = await requireAuth();

  const filters = {
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    propertyType: typeof searchParams.propertyType === 'string' ? searchParams.propertyType : undefined,
    status: typeof searchParams.status === 'string' ? searchParams.status : undefined,
    timeline: typeof searchParams.timeline === 'string' ? searchParams.timeline : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page) || 1 : 1,
    sortBy: typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'updatedAt',
    sortOrder: typeof searchParams.sortOrder === 'string' ? (searchParams.sortOrder as 'asc' | 'desc') : 'desc',
  };

  const { buyers, totalCount, totalPages, currentPage } = await getBuyers(filters, userId);


  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, Array.isArray(v) ? v[0] : v);
    });
    params.set('page', page.toString());
    return `/buyers?${params.toString()}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyer Leads</h1>
        <Link
          href="/buyers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Lead
        </Link>
      </div>

      {/* Filters */}
      <Filters currentFilters={filters} />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Phone</th>
              <th className="px-4 py-2 border-b text-left">City</th>
              <th className="px-4 py-2 border-b text-left">Property Type</th>
              <th className="px-4 py-2 border-b text-left">Budget</th>
              <th className="px-4 py-2 border-b text-left">Timeline</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Updated At</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{buyer.fullName}</td>
                <td className="px-4 py-2 border-b">{buyer.phone}</td>
                <td className="px-4 py-2 border-b">{buyer.city}</td>
                <td className="px-4 py-2 border-b">{buyer.propertyType}</td>
                <td className="px-4 py-2 border-b">
                  {buyer.budgetMin || buyer.budgetMax
                    ? `${buyer.budgetMin || ''}-${buyer.budgetMax || ''}`
                    : '-'}
                </td>
                <td className="px-4 py-2 border-b">{buyer.timeline}</td>
                <td className="px-4 py-2 border-b">{buyer.status}</td>
                <td className="px-4 py-2 border-b">
                  {new Date(buyer.updatedAt * 1000).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    View
                  </Link>
                  <Link
                    href={`/buyers/${buyer.id}/edit`}
                    className="text-green-600 hover:text-green-800"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {buyers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No buyers found. <Link href="/buyers/new" className="text-blue-600">Create your first lead</Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`px-3 py-2 border border-gray-300 rounded ${
                page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {buyers.length} of {totalCount} buyers
      </div>
    </div>
  );
}