'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProducts, deleteProduct } from '@/api/services/productService';
import { Product } from '@/api/types';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadProducts();
    }, [page]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts(page, 10);
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des produits');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

        try {
            await deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la suppression');
        }
    };

    if (loading && products.length === 0) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Gestion des Produits</h1>
                <Link
                    href="/admin/products/create"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Nouveau Produit
                </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Image</th>
                        <th style={{ padding: '10px' }}>Nom</th>
                        <th style={{ padding: '10px' }}>Prix</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                {product.imageURL && (
                                    <img src={product.imageURL} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                )}
                            </td>
                            <td style={{ padding: '10px' }}>{product.name}</td>
                            <td style={{ padding: '10px' }}>{product.price} €</td>
                            <td style={{ padding: '10px' }}>{product.stock}</td>
                            <td style={{ padding: '10px' }}>
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    style={{ marginRight: '10px', color: '#0070f3' }}
                                >
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
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

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    style={{ padding: '5px 10px' }}
                >
                    Précédent
                </button>
                <span>Page {page} sur {totalPages}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{ padding: '5px 10px' }}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
