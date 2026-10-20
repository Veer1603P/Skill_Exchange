import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, getRequests } from './api';

const SESSION_KEY = 'skillexchange_session_v1';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false); // true once the saved login has been checked
  const [pending, setPending] = useState(0); // incoming requests waiting for a reply

  // Restore the saved login when the app starts
  useEffect(() => {
    setReady(true);
  }, []);

  // setUser(userObject) logs in / updates the user, setUser(null) logs out
  const setUser = useCallback((u) => {
    setUserState(u);
    const op = u ? AsyncStorage.setItem(SESSION_KEY, u.id) : AsyncStorage.removeItem(SESSION_KEY);
    op.catch(() => {});
  }, []);

  const refreshPending = useCallback(async () => {
    if (!user) {
      setPending(0);
      return;
    }
    try {
      const reqs = await getRequests(user.id);
      setPending(reqs.filter((r) => r.toUser === user.id && r.status === 'PENDING').length);
    } catch (e) {
      // keep the old count
    }
  }, [user]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  return (
    <AuthContext.Provider value={{ user, setUser, ready, pending, refreshPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
