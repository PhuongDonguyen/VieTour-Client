import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

const LoginSuccess = () => {
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const userData = searchParams.get('user')
        
        if (userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData))
                
                // Send message to parent window
                if (window.opener) {
                    window.opener.postMessage({ type: 'LOGIN_SUCCESS', user }, '*')
                }
                
                // Close popup after successful login
                setTimeout(() => {
                    window.close()
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