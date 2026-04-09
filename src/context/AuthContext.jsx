import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    // Initialize demo users if no users exist
    const existingUsers = localStorage.getItem('equipshare_users');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: '1',
          fullName: 'Demo User',
          email: 'demo@example.com',
          password: 'TestPass123',
          phone: '+966 50 1234567',
          role: 'renter', // 'admin', 'lender', or 'renter'
          createdAt: new Date().toISOString(),
          verified: true,
          canRent: true,
          canLend: true,
          rating: 4.8,
          reviews: 12,
          rentalHistory: [],
          listings: []
        },
        {
          id: '99', // Admin ID
          fullName: 'Platform Admin',
          email: 'admin@equipshare.com',
          password: 'AdminPass123',
          phone: '+966 50 9999999',
          role: 'admin',
          createdAt: new Date().toISOString(),
          verified: true,
          canRent: false,
          canLend: false,
          rating: 0,
          reviews: 0,
          rentalHistory: [],
          listings: []
        }
      ];
      localStorage.setItem('equipshare_users', JSON.stringify(demoUsers));
    }

    const storedUser = localStorage.getItem('equipshare_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  // Get all users from localStorage
  const getAllUsers = useCallback(() => {
    const users = localStorage.getItem('equipshare_users');
    return users ? JSON.parse(users) : [];
  }, []);

  // Save user to localStorage
  const saveUser = useCallback((userData) => {
    localStorage.setItem('equipshare_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Register new user
  const signup = useCallback((userData) => {
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'renter', // Default to renter if not specified
      createdAt: new Date().toISOString(),
      verified: false,
      canRent: true,
      canLend: userData.role !== 'admin', // Admins can't rent/lend
      rating: 0,
      reviews: 0,
      rentalHistory: [],
      listings: []
    };

    // Store user in users array
    users.push(newUser);
    localStorage.setItem('equipshare_users', JSON.stringify(users));

    // Set current user (without password)
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    saveUser(userWithoutPassword);

    return newUser;
  }, [getAllUsers, saveUser]);

  // Login user
  const signin = useCallback((email, password) => {
    const users = getAllUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      throw new Error('User not found');
    }

    if (foundUser.password !== password) {
      throw new Error('Invalid password');
    }

    // Ensure user has a role (for backward compatibility)
    const userWithRole = {
      ...foundUser,
      role: foundUser.role || 'renter'
    };

    // Update user with role if missing
    if (!foundUser.role) {
      const userIndex = users.findIndex(u => u.id === foundUser.id);
      if (userIndex !== -1) {
        users[userIndex] = userWithRole;
        localStorage.setItem('equipshare_users', JSON.stringify(users));
      }
    }

    // Set current user (without password)
    const userWithoutPassword = { ...userWithRole };
    delete userWithoutPassword.password;
    saveUser(userWithoutPassword);

    return userWithRole;
  }, [getAllUsers, saveUser]);

  // Logout user
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('equipshare_user');
  }, []);

  // Update user profile
  const updateUser = useCallback((updatedData) => {
    if (!user) return;

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedData };
      localStorage.setItem('equipshare_users', JSON.stringify(users));

      const updatedUserWithoutPassword = { ...users[userIndex] };
      delete updatedUserWithoutPassword.password;
      saveUser(updatedUserWithoutPassword);
    }
  }, [user, getAllUsers, saveUser]);

  const value = {
    user,
    loading,
    signup,
    signin,
    logout,
    updateUser,
    getAllUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
