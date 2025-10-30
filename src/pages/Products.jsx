import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products';

export default function Products() {
  const [sort, setSort] = useState('price-asc');

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [sort]);

  return (
    <div className="products-page">
      <div className="products-toolbar">
        <h1>Productos</h1>
        <div className="sort-controls">
          <label htmlFor="sort">Ordenar por:</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="grid-container">
        {sorted.map((p) => (
          <div key={p.id} className="product">
            <Link to={`/product/${p.id}`} className="product-link">
              <div className="product-image-wrapper">
                <img src={p.image} alt={p.name} />
              </div>
              <h3>{p.name}</h3>
            </Link>
            <p className="price">${Number(p.price).toLocaleString('es-CL')}</p>
            <p className="description">{p.description}</p>
            <Link to={`/product/${p.id}`} className="btn-ver-producto">Ver detalle</Link>
          </div>
        ))}
      </div>
    </div>
  );
}