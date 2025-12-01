'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'ADMIN') {
                router.push('/shop/products');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [isAuthenticated, user, loading, router]);

    if (loading || !isAuthorized) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Vérification des droits...</div>;
    }

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
            {/* Sidebar Admin */}
            <aside style={{
                width: '250px',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #eaeaea',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Administration</h3>

                <AdminLink href="/admin/orders" label="Commandes" />
                <AdminLink href="/admin/products" label="Produits" />
                <AdminLink href="/admin/categories" label="Catégories" />
                <AdminLink href="/admin/users" label="Utilisateurs" />

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                    <Link href="/shop/products" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                        ← Retour au site
                    </Link>
                </div>
            </aside>

            {/* Contenu principal */}
            <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}

function AdminLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            style={{
                display: 'block',
                padding: '10px 15px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                color: '#333',
                textDecoration: 'none',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </Link>
    );
}
