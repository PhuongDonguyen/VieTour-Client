import './App.css'
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { router } from './routes';
import FloatingContactButtons from './components/FloatingContactButtons';

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <FloatingContactButtons />
      </AuthProvider>
    </>
  )
}

export default App 