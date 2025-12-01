"use client";

import React, { useState, useEffect } from 'react';
import { fetchProducts } from '@/api/services/productService'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Product, PaginatedProductsResponse } from '@/api/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProductsPage() {
    const { isAuthenticated, loading, logout } = useAuth();
    
    // État des produits et pagination
    const [products, setProducts] = useState<Product[]>([]); 
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10); // Récupéré depuis la réponse API
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [hasPrev, setHasPrev] = useState<boolean>(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const [pageError, setPageError] = useState<string | null>(null); 
    
    const router = useRouter();

    // --- LOGIQUE DE GARDE DE ROUTE (CLIENT SIDE) ---
    if (loading) {
        return <div style={{padding: '20px'}}>Vérification de l'authentification en cours...</div>;
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null; 
    }
    // --- FIN LOGIQUE DE GARDE ---


    // Charger les produits quand la page change ou au montage
    useEffect(() => {
        if (!isAuthenticated) return; 

        const loadProducts = async () => {
            setLoadingProducts(true);
            setPageError(null);
            try {
                // Récupérer les produits avec pagination (utilise la valeur par défaut du service)
                const data: PaginatedProductsResponse = await fetchProducts(currentPage);
                
                // Mettre à jour l'état avec les produits et les métadonnées de pagination
                setProducts(data.products);
                setTotalPages(data.totalPages);
                setTotal(data.total);
                setLimit(data.limit);
                setHasNext(data.hasNext);
                setHasPrev(data.hasPrev);
            } catch (err: any) {
                // Gérer les erreurs de session (401/403)
                if (err.statusCode === 401 || err.message.includes("Session expirée") || err.message.includes("Token manquant")) {
                    logout();
                    router.push('/login');
                }
                setPageError(err.message || 'Erreur lors du chargement des produits');
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, [isAuthenticated, currentPage, router, logout]);

    // Fonctions de navigation
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (hasNext) {
            goToPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (hasPrev) {
            goToPage(currentPage - 1);
        }
    }; 


    if (pageError) {
        return <div style={{padding: '20px', color: 'red'}}>Erreur: {pageError}</div>;
    }
    
    // Générer les numéros de page à afficher
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Nombre maximum de pages visibles
        
        if (totalPages <= maxVisible) {
            // Si moins de 5 pages, afficher toutes
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logique pour afficher les pages avec "..."
            if (currentPage <= 3) {
                // Début : 1, 2, 3, 4, ...
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Fin : ..., N-3, N-2, N-1, N
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Milieu : 1, ..., page-1, page, page+1, ..., N
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };
    
    // Rendu des produits
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Liste des Produits</h1>
                {total > 0 && (
                    <p className={styles.productCount}>
                        {total} produit{total > 1 ? 's' : ''} au total
                    </p>
                )}
            </div>

            {loadingProducts ? (
                <div className={styles.loading}>Chargement des produits...</div>
            ) : products.length === 0 ? (
                <div className={styles.empty}>Aucun produit trouvé.</div>
                ) : (
                <>
                    <div className={styles.productsGrid}>
                        {products.map((product) => (
                            <Link 
                                key={product.id} 
                                href={`/shop/products/${product.id}`}
                                className={styles.productCard}
                            >
                                {product.imageURL && (
                                    <img 
                                        src={product.imageURL} 
                                        alt={product.name}
                                        className={styles.productImage}
                                    />
                                )}
                                <div className={styles.productInfo}>
                                    <h2 className={styles.productName}>{product.name}</h2>
                                    <p className={styles.productDescription}>{product.description}</p>
                                    <p className={styles.productPrice}>
                                        <strong>{product.price.toFixed(2)} €</strong>
                                    </p>
                                    <p className={styles.productStock}>
                                        Stock : {product.stock}
                                    </p>
                                    {product.category && (
                                        <p className={styles.productCategory}>
                                            {product.category.name}
                                        </p>
                )}
            </div>
                            </Link>
                        ))}
                    </div>

                    {/* Contrôles de pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={goToPrevPage}
                                disabled={!hasPrev || loadingProducts}
                                className={styles.paginationButton}
                                aria-label="Page précédente"
                            >
                                ← Précédent
                            </button>

                            <div className={styles.pageNumbers}>
                                {getPageNumbers().map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                                                ...
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page as number)}
                                            disabled={loadingProducts}
                                            className={`${styles.pageNumber} ${
                                                currentPage === page ? styles.active : ''
                                            }`}
                                            aria-label={`Page ${page}`}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={!hasNext || loadingProducts}
                                className={styles.paginationButton}
                                aria-label="Page suivante"
                            >
                                Suivant →
                            </button>
                        </div>
                    )}

                    {/* Informations de pagination */}
                    {totalPages > 1 && (
                        <div className={styles.paginationInfo}>
                            Page {currentPage} sur {totalPages}
                            {' • '}
                            Produits {((currentPage - 1) * limit) + 1} à {Math.min(currentPage * limit, total)} sur {total}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}