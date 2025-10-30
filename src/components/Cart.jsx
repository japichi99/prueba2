import React, { useState, useEffect } from "react";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("carrito")) || [];
    setCart(stored);
  }, []);

  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.precio, 0);
    setTotal(sum);
    localStorage.setItem("carrito", JSON.stringify(cart));
  }, [cart]);

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handlePay = () => {
    if (cart.length === 0) {
      alert("Carrito vacío.");
      return;
    }
    if (window.confirm(`¿Deseas pagar $${total}?`)) {
      alert("Compra exitosa ✅");
      clearCart();
    }
  };

  return (
    <div className="cart-modal">
      <h2>Carrito</h2>
      <ul>
        {cart.map((p, i) => (
          <li key={i}>
            {p.nombre} - ${p.precio}
            <button onClick={() => removeItem(i)}>X</button>
          </li>
        ))}
      </ul>
      <p>Total: ${total}</p>
      <button onClick={handlePay}>Pagar</button>
    </div>
  );
}
