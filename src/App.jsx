import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext';

const router = createBrowserRouter([
  {
    element: <></>,
    path: '/',
  }
])

function App() {
  return (
    <>
      <AuthContextProvider>
        <RouterProvider router={router}>
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            Hello Tailwind!
          </div>
        </RouterProvider>
      </AuthContextProvider>
    </>
  )
}

export default App 