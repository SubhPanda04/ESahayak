import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getBuyerWithHistory } from '@/lib/queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BuyerDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const userId = await requireAuth();
  const data = await getBuyerWithHistory(resolvedParams.id, userId);

  if (!data) {
    notFound();
  }

  const { buyer, history } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyer Details</h1>
        <div className="space-x-4">
          <Link
            href={`/buyers/${buyer.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <Link
            href="/buyers"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Buyer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.city}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.propertyType}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">BHK</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.bhk || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.purpose}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget</label>
            <p className="mt-1 text-sm text-gray-900">
              {buyer.budgetMin || buyer.budgetMax
                ? `${buyer.budgetMin || ''} - ${buyer.budgetMax || ''}`
                : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timeline</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.timeline}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.source}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-sm text-gray-900">{buyer.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Updated At</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(buyer.updatedAt * 1000).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <p className="mt-1 text-sm text-gray-900">{buyer.notes || '-'}</p>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <p className="mt-1 text-sm text-gray-900">
            {buyer.tags && buyer.tags.length > 0 ? buyer.tags.join(', ') : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Changes</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No changes recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">
                  Changed by {entry.changedBy} on {new Date(entry.changedAt * 1000).toLocaleString()}
                </p>
                <pre className="text-xs text-gray-800 mt-1">
                  {JSON.stringify(entry.diff, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}