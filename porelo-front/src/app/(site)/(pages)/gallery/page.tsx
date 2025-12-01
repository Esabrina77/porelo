import React from 'react';

export default function GalleryPage() {
    // Placeholder data for gallery images
    const images = [
        { id: 1, title: 'Sérum Éclat', color: '#FFE4E1' },
        { id: 2, title: 'Crème Hydratante', color: '#E0FFFF' },
        { id: 3, title: 'Rituel du Soir', color: '#F0FFF0' },
        { id: 4, title: 'Ingrédients Naturels', color: '#FFFACD' },
        { id: 5, title: 'Texture Soyeuse', color: '#E6E6FA' },
        { id: 6, title: 'Packaging Éco', color: '#FFE4B5' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <section style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>Galerie</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
                    Plongez dans l'univers visuel de PORELO. Découvrez nos produits, nos textures et notre inspiration.
                </p>
            </section>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px'
            }}>
                {images.map((img) => (
                    <div key={img.id} style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer'
                    }}
                        className="gallery-item"
                    >
                        <div style={{
                            height: '300px',
                            backgroundColor: img.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#555',
                            fontWeight: '500'
                        }}>
                            {img.title}
                        </div>
                        <div style={{ padding: '15px', backgroundColor: 'white' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>{img.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
