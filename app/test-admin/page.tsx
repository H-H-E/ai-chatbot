'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestAdminPage() {
  const { data: session, status } = useSession();
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Make a copy of the session data for display
    if (status === 'authenticated') {
      setSessionData(JSON.parse(JSON.stringify(session)));
    }
  }, [session, status]);

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test Page</h1>
      <div className="mb-4">
        <p>Status: {status}</p>
        <p>User Role: {session?.user?.role || 'No role found'}</p>
        <p>User ID: {session?.user?.id || 'No ID found'}</p>
        <p>User Email: {session?.user?.email || 'No email found'}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Full Session Data:</h2>
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(sessionData, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Admin Page
        </a>
      </div>
    </div>
  );
}
