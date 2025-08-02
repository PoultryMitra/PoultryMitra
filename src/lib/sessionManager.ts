import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface SessionInfo {
  uid: string;
  email: string | null;
  lastLogin: number;
  refreshToken?: string | null;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionKey = 'userSession';
  private maxSessionAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  static getInstance(): SessionManager {
    if (!this.instance) {
      this.instance = new SessionManager();
    }
    return this.instance;
  }

  saveSession(user: any): void {
    try {
      const sessionData: SessionInfo = {
        uid: user.uid,
        email: user.email,
        lastLogin: Date.now(),
        refreshToken: user.refreshToken || null
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    } catch (error) {
      // Silently fail
    }
  }

  getSession(): SessionInfo | null {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session: SessionInfo = JSON.parse(sessionData);
      
      // Check if session is expired
      const sessionAge = Date.now() - session.lastLogin;
      if (sessionAge > this.maxSessionAge) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      // Silently fail
    }
  }

  isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  async validateCurrentSession(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        
        if (user) {
          const session = this.getSession();
          if (session && session.uid === user.uid) {
            resolve(true);
          } else {
            this.saveSession(user);
            resolve(true);
          }
        } else {
          this.clearSession();
          resolve(false);
        }
      });
    });
  }

  updateSession(updates: Partial<SessionInfo>): void {
    const session = this.getSession();
    if (session) {
      const updatedSession = { ...session, ...updates };
      localStorage.setItem(this.sessionKey, JSON.stringify(updatedSession));
    }
  }
}

export const sessionManager = SessionManager.getInstance();
