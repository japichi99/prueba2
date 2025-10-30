import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const supabase = getSupabase();

    // Verificar en Supabase
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .eq('contrasena', password) // En producción usa bcrypt
      .single();

    if (error || !user) {
      alert('Email o contraseña incorrectos');
      return;
    }

    onLogin({ 
      id: user.id,
      name: `${user.nombre} ${user.apellido}`, 
      email: user.correo 
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-btn">Iniciar Sesión</button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <button onClick={onSwitchToRegister}>Regístrate aquí</button>
        </p>
      </div>
    </div>
  );
}

export default Login;