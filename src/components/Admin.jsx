import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

function Admin({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [compras, setCompras] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = getSupabase();
    
    // Cargar productos
    const { data: productsData } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // Cargar usuarios
    const { data: usuariosData } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, correo, created_at')
      .order('created_at', { ascending: false });
    if (usuariosData) setUsuarios(usuariosData);

    // Cargar compras con items
    const { data: comprasData, error } = await supabase
      .from('compras')
      .select(`
        id,
        nombre,
        apellido,
        correo,
        total,
        fecha,
        estado,
        direccion,
        indicaciones,
        compra_items(cantidad, producto_nombre, precio_unitario)
      `)
      .order('fecha', { ascending: false });
    
    console.log('Compras cargadas:', comprasData); // Debug
    console.log('Error compras:', error); // Debug
    
    if (comprasData) setCompras(comprasData);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('productos')
      .insert({
        // NO incluyas 'id' aquí, Supabase lo genera automáticamente
        name: newProduct.name,
        price: parseInt(newProduct.price),
        description: newProduct.description,
        image: newProduct.image || 'https://via.placeholder.com/400x400?text=Perfume',
      });

    if (error) {
      alert('Error al agregar: ' + error.message);
      return;
    }

    setNewProduct({ name: '', price: '', description: '', image: '' });
    await loadData();
    alert('✅ Producto agregado exitosamente');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const supabase = getSupabase();
    const { error } = await supabase
      .from('productos')
      .update({
        name: editingProduct.name,
        price: parseInt(editingProduct.price),
        description: editingProduct.description,
        image: editingProduct.image,
      })
      .eq('id', editingProduct.id);
    if (error) return alert('Error al actualizar: ' + error.message);
    setEditingProduct(null);
    await loadData();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) return alert('Error al eliminar: ' + error.message);
    await loadData();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;

    const supabase = getSupabase(); // ← agregar esta línea

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    await loadData();
    alert('🗑️ Usuario eliminado');
  };

  const handleUpdateEstadoCompra = async (compraId, nuevoEstado) => {
    const supabase = getSupabase(); // ← agregar esta línea

    const { error } = await supabase
      .from('compras')
      .update({ estado: nuevoEstado })
      .eq('id', compraId);

    if (error) {
      alert('Error al actualizar estado: ' + error.message);
      return;
    }

    await loadData();
  };

  const renderProducts = () => (
    <div className="admin-section">
      <h2>Gestión de Productos</h2>

      {/* Formulario agregar producto */}
      <div className="admin-form-container">
        <h3>Agregar Nuevo Producto</h3>
        <form onSubmit={handleAddProduct} className="admin-form">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripción"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="URL de la imagen"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          />
          <button type="submit" className="admin-btn-add">+ Agregar Producto</button>
        </form>
      </div>

      {/* Modal editar producto */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Producto</h3>
            <form onSubmit={handleUpdateProduct} className="admin-form">
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
              />
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                required
              />
              <textarea
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                required
              />
              <input
                type="url"
                value={editingProduct.image}
                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit" className="admin-btn-save">Guardar Cambios</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="admin-btn-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <img src={product.image} alt={product.name} className="admin-product-img" />
                </td>
                <td>{product.name}</td>
                <td>${product.price.toLocaleString('es-CL')}</td>
                <td className="admin-description">{product.description}</td>
                <td>
                  <button onClick={() => setEditingProduct(product)} className="admin-btn-edit">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="admin-btn-delete">
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-section">
      <h2>Gestión de Usuarios</h2>
      <p className="admin-stats">Total de usuarios registrados: <strong>{usuarios.length}</strong></p>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.apellido}</td>
                <td>{user.correo}</td>
                <td>{new Date(user.created_at).toLocaleDateString('es-CL')}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)} className="admin-btn-delete">
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompras = () => (
    <div className="admin-section">
      <h2>Historial de Compras</h2>
      <p className="admin-stats">
        Total de compras: <strong>{compras.length}</strong> | 
        Ingresos totales: <strong>${compras.reduce((sum, c) => sum + c.total, 0).toLocaleString('es-CL')}</strong>
      </p>

      {compras.length === 0 ? (
        <p className="admin-empty">No hay compras registradas aún</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(compra => (
                <tr key={compra.id}>
                  <td>#{compra.id}</td>
                  <td>{compra.nombre} {compra.apellido}</td>
                  <td>{compra.correo}</td>
                  <td className="admin-description">{compra.direccion}</td>
                  <td>
                    {compra.compra_items?.map((item, i) => (
                      <div key={i} className="compra-item-detail">
                        {item.cantidad}x {item.producto_nombre} (${item.precio_unitario})
                      </div>
                    ))}
                  </td>
                  <td className="admin-total">${compra.total.toLocaleString('es-CL')}</td>
                  <td>{new Date(compra.fecha).toLocaleString('es-CL')}</td>
                  <td>
                    <select
                      value={compra.estado}
                      onChange={(e) => handleUpdateEstadoCompra(compra.id, e.target.value)}
                      className={`estado-select estado-${compra.estado}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    {compra.indicaciones && (
                      <button 
                        className="admin-btn-info"
                        onClick={() => alert('Indicaciones:\n' + compra.indicaciones)}
                      >
                        ℹ️ Ver Indicaciones
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Panel de Administración</h1>
        <button onClick={onLogout} className="admin-logout">Cerrar Sesión</button>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setActiveTab('products')}
        >
          📦 Productos
        </button>
        <button
          className={activeTab === 'users' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuarios
        </button>
        <button
          className={activeTab === 'compras' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setActiveTab('compras')}
        >
          📊 Compras
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'compras' && renderCompras()}
      </div>
    </div>
  );
}

export default Admin;