/**
 * EXPORT CENTRALISÉ DE L'API
 * 
 * Point d'entrée principal pour toutes les fonctionnalités API :
 * - Types
 * - Client API
 * - Services
 */

export * from './types';
export { apiClient, apiRequest } from './apiClient';
export * from './services';

