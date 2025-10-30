import { createContext, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("usuarioActual")) || null);

  const login = (usuario) => {
    setUser(usuario);
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuarioActual");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

