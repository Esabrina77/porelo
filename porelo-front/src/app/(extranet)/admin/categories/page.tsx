'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCategories, deleteCategory } from '@/api/services/categoryService';
import { Category } from '@/api/types';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            await deleteCategory(id);
            setCategories(categories.filter((c) => c.id !== id));
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la suppression');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Gestion des Catégories</h1>
                <Link
                    href="/admin/categories/create"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Nouvelle Catégorie
                </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Nom</th>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{category.name}</td>
                            <td style={{ padding: '10px' }}>{category.id}</td>
                            <td style={{ padding: '10px' }}>
                                <Link
                                    href={`/admin/categories/${category.id}`}
                                    style={{ marginRight: '10px', color: '#0070f3' }}
                                >
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: 'red',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
