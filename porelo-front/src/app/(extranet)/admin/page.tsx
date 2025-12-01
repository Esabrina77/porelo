'use client';

import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <div>
            <h1 style={{ marginBottom: '30px' }}>Tableau de bord Administrateur</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                <DashboardCard
                    title="Commandes"
                    description="Gérer les commandes clients"
                    href="/admin/orders"
                    color="#e6f7ff"
                    textColor="#0050b3"
                />
                <DashboardCard
                    title="Produits"
                    description="Ajouter ou modifier des produits"
                    href="/admin/products"
                    color="#f6ffed"
                    textColor="#389e0d"
                />
                <DashboardCard
                    title="Catégories"
                    description="Gérer les catégories de produits"
                    href="/admin/categories"
                    color="#fff7e6"
                    textColor="#d46b08"
                />
                <DashboardCard
                    title="Utilisateurs"
                    description="Voir les utilisateurs inscrits"
                    href="/admin/users"
                    color="#fff1f0"
                    textColor="#cf1322"
                />
            </div>
        </div>
    );
}

function DashboardCard({ title, description, href, color, textColor }: any) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{
                padding: '25px',
                backgroundColor: color,
                borderRadius: '10px',
                border: `1px solid ${color}`,
                height: '100%',
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}>
                <h2 style={{ color: textColor, marginBottom: '10px', fontSize: '20px' }}>{title}</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
            </div>
        </Link>
    );
}
