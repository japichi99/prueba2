import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("carrito")) || [];
    setCart(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto) => setCart(prev => [...prev, producto]);
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

