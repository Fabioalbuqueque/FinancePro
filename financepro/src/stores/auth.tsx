import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  login as firebaseLogin,
  register as firebaseRegister,
  logout as firebaseLogout,
  subscribeAuth,
} from '../services/firebase';

interface User {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
  };
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribir a mudanças no estado de autenticação do Firebase
    const unsubscribe = subscribeAuth(async (firebaseUser, idToken) => {
      if (firebaseUser && idToken) {
        try {
          // Salvar token na API
          await api.setToken(idToken);

          // Obter perfil do backend
          const profile = await api.getMe() as User;
          setUser(profile);
        } catch (err) {
          console.log('Backend offline ou inacessível, utilizando dados locais do Firebase:', err);
          setUser({
            _id: firebaseUser.uid,
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email || '',
            preferences: { theme: 'system' },
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      await firebaseLogin(email, pass);
      // O estado será atualizado automaticamente pelo subscribeAuth
    } catch (err: any) {
      throw new Error(err.message || 'Falha ao autenticar');
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      await firebaseRegister(name, email, pass);
      // Desconectar o usuário imediatamente após cadastrar,
      // para que ele seja redirecionado para a tela de login
      await firebaseLogout();
      await api.setToken(null);
      setUser(null);
    } catch (err: any) {
      throw new Error(err.message || 'Falha ao criar conta');
    }
  };

  const signOut = async () => {
    await firebaseLogout();
    await api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
