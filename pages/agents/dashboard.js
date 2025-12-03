import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import the dashboard component with no SSR
const DynamicAgentsDashboard = dynamic(
  () => import('../../src/components/NoblepadDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

// This component will only be rendered on the client side
function ClientOnlyDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <DynamicAgentsDashboard />;
}

// Main page component
export default function AgentsDashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Agent Dashboard | NoblePad</title>
        <meta name="description" content="Monitor and manage NoblePad agents" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Monitoring Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Real-time status and metrics for NoblePad agents
          </p>
        </div>

        <ClientOnlyDashboard />
      </main>

      <footer className="mt-12 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>NoblePad Agent Monitoring System</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </footer>
    </div>
  );
}