import './App.css'
import { RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext';
import { router } from './routes';
import FloatingContactButtons from './components/FloatingContactButtons';

function App() {
  return (
    <>
      <AuthContextProvider>
        <RouterProvider router={router} />
        <FloatingContactButtons />
      </AuthContextProvider>
    </>
  )
}

export default App 