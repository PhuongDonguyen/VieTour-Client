import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const LoginSuccess = () => {
    const [searchParams] = useSearchParams()
    const { login } = useAuth()

    useEffect(() => {
        const userData = searchParams.get('user')
        
        if (userData) {
          console.log("yess");
            try {
                const user = JSON.parse(decodeURIComponent(userData))
                login(user)
                
                // Close popup after successful login
                setTimeout(() => {
                    window.close()
                }, 1000)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [searchParams, login])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thành công!</h2>
                <p className="text-gray-600">Đang chuyển hướng...</p>
            </div>
        </div>
    )
}

export default LoginSuccess;