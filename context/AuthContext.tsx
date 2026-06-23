import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePushToken } from '@/lib/api';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

export type User = {
  id: string;
  email?: string;
  phone?: string;
};

export type Session = {
  user: User;
  access_token: string;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signIn: (phone: string, token: string, user?: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: async () => { },
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedSession = await AsyncStorage.getItem('auth_session');
        if (storedSession) {
          setSession(JSON.parse(storedSession));
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (phone: string, token: string, user?: Partial<User>) => {
    const newSession: Session = {
      user: { id: user?.id || Date.now().toString(), phone, ...user },
      access_token: token,
    };
    setSession(newSession);
    await AsyncStorage.setItem('auth_session', JSON.stringify(newSession));
    
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await updatePushToken(token, pushToken);
      }
    } catch (e) {
      console.log("Failed to register push token", e);
    }
  };

  const signOut = async () => {
    setSession(null);
    await AsyncStorage.removeItem('auth_session');
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
