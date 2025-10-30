import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productos } from "../data/productos";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const masVendidos = productos.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-avanzar cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % masVendidos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [masVendidos.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? masVendidos.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % masVendidos.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <main>
      <section className="hero">
        <h1>Perfumes Sahur</h1>
        <p>Las mejores fragancias a un clic de distancia</p>
        <Link to="/shop" className="btn-hero">Ver Productos</Link>
      </section>

      {/* Carrusel de Más Vendidos */}
      <section className="mas-vendidos-section">
        <h2>🔥 Los Más Vendidos</h2>
        
        <div className="carousel-container">
          <button className="carousel-btn carousel-btn-prev" onClick={handlePrev}>
            ❮
          </button>

          <div className="carousel-track">
            {masVendidos.map((producto, index) => (
              <div
                key={producto.id}
                className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%)`,
                }}
              >
                <div className="bestseller-badge">⭐ MÁS VENDIDO</div>
                <div className="product-image-wrapper">
                  <img src={producto.image} alt={producto.name} />
                </div>
                <h3>{producto.name}</h3>
                <p className="price">${producto.price.toLocaleString('es-CL')}</p>
                <p className="description">{producto.description}</p>
                <Link to="/shop" className="btn-ver-producto">
                  Ver Producto
                </Link>
              </div>
            ))}
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={handleNext}>
            ❯
          </button>
        </div>

        {/* Indicadores */}
        <div className="carousel-dots">
          {masVendidos.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
