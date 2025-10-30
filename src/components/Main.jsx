import React, { useState } from "react";
import Popup from "./Popup";
import ProductCard from "./ProductCard";
import { productos } from "../data/productos";

export default function Main() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  const handleAddToCart = (producto) => {
    setPopupContent(`${producto.nombre} agregado al carrito`);
    setShowPopup(true);
  };

  const handleClosePopup = () => setShowPopup(false);

  return (
    <div>
      <h1>Productos Destacados</h1>
      <div className="grid-container">
        {productos.slice(0, 6).map((p) => (
          <ProductCard key={p.id} producto={p} onAdd={() => handleAddToCart(p)} />
        ))}
      </div>

      <Popup show={showPopup} onClose={handleClosePopup} title="Notificación">
        <p>{popupContent}</p>
        <button onClick={handleClosePopup}>Cerrar</button>
      </Popup>
    </div>
  );
}
