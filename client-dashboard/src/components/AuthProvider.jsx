import { AuthContext } from './authContext';
import {
  useCurrentAdminQuery,
  useLoginAdminMutation,
  useLogoutAdminMutation,
} from '../hooks/useAdminQueries';

export function AuthProvider({ children }) {
  const currentAdminQuery = useCurrentAdminQuery();
  const loginMutation = useLoginAdminMutation();
  const logoutMutation = useLogoutAdminMutation();

  const login = async (email, password) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ admin: currentAdminQuery.data || null, loading: currentAdminQuery.isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
