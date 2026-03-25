import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { contentApi, servicesApi } from '../../lib/api';
import type { Session } from '@supabase/supabase-js';
import type { HeroContent, ServiceType } from '../../types';

interface DebugError {
    source: string;
    error: any;
}

export default function DebugPage() {

    const [session, setSession] = useState<Session | null>(null);
    const [heroData, setHeroData] = useState<HeroContent[] | null>(null);
    const [servicesData, setServicesData] = useState<ServiceType[] | null>(null);
    const [errors, setErrors] = useState<DebugError[]>([]);

    useEffect(() => {
        // Defense-in-depth: Do not run diagnostics if not in dev
        if (!import.meta.env.DEV) return;

        const runDiagnostics = async () => {
            try {
                // 1. Get Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                setSession(session);
                if (sessionError) setErrors(prev => [...prev, { source: 'Auth', error: sessionError }]);

                // 2. Fetch Hero Content
                try {
                    const hero = await contentApi.getHeroContents();
                    setHeroData(hero);
                } catch (err) {
                    setErrors(prev => [...prev, { source: 'HeroContent', error: err }]);
                }

                // 3. Fetch Services
                try {
                    const services = await servicesApi.getAll();
                    setServicesData(services);
                } catch (err) {
                    setErrors(prev => [...prev, { source: 'Services', error: err }]);
                }

            } catch (err) {
                setErrors(prev => [...prev, { source: 'Global', error: err }]);
            }
        };

        runDiagnostics();
    }, []);

    // Defense-in-depth: Runtime check
    if (!import.meta.env.DEV) {
        return <div className="p-8 text-center text-red-600 font-bold">404 - Page Not Found</div>;
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Authentication Status</h2>
                <div className="whitespace-pre-wrap">
                    {session ? (
                        <span className="text-green-600">
                            LOGGED IN as {session.user.email} ({session.user.app_metadata?.role || 'user'})
                        </span>
                    ) : (
                        <span className="text-yellow-600">GUEST (No Active Session)</span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                    <h2 className="font-bold mb-2">Hero Content ({heroData?.length || 0})</h2>
                    <pre className="text-xs overflow-auto max-h-60">
                        {heroData ? JSON.stringify(heroData, null, 2) : 'No Data'}
                    </pre>
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-bold mb-2">Services ({servicesData?.length || 0})</h2>
                    <pre className="text-xs overflow-auto max-h-60">
                        {servicesData ? JSON.stringify(servicesData, null, 2) : 'No Data'}
                    </pre>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
                    <h2 className="font-bold text-red-600 mb-2">Errors Detected</h2>
                    {errors.map((err, i) => (
                        <div key={i} className="mb-2">
                            <span className="font-bold">{err.source}:</span> {JSON.stringify(err.error?.message || err.error)}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <button
                    onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Force Logout
                </button>
            </div>
        </div>
    );
}
