'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '@/api/services/userService';
import { User } from '@/api/types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await deleteUser(id);
            setUsers(users.filter((u) => u.id !== id));
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la suppression');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Gestion des Utilisateurs</h1>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Rôle</th>
                        <th style={{ padding: '10px' }}>Date d&apos;inscription</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{user.email}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: user.role === 'ADMIN' ? '#e6f7ff' : '#f6ffed',
                                    color: user.role === 'ADMIN' ? '#1890ff' : '#52c41a',
                                    fontSize: '12px'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={user.role === 'ADMIN'} // Prevent deleting admins easily
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: user.role === 'ADMIN' ? 'gray' : 'red',
                                        cursor: user.role === 'ADMIN' ? 'not-allowed' : 'pointer'
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
