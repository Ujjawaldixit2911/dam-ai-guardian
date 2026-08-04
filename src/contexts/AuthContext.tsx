import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean | string>;
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  forceGuestLogin: (email: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts fallback
const demoAccounts = [
  {
    id: '1',
    email: 'admin@dam.com',
    password: 'demo123',
    name: 'abc',
    role: 'Project Guide',
    organization: 'IMS Engineering College',
  },
  {
    id: '2',
    email: 'engineer@dam.com',
    password: 'demo123',
    name: 'pqr',
    role: 'Safety Engineer',
    organization: 'Central Water Commission',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored token and fetch profile
    const initAuth = async () => {
      const token = localStorage.getItem('dam_token');
      if (token) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            const userData = response.data;
            setCurrentUser({
              id: userData.id,
              name: userData.username,
              email: userData.email,
              role: userData.role,
              phone: userData.phoneNumber,
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
          // Fallback to local storage if API fails but we had a session
          const storedUser = localStorage.getItem('dam_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
        }
      } else {
        // No token, but maybe a mock session exists
        const storedUser = localStorage.getItem('dam_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean | string> => {
    try {
      // Try backend authentication first
      const response = await authService.login(email, password);
      if (response.success) {
        const { user, token } = response.data;
        
        const mappedUser: User = {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          phone: user.phoneNumber,
        };
        
        setCurrentUser(mappedUser);
        localStorage.setItem('dam_user', JSON.stringify(mappedUser));
        localStorage.setItem('dam_token', token);
        return true;
      }
    } catch (error: any) {
      console.error('Backend login failed, falling back to mock auth if applicable', error);
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message.includes('pending')) {
          return 'pending';
        }
      }
    }

    // Check demo accounts as fallback
    const account = demoAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (account) {
      const user: User = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        organization: account.organization,
      };
      setCurrentUser(user);
      localStorage.setItem('dam_user', JSON.stringify(user));
      return true;
    }

    // Check if user exists in localStorage (for local signup users)
    const users = JSON.parse(localStorage.getItem('dam_users') || '[]');
    const existingUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (existingUser) {
      const user: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        organization: existingUser.organization,
        phone: existingUser.phone,
      };
      setCurrentUser(user);
      localStorage.setItem('dam_user', JSON.stringify(user));
      return true;
    }

    // Fallback: Login as a Visitor for ANY unregistered ID
    const visitorUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0] || 'Visitor',
      email: email,
      role: 'Visitor',
      organization: 'Guest Access',
    };
    setCurrentUser(visitorUser);
    localStorage.setItem('dam_user', JSON.stringify(visitorUser));
    
    return 'visitor';
  };

  const forceGuestLogin = (email: string, role: string) => {
    const guestUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0] || 'Guest',
      email: email,
      role: role,
      organization: 'Temporary Access',
    };
    setCurrentUser(guestUser);
    localStorage.setItem('dam_user', JSON.stringify(guestUser));
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    try {
      // Try backend registration first
      const response = await authService.register({
        username: userData.name || userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phone,
        role: userData.role || 'viewer'
      });
      
      if (response.success) {
        const { user, token } = response.data;
        const mappedUser: User = {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          phone: userData.phone,
        };
        
        setCurrentUser(mappedUser);
        localStorage.setItem('dam_user', JSON.stringify(mappedUser));
        localStorage.setItem('dam_token', token);
        return true;
      }
    } catch (error) {
      console.error('Backend signup failed, falling back to local storage', error);
    }

    // Fallback to local storage
    const users = JSON.parse(localStorage.getItem('dam_users') || '[]');
    
    // Check if email already exists
    if (users.some((u: any) => u.email === userData.email)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
    };

    users.push(newUser);
    localStorage.setItem('dam_users', JSON.stringify(users));

    const user: User = {
      id: newUser.id,
      name: newUser.name || '',
      email: newUser.email,
      role: newUser.role || 'User',
      organization: newUser.organization,
      phone: newUser.phone,
    };

    setCurrentUser(user);
    localStorage.setItem('dam_user', JSON.stringify(user));

    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const email = firebaseUser.email || '';
      const name = firebaseUser.displayName || email.split('@')[0];
      const uid = firebaseUser.uid;
      const dummyPassword = `GoogleAuth#${uid}`;

      const assignedRole = email === 'ujjawaldixit06@gmail.com' ? 'admin' : 'Engineer';
      const assignedStatus = 'approved'; // Always approved for Firebase auth

      let loginSuccess = false;
      try {
        // Try backend login first
        const loginRes = await authService.login(email, dummyPassword);
        if (loginRes.success) {
          const { user: backendUser, token } = loginRes.data;
          const mappedUser: User = {
            id: backendUser.id,
            name: backendUser.username,
            email: backendUser.email,
            role: backendUser.role,
            phone: backendUser.phoneNumber,
          };
          setCurrentUser(mappedUser);
          localStorage.setItem('dam_user', JSON.stringify(mappedUser));
          localStorage.setItem('dam_token', token);
          loginSuccess = true;
          return true;
        }
      } catch (backendError: any) {
        console.error("Backend login failed for Google Auth, attempting backend register or fallback", backendError);
        if (backendError.response && backendError.response.data && backendError.response.data.message) {
          if (backendError.response.data.message.includes('pending')) {
            import('sonner').then(({ toast }) => toast.error(backendError.response.data.message));
            return false;
          }
        }
      }

      if (!loginSuccess) {
        try {
          const signupRes = await authService.register({
            username: name,
            email: email,
            password: dummyPassword,
            role: assignedRole, 
            status: assignedStatus 
          });

          if (signupRes.success) {
            if (assignedStatus === 'pending') {
              import('sonner').then(({ toast }) => toast.error("Account created but pending admin approval."));
              return false;
            }
            const { user: backendUser, token } = signupRes.data;
            const mappedUser: User = {
              id: backendUser.id,
              name: backendUser.username,
              email: backendUser.email,
              role: backendUser.role,
              phone: backendUser.phoneNumber,
            };
            setCurrentUser(mappedUser);
            localStorage.setItem('dam_user', JSON.stringify(mappedUser));
            localStorage.setItem('dam_token', token);
            return true;
          }
        } catch (registerError) {
           console.error("Backend register failed for Google Auth, using local storage fallback", registerError);
           
           if (assignedStatus === 'pending') {
             import('sonner').then(({ toast }) => toast.error("Account created but pending admin approval."));
             return false;
           }

           // Fallback to local storage
           const mappedUser: User = {
              id: uid,
              name: name,
              email: email,
              role: assignedRole,
           };
           setCurrentUser(mappedUser);
           localStorage.setItem('dam_user', JSON.stringify(mappedUser));
           // generate a fake token
           localStorage.setItem('dam_token', `fake-google-token-${uid}`);
           return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error during Google Sign In popup", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dam_user');
    localStorage.removeItem('dam_token');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (currentUser) {
      try {
        // Try backend update first
        await authService.updateProfile({
          username: updates.name,
          email: updates.email,
          phoneNumber: updates.phone
        });
      } catch (error) {
        console.error('Failed to update profile on backend', error);
      }
      
      // Update local state regardless
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('dam_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
