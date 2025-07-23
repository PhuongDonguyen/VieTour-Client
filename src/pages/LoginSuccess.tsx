import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";

const LoginSuccess = () => {
    const [searchParams] = useSearchParams()
    const { login } = useAuth();

    useEffect(() => {
        const userData = searchParams.get('user')
        
        if (userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData))
                
                /* The below code is for testing open with popup */
                // Send message to parent window
                // if (window.opener) {
                //     window.opener.postMessage({ type: 'LOGIN_SUCCESS', user }, '*')
                // }

                login(user);
                
                // Close popup after successful login
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [searchParams])

    return (
        <>
        </>
    )
}

export default LoginSuccess;