import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        // setTimeout(() => {
        //     toast.error('Vui lòng đăng nhập để truy cập trang này.');
        //     navigate('/');
        // }, 100);
        setTimeout(() => {
            navigate('/');
        }, 100);
        return;
    }

    return <>{children}</>;
};
