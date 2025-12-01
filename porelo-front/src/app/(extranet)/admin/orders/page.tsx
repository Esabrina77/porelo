'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/api/services/orderService';
import { Order } from '@/api/types';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
        try {
            await updateOrderStatus(id, { status: newStatus });
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la mise à jour du statut');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Gestion des Commandes</h1>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Client</th>
                        <th style={{ padding: '10px' }}>Total</th>
                        <th style={{ padding: '10px' }}>Statut</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', fontSize: '12px' }}>{order.id}</td>
                            <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '10px' }}>{order.userID}</td>
                            <td style={{ padding: '10px' }}>{order.totalAmount} €</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    backgroundColor:
                                        order.status === 'DELIVERED' ? '#f6ffed' :
                                            order.status === 'SHIPPED' ? '#e6f7ff' :
                                                order.status === 'CANCELLED' ? '#fff1f0' : '#fff7e6',
                                    color:
                                        order.status === 'DELIVERED' ? '#52c41a' :
                                            order.status === 'SHIPPED' ? '#1890ff' :
                                                order.status === 'CANCELLED' ? '#f5222d' : '#fa8c16',
                                    fontSize: '12px'
                                }}>
                                    {order.status}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                                    style={{ padding: '5px' }}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="SHIPPED">SHIPPED</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
