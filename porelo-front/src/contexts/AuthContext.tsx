// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, logout as logoutService } from '@/api/services/authService';

// =======================================================
// 1. DÉFINITION DES TYPES ET INTERFACES
// =======================================================

// Interface pour l'objet utilisateur retourné par l'API
export interface AuthUser {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
}

// Interface pour la valeur complète du contexte fournie par le Provider
export interface AuthContextType {
    user: AuthUser | null;
    token: string | null; // Access token (pour compatibilité)
    isAuthenticated: boolean;
    loading: boolean;
    // La fonction login prend l'email et le password et retourne une Promise
    login: (email: string, password: string) => Promise<{ token: string; user: AuthUser }>;
    // La fonction register pour l'inscription
    register: (email: string, password: string) => Promise<{ token: string; user: AuthUser }>;
    // La fonction logout
    logout: () => Promise<void>;
    // Fonction utilitaire pour obtenir le token (moins utilisée avec le hook, mais utile)
    getAuthToken: () => string | null;
}

// =======================================================
// 2. CRÉATION DU CONTEXTE ET DU HOOK
// =======================================================

// Création du Contexte avec le type défini, initialisé à 'undefined'.
// C'est crucial pour que TypeScript sache que la valeur doit correspondre à AuthContextType.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour l'utiliser facilement dans les composants
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    // Vérification de sécurité obligatoire en TypeScript/React
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

// =======================================================
// 3. PROVIDER DU CONTEXTE (LOGIQUE D'ÉTAT)
// =======================================================

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // Application des types à l'état
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fonction de nettoyage locale (sans appel API)
    const clearLocalStorage = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
    };

    // Initialisation : lecture du localStorage
    useEffect(() => {
        // Priorité au nouveau système (accessToken)
        const storedAccessToken = localStorage.getItem('accessToken');
        // Compatibilité avec l'ancien système (userToken)
        const storedOldToken = localStorage.getItem('userToken');
        const storedUser = localStorage.getItem('userInfo');

        const tokenToUse = storedAccessToken || storedOldToken;

        if (tokenToUse && storedUser) {
            setToken(tokenToUse);
            try {
                // S'assurer que le JSON parsé correspond au type AuthUser
                setUser(JSON.parse(storedUser) as AuthUser);
            } catch (e) {
                console.error("Erreur lors de la lecture de userInfo:", e);
                // Si le stockage est corrompu, on nettoie
                clearLocalStorage();
            }
        }
        setLoading(false);
    }, []);

    // Fonction de Connexion (Utilisée par la page login)
    const handleLogin = async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
        setLoading(true);
        try {
            // Appel à l'API via le service TypeScript
            const responseData = await loginUser(email, password);

            // Mise à jour de l'état
            setToken(responseData.accessToken);
            setUser(responseData.user);

            // Stockage dans le local storage (nouveau système)
            localStorage.setItem('accessToken', responseData.accessToken);
            localStorage.setItem('refreshToken', responseData.refreshToken);
            localStorage.setItem('userInfo', JSON.stringify(responseData.user));
            
            // Compatibilité avec l'ancien système
            localStorage.setItem('userToken', responseData.accessToken);

            return {
                token: responseData.accessToken,
                user: responseData.user,
            }; // Retourne les données pour la redirection
        } catch (error) {
            throw error; // Afficher l'erreur sur la page login
        } finally {
            setLoading(false);
        }
    };

    // Fonction d'Inscription (Utilisée par la page register)
    const handleRegister = async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
        setLoading(true);
        try {
            // Appel à l'API via le service TypeScript
            const responseData = await registerUser(email, password);

            // Mise à jour de l'état
            setToken(responseData.accessToken);
            setUser(responseData.user);

            // Stockage dans le local storage (nouveau système)
            localStorage.setItem('accessToken', responseData.accessToken);
            localStorage.setItem('refreshToken', responseData.refreshToken);
            localStorage.setItem('userInfo', JSON.stringify(responseData.user));
            
            // Compatibilité avec l'ancien système
            localStorage.setItem('userToken', responseData.accessToken);

            return {
                token: responseData.accessToken,
                user: responseData.user,
            }; // Retourne les données pour la redirection
        } catch (error) {
            throw error; // Afficher l'erreur sur la page register
        } finally {
            setLoading(false);
        }
    };

    // Fonction de Déconnexion
    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Appel à l'API pour révoquer le refresh token
        if (refreshToken) {
            try {
                await logoutService(refreshToken);
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                // On continue quand même le nettoyage local
            }
        }

        setToken(null);
        setUser(null);

        // Nettoyage du local storage (nouveau système)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userToken'); // Ancien système
        localStorage.removeItem('userInfo');
    };

    // VALEURS FOURNIES PAR LE CONTEXTE (correspondant à l'interface AuthContextType)
    const contextValue: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        getAuthToken: () => localStorage.getItem('accessToken') || localStorage.getItem('userToken'),
    };

    if (loading) {
        // Affichage d'un écran de chargement global pendant l'initialisation
        return <div>Chargement de la session...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// =======================================================
// 4. UTILITAIRE POUR LES SERVICES API (getTokenForApi)
// =======================================================

/**
 * Fonction utilitaire pour récupérer le token depuis le Local Storage.
 * Peut être importée directement dans les services API (comme productService).
 */
export function getTokenForApi(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userToken');
    }
    return null;
}