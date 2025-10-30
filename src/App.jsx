import React, { useState, useEffect } from 'react';
import './App.css';
import ProductCard from './components/ProductCard';
import CartItem from './components/CartItem';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import Home from './components/Home';
import { getSupabase } from './lib/supabase';

function App() {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [allProducts, setAllProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, text: '' });
  // const supabase = getSupabase(); ← ELIMINA ESTA LÍNEA

  useEffect(() => {
    const loadInitialData = async () => {
      const supabase = getSupabase();
      
      // Cargar productos
      const { data: productsData } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });
  
      console.log('Productos cargados:', productsData);
  
      if (productsData && productsData.length > 0) {
        setAllProducts(productsData);
      }

      // Validar usuario desde localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Verificar que el usuario existe en Supabase
          if (parsedUser.id) {
            const { data: validUser, error } = await supabase
              .from('usuarios')
              .select('id, nombre, apellido, correo')
              .eq('id', parsedUser.id)
              .single();

            if (validUser && !error) {
              setUser({
                id: validUser.id,
                name: `${validUser.nombre} ${validUser.apellido}`,
                email: validUser.correo
              });
            } else {
              // Usuario no válido, limpiar localStorage
              console.warn('Usuario guardado no existe en DB, limpiando...');
              localStorage.removeItem('currentUser');
            }
          } else {
            // Usuario sin ID, limpiar
            console.warn('Usuario sin ID, limpiando localStorage...');
            localStorage.removeItem('currentUser');
          }
        } catch (err) {
          console.error('Error al parsear usuario:', err);
          localStorage.removeItem('currentUser');
        }
      }
    };

    loadInitialData();
  }, []);

  const handleLogin = async (userData) => {
    const supabase = getSupabase();

    // Buscar usuario en Supabase
    const { data: existingUser, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', userData.email)
      .single();

    if (error && error.code !== 'PGRST116') {
      alert('Error al verificar usuario: ' + error.message);
      return;
    }

    let finalUser;
    if (existingUser) {
      finalUser = {
        id: existingUser.id,
        name: `${existingUser.nombre} ${existingUser.apellido}`,
        email: existingUser.correo
      };
    } else {
      // Si no existe en Supabase, crearlo (compatibilidad con usuarios viejos)
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nombre: userData.name.split(' ')[0],
          apellido: userData.name.split(' ').slice(1).join(' ') || '',
          correo: userData.email,
          contrasena: 'migrated'
        })
        .select()
        .single();

      if (insertError) {
        alert('Error al crear usuario: ' + insertError.message);
        return;
      }

      finalUser = {
        id: newUser.id,
        name: userData.name,
        email: newUser.correo
      };
    }

    setUser(finalUser);
    localStorage.setItem('currentUser', JSON.stringify(finalUser));
    
    // Si es admin, ir al panel
    if (finalUser.email === 'admin@perfumeria.com') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  };

  const handleRegister = async (userData) => {
    const supabase = getSupabase();
    
    try {
      // Verificar si el email ya existe
      const { data: existing } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', userData.email)
        .single();

      if (existing) {
        alert('Este email ya está registrado. Inicia sesión en su lugar.');
        setAuthMode('login');
        return;
      }

      // Insertar nuevo usuario en Supabase
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: userData.name.split(' ')[0],
          apellido: userData.name.split(' ').slice(1).join(' ') || '',
          correo: userData.email,
          contrasena: userData.password
        })
        .select()
        .single();

      if (error) {
        console.error('Error al registrar:', error);
        alert('Error al registrar: ' + error.message);
        return;
      }

      // Guardar usuario con el ID de Supabase
      const userWithId = {
        id: newUser.id,
        name: userData.name,
        email: newUser.correo
      };

      console.log('Usuario registrado:', userWithId); // Debug

      setUser(userWithId);
      localStorage.setItem('currentUser', JSON.stringify(userWithId));
      setCurrentPage('home');
      alert('¡Cuenta creada exitosamente!');
    } catch (err) {
      console.error('Error en registro:', err);
      alert('Error al crear cuenta: ' + err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear()
    setCart([]);
    setCurrentPage('home');
  };

  const addToCart = (product) => {
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      setAuthMode('login');
      setCurrentPage('login');
      return;
    }

    if (user.email === 'admin@perfumeria.com') {
      alert('Los administradores no pueden comprar productos');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const showToast = (text) => {
    setToast({ show: true, text });
    setTimeout(() => setToast({ show: false, text: '' }), 3000);
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) {
      alert('El carrito está vacío o no has iniciado sesión');
      return;
    }

    const supabase = getSupabase();

    try {
      console.log('Usuario actual:', user);

      if (!user.id) {
        alert('Error: usuario sin ID. Cierra sesión y vuelve a registrarte.');
        return;
      }

      const [nombre, ...resto] = (user.name || '').split(' ');
      const apellido = resto.join(' ') || '';

      // 1. PRIMERO: Crear la compra
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert({
          usuario_id: user.id,
          nombre,
          apellido,
          correo: user.email,
          total: getTotalPrice(),
          direccion: 'Por definir',
          indicaciones: ''
        })
        .select()
        .single();

      if (compraError) {
        console.error('Error al crear compra:', compraError);
        throw compraError;
      }

      console.log('Compra creada con ID:', compra.id); // ← Debug importante

      // 2. DESPUÉS: Crear los items usando el ID de la compra recién creada
      const itemsPayload = cart.map(it => ({
        compra_id: compra.id, // ← Este ID debe existir
        producto_id: it.id,
        producto_nombre: it.name,
        cantidad: it.quantity,
        precio_unitario: it.price
      }));

      console.log('Items a insertar:', itemsPayload); // ← Debug

      const { error: itemsError } = await supabase
        .from('compra_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('Error al guardar items:', itemsError);
        throw itemsError;
      }

      alert(`¡Gracias por tu compra, ${user.name}! Total: $${getTotalPrice().toLocaleString('es-CL')}`);
      setCart([]);
      setCurrentPage('products');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error al procesar la compra: ' + (err?.message || err));
    }
  };

  const renderPage = () => {
    // Panel de Admin
    if (user && user.email === 'admin@perfumeria.com' && currentPage === 'admin') {
      return (
        <Admin 
          onLogout={handleLogout} 
          products={allProducts}
          onProductsChange={(newProducts) => {
            setAllProducts(newProducts);
            localStorage.setItem('products', JSON.stringify(newProducts));
          }}
        />
      );
    }

    // Login/Register
    if (!user && (currentPage === 'login' || currentPage === 'register')) {
      if (authMode === 'login') {
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />;
      } else {
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />;
      }
    }

    switch(currentPage) {
      case 'home':
        return <Home products={allProducts} onAddToCart={addToCart} />;
    
      case 'products':
        return (
          <div>
            <h1>Nuestros Productos</h1>
            <div className="grid-container">
              {allProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        );

      case 'cart':
        if (!user) {
          return (
            <div className="empty-cart-page">
              <h2>Debes iniciar sesión para ver tu carrito</h2>
              <button className="shop-now-button" onClick={() => { setAuthMode('login'); setCurrentPage('login'); }}>
                Iniciar Sesión
              </button>
            </div>
          );
        }

        return (
          <div className="cart-page">
            <h1>🛒 Mi Carrito de Compras</h1>
            
            {cart.length === 0 ? (
              <div className="empty-cart-page">
                <div className="empty-cart-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Agrega algunos productos para comenzar!</p>
                <button 
                  className="shop-now-button"
                  onClick={() => setCurrentPage('products')}
                >
                  Ir a Productos
                </button>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-items-list">
                  {cart.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
                
                <div className="cart-summary">
                  <h2>Resumen del Pedido</h2>
                  <div className="summary-row">
                    <span>Subtotal ({getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}):</span>
                    <span>${getTotalPrice().toLocaleString('es-CL')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envío:</span>
                    <span className="free-shipping">GRATIS</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="total-highlight">
                    <span className="total-label">Total</span>
                    <span className="total-value">${getTotalPrice().toLocaleString('es-CL')}</span>
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceder al Pago
                  </button>
                  <button 
                    className="continue-shopping-btn"
                    onClick={() => setCurrentPage('products')}
                  >
                    Seguir Comprando
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="contact-page">
            <h1>Contáctanos</h1>
            <p className="intro">¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para atenderte.</p>
            
            <div className="contact-info">
              <div className="contact-item">
                <h3>📧 Email</h3>
                <p>info@perfumeriasahur.com</p>
                <p>ventas@perfumeriasahur.com</p>
              </div>
              
              <div className="contact-item">
                <h3>📱 Teléfono</h3>
                <p>+56 9 1234 5678</p>
                <p>Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                <p>Sábados: 10:00 AM - 6:00 PM</p>
              </div>
              
              <div className="contact-item">
                <h3>📍 Dirección</h3>
                <p>Av. Principal 123, Santiago</p>
                <p>Región Metropolitana, Chile</p>
              </div>
              
              <div className="contact-item">
                <h3>🌐 Redes Sociales</h3>
                <p>Instagram: @perfumeriasahur</p>
                <p>Facebook: Perfumería Sahur</p>
                <p>WhatsApp: +56 9 1234 5678</p>
              </div>
            </div>
            
            <div className="business-hours">
              <h3>Horarios de Atención</h3>
              <p><strong>Lunes - Viernes:</strong> 9:00 AM - 7:00 PM</p>
              <p><strong>Sábados:</strong> 10:00 AM - 6:00 PM</p>
              <p><strong>Domingos:</strong> Cerrado</p>
            </div>
          </div>
        );

      default:
        return <div>Página no encontrada</div>;
    }
  };

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <div className="logo-container">
            <img 
              src="/longa.png" 
              alt="Perfumería Sahur" 
              className="logo-img"
            />
          </div>
          <nav>
            <ul>
              {user && user.email === 'admin@perfumeria.com' ? (
                <>
                  <li>
                    <button onClick={() => setCurrentPage('admin')} className="admin-nav-btn">
                      🛠️ Panel Admin
                    </button>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
                      Inicio
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('products'); }}>
                      Productos
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>
                      Contacto
                    </a>
                  </li>
                  {user ? (
                    <>
                      <li>
                        <button onClick={() => setCurrentPage('cart')} className="cart-button">
                          🛒 Carrito ({getTotalItems()})
                        </button>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="logout-button">
                          👤 Cerrar Sesión ({user.name})
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <button onClick={() => { setAuthMode('login'); setCurrentPage('login'); }} className="login-button">
                        🔐 Iniciar Sesión
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main style={{ padding: '20px', minHeight: '70vh' }}>
        {renderPage()}
      </main>

      {toast.show && <div className="toast">{toast.text}</div>}

      <footer className="site-footer">
        <div className="footer-content">
          <p className="footer-phrase">"Fragancias que cuentan tu historia."</p>

          <div className="footer-columns">
            <div className="footer-col">
              <h4>Contacto</h4>
              <ul>
                <li>📧 contacto@perfumeriasahur.fake</li>
                <li>📞 +56 9 9876 5432</li>
                <li>📍 Av. Falsa 123, Santiago</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Redes Sociales</h4>
              <div className="social-links">
                <a href="#" aria-label="Instagram">📸 Instagram</a>
                <a href="#" aria-label="Facebook">📘 Facebook</a>
                <a href="#" aria-label="TikTok">🎵 TikTok</a>
                <a href="#" aria-label="X">🐦 X</a>
                <a href="#" aria-label="YouTube">▶️ YouTube</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Horarios</h4>
              <ul>
                <li>Lun–Vie: 9:00–19:00</li>
                <li>Sáb: 10:00–18:00</li>
                <li>Dom: Cerrado</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2025 Perfumería Sahur. Sitio demostración.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;