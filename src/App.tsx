import './App.css'
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { router } from './routes';
import FloatingContactButtons from './components/FloatingContactButtons';
import { Toaster } from 'sonner'; // Uncomment if you want to use Toaster

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <FloatingContactButtons />
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App 