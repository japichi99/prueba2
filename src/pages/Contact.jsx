import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulación de envío de formulario
    console.log('Formulario enviado:', formData);
    setStatus('¡Mensaje enviado con éxito! Te contactaremos pronto.');
    
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      message: ''
    });

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      setStatus('');
    }, 3000);
  };

  return (
    <div className="contact">
      <h1>Contáctanos</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Mensaje:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <button type="submit">Enviar</button>
        
        {status && <p className="status-message">{status}</p>}
      </form>
    </div>
  );
}

export default Contact;
