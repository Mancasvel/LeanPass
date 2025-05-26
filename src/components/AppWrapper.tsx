'use client';

import { useState, useEffect } from 'react';
import AuthForm from './AuthForm';
import Dashboard from './Dashboard';
import Home from './Home';

interface User {
  _id: string;
  email: string;
  name: string;
}

export default function AppWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');

  useEffect(() => {
    // Verificar si hay una sesión activa mediante una petición al servidor
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Intentar hacer una petición autenticada para verificar si hay sesión
      const response = await fetch('/api/subjects', {
        credentials: 'include' // Incluir cookies automáticamente
      });
      
      if (response.ok) {
        // Si la petición es exitosa, hay una sesión activa
        // Obtener información del usuario desde localStorage si existe
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setCurrentView('dashboard');
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('user');
          }
        }
      } else {
        // No hay sesión activa, limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    // Solo guardar el usuario en localStorage, el token ya está en cookies
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout para limpiar la cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setCurrentView('home');
    }
  };

  const handleGoToHome = () => {
    setCurrentView('home');
  };

  const handleGoToDashboard = () => {
    if (user) {
      setCurrentView('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar formulario de autenticación
  if (!user && currentView === 'dashboard') {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">📚 LeanPass</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoToHome}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inicio
              </button>
              
              {user ? (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">Hola, {user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'home' ? <Home /> : <Dashboard />}
    </div>
  );
} 