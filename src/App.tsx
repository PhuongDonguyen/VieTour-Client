import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext';
import Home from './pages/Home';

const router = createBrowserRouter([
  {
    element: <Home />,
    path: '/home',
  }
])

function App() {
  return (
    <>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </>
  )
}

export default App 