'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logoutAll } from '@/api/services/authService';
import { updateUser } from '@/api/services/userService';
import { User } from '@/api/types';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editEmail, setEditEmail] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getCurrentUser();
            setUser(data);
            setEditEmail(data.email);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setSuccess(null);

        try {
            const updatedUser = await updateUser(user.id, { email: editEmail });
            setUser(updatedUser);
            setSuccess('Profil mis à jour avec succès');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour');
        }
    };

    const handleLogoutAll = async () => {
        try {
            await logoutAll();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la déconnexion');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error && !user) return <div style={{ color: 'red' }}>{error}</div>;
    if (!user) return <div>Utilisateur non trouvé</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Mon Profil</h1>

            {success && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fff1f0', borderRadius: '4px' }}>{error}</div>}

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '20px'
            }}>
                {!isEditing ? (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Email:</strong> {user.email}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Rôle:</strong> {user.role}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Membre depuis:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: '#0070f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginBottom: '20px'
                            }}
                        >
                            Modifier mon profil
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleUpdate} style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                            <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Enregistrer
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditEmail(user.email);
                                    setError(null);
                                }}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: '#ccc',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                )}

                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h3>Sécurité</h3>
                    <button
                        onClick={handleLogoutAll}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Se déconnecter de tous les appareils
                    </button>
                </div>
            </div>
        </div>
    );
}
