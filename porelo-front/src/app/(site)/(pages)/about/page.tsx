import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <section style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>Notre Histoire</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
                    PORELO est né d'une passion pour la beauté naturelle et authentique.
                    Nous croyons que chaque peau mérite des soins purs, efficaces et respectueux.
                </p>
            </section>

            <section style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '80px', flexDirection: 'row' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative', height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                        <Image
                            src="https://miro.medium.com/v2/resize:fit:1200/1*8t2bSjNLbYJgNY0ht-LFYg.jpeg"
                            alt="Notre Laboratoire"
                            width={600}
                            height={400}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>La Science au Service de la Nature</h2>
                    <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '20px' }}>
                        Nos formules sont élaborées par des experts en dermatologie et en cosmétologie naturelle.
                        Nous sélectionnons rigoureusement chaque ingrédient pour ses propriétés bénéfiques prouvées.
                    </p>
                    <p style={{ lineHeight: '1.8', color: '#555' }}>
                        Pas de compromis : nos produits sont 100% cruelty-free, vegan et sans ingrédients controversés.
                    </p>
                </div>
            </section>

            <section style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '80px', flexDirection: 'row-reverse' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative', height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                        <Image
                            src="https://images.ctfassets.net/g8qtv9gzg47d/image_post_77876/56de8711902f2299ed26271cab68e4c0/Slider_1_-_Peels_For_Wimps?fl=progressive&fm=jpg&q=80"
                            alt="Notre Laboratoire"
                            width={600}
                            height={400}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Nos Engagements</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✓</span>
                            <span style={{ color: '#555' }}>Ingrédients d'origine naturelle</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✓</span>
                            <span style={{ color: '#555' }}>Emballages éco-responsables</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✓</span>
                            <span style={{ color: '#555' }}>Fabrication transparente</span>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
