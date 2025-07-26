import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log('ProtectedRoute user:', user);

    if (loading) return <div>Loading...</div>;

    if (!user) navigate('/login');
    return <>{children}</>;
};
