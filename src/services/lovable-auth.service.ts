/**
 * Lovable Cloud Authentication Service
 * Handles user authentication, session management, and auth state
 */

import { auth } from '../lib/lovable';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
}

export class LovableAuthService {
  private static instance: LovableAuthService;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    this.initAuthListener();
  }

  static getInstance(): LovableAuthService {
    if (!LovableAuthService.instance) {
      LovableAuthService.instance = new LovableAuthService();
    }
    return LovableAuthService.instance;
  }

  private initAuthListener() {
    auth.onAuthStateChange((user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
  }

  private notifyAuthStateListeners(user: User | null) {
    this.authStateListeners.forEach((listener) => listener(user));
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const user = await auth.getUser();
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get user's learning profile
   */
  async getUserProfile(): Promise<any> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    // Fetch additional profile data from database
    return user;
  }
}

export default LovableAuthService.getInstance();


