import Link from 'next/link';

export default function AdminButton() {
  return (
    <Link
      href="/admin"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
    >
      Admin Panel
    </Link>
  );
}
