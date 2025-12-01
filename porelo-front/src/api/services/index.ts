/**
 * EXPORT CENTRALISÉ DES SERVICES API
 * 
 * Ce fichier permet d'importer tous les services depuis un seul endroit :
 * import { authService, productService } from '@/api/services';
 */

export * as authService from './authService';
export * as productService from './productService';
export * as orderService from './orderService';
export * as categoryService from './categoryService';
export * as reviewService from './reviewService';

