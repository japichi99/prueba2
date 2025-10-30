import React, { useState, useEffect } from 'react';

function Home({ products, onAddToCart }) {
  const masVendidos = products.slice(0, 5);
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
    <div>
      <section className="hero-section">
        <h1>Bienvenido a Perfumería Sahur</h1>
        <p className="hero-subtitle">Descubre nuestras fragancias exclusivas</p>
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
                <button 
                  className="btn-ver-producto"
                  onClick={() => onAddToCart(producto)}
                >
                  Agregar al Carrito
                </button>
              </div>
            ))}
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={handleNext}>
            ❯
          </button>
        </div>

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

      {/* Video de perfumes (debajo de los Más Vendidos) */}
      <section className="home-video-section">
        <div className="home-video-frame">
          <iframe
            className="home-video"
            src="https://www.youtube.com/embed/I1f-84k3iuk?autoplay=1&mute=1&loop=1&playlist=I1f-84k3iuk&controls=1&modestbranding=1&rel=0"
            title="Video Perfumes 1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      {/* Segundo video (debajo del anterior) */}
      <section className="home-video-section">
        <div className="home-video-frame">
          <iframe
            className="home-video"
            src="https://www.youtube.com/embed/zyv5wv5JB1o?autoplay=1&mute=1&loop=1&playlist=zyv5wv5JB1o&controls=1&modestbranding=1&rel=0"
            title="Video Perfumes 2"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}

export default Home;