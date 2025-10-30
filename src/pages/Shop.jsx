import React from "react";
import ProductGrid from "../components/ProductGrid";
import { productos } from "../data/productos";

export default function Shop() {
  return (
    <main>
      <h1>Todos los Productos</h1>
      <ProductGrid productos={productos} />
    </main>
  );
}
