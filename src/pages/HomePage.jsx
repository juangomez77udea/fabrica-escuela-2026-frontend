import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './HomePage.css'

const HomePage = () => {
      const { isAuthenticated } = useAuth()

      return (
            <div className="home-page">
                  <section className="hero">
                        <div className="container">
                              <div className="hero-content">
                                    <h1>💰 Gestión Financiera Personal</h1>
                                    <p className="hero-subtitle">Toma control de tus finanzas y construye un futuro más próspero</p>

                                    <div className="hero-description">
                                          <p>
                                                Nuestra aplicación te ayuda a registrar, analizar y optimizar todos tus movimientos financieros en un solo lugar.
                                          </p>
                                    </div>

                                    {!isAuthenticated && (
                                          <div className="hero-actions">
                                                <Link to="/register" className="btn btn-primary">
                                                      Comenzar Ahora
                                                </Link>
                                                <Link to="/login" className="btn btn-secondary">
                                                      Ya tengo cuenta
                                                </Link>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </section>

                  <section className="features">
                        <div className="container">
                              <h2>Características Principales</h2>

                              <div className="features-grid">
                                    <div className="feature-card">
                                          <div className="feature-icon">📝</div>
                                          <h3>Registro de Transacciones</h3>
                                          <p>Registra todos tus ingresos y gastos de manera fácil y rápida. Categoriza cada transacción para un mejor análisis.</p>
                                    </div>

                                    <div className="feature-card">
                                          <div className="feature-icon">📊</div>
                                          <h3>Análisis Detallado</h3>
                                          <p>Visualiza tus hábitos de gasto con tablas y resúmenes que te ayudan a entender tu comportamiento financiero.</p>
                                    </div>

                                    <div className="feature-card">
                                          <div className="feature-icon">🎯</div>
                                          <h3>Categorización</h3>
                                          <p>Organiza tus transacciones por categorías predefinidas para un seguimiento más efectivo de cada área.</p>
                                    </div>

                                    <div className="feature-card">
                                          <div className="feature-icon">⚡</div>
                                          <h3>Interfaz Intuitiva</h3>
                                          <p>Diseño limpio y accesible que te permite gestionar tus finanzas sin complicaciones.</p>
                                    </div>

                                    <div className="feature-card">
                                          <div className="feature-icon">🔒</div>
                                          <h3>Seguridad Garantizada</h3>
                                          <p>Tus datos están protegidos con encriptación y buenas prácticas de seguridad de última generación.</p>
                                    </div>

                                    <div className="feature-card">
                                          <div className="feature-icon">📈</div>
                                          <h3>Toma de Decisiones</h3>
                                          <p>Usa los datos de tus transacciones para tomar decisiones financieras más informadas y estratégicas.</p>
                                    </div>
                              </div>
                        </div>
                  </section>

                  <section className="benefits">
                        <div className="container">
                              <div className="benefits-content">
                                    <h2>¿Por qué elegir nuestra aplicación?</h2>

                                    <div className="benefits-list">
                                          <div className="benefit-item">
                                                <span className="benefit-icon">✓</span>
                                                <div>
                                                      <h4>Educación Financiera</h4>
                                                      <p>Mejora tu entendimiento sobre tus hábitos de gasto y aprende a administrar mejor tu dinero.</p>
                                                </div>
                                          </div>

                                          <div className="benefit-item">
                                                <span className="benefit-icon">✓</span>
                                                <div>
                                                      <h4>Control Total</h4>
                                                      <p>Ten acceso completo a tu historial financiero en cualquier momento desde cualquier dispositivo.</p>
                                                </div>
                                          </div>

                                          <div className="benefit-item">
                                                <span className="benefit-icon">✓</span>
                                                <div>
                                                      <h4>Sin Costos Ocultos</h4>
                                                      <p>Disfruta de una plataforma clara y transparente sin sorpresas en tu cuenta.</p>
                                                </div>
                                          </div>

                                          <div className="benefit-item">
                                                <span className="benefit-icon">✓</span>
                                                <div>
                                                      <h4>Soporte Confiable</h4>
                                                      <p>Contamos con un equipo dedicado a resolver tus dudas y asegurar la mejor experiencia.</p>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </section>

                  <section className="cta">
                        <div className="container">
                              <div className="cta-content">
                                    <h2>Comienza tu Viaje Financiero Hoy</h2>
                                    <p>Únete a miles de usuarios que ya están gestionando sus finanzas de manera inteligente</p>

                                    {!isAuthenticated && (
                                          <Link to="/register" className="btn btn-primary">
                                                Crear Cuenta Ahora
                                          </Link>
                                    )}
                              </div>
                        </div>
                  </section>
            </div>
      )
}

export default HomePage
