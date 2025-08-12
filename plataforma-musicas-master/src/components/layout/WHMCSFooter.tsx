// src/components/layout/WHMCSFooter.tsx
"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const WHMCSFooter = () => {
    return (
        <footer className="whmcs-footer">
            <div className="whmcs-container">
                <div className="whmcs-footer-content">
                    {/* Company Info */}
                    <div className="whmcs-footer-section">
                        <h4 className="whmcs-footer-title">Nexor Records</h4>
                        <p className="whmcs-footer-text">
                            Sua plataforma completa de música eletrônica para DJs profissionais.
                        </p>
                        <div className="whmcs-contact-info">
                            <div className="whmcs-contact-item">
                                <Mail className="h-4 w-4" />
                                <span>contato@nexorrecords.com.br</span>
                            </div>
                            <div className="whmcs-contact-item">
                                <MapPin className="h-4 w-4" />
                                <span>Venâncio Aires, RS - Brasil</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="whmcs-footer-section">
                        <h4 className="whmcs-footer-title">Links Rápidos</h4>
                        <ul className="whmcs-footer-links">
                            <li><Link href="/profile">Minha Conta</Link></li>
                            <li><Link href="/plans">Planos VIP</Link></li>
                            <li><Link href="/community">Comunidade</Link></li>
                            <li><Link href="/trending">Trending</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="whmcs-footer-section">
                        <h4 className="whmcs-footer-title">Suporte</h4>
                        <ul className="whmcs-footer-links">
                            <li><Link href="/termos">Termos de Serviço</Link></li>
                            <li><Link href="/privacidade">Política de Privacidade</Link></li>

                            <li><a href="#" className="whmcs-chat-link">Chat Ao Vivo</a></li>
                        </ul>
                    </div>

                    {/* Business Hours */}
                    <div className="whmcs-footer-section">
                        <h4 className="whmcs-footer-title">Horário de Atendimento</h4>
                        <div className="whmcs-hours">
                            <div className="whmcs-hours-item">
                                <Clock className="h-4 w-4" />
                                <div>
                                    <span className="whmcs-hours-day">Segunda - Sexta</span>
                                    <span className="whmcs-hours-time">09:00 - 18:00</span>
                                </div>
                            </div>
                            <div className="whmcs-hours-item">
                                <Clock className="h-4 w-4" />
                                <div>
                                    <span className="whmcs-hours-day">Sábado</span>
                                    <span className="whmcs-hours-time">09:00 - 12:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="whmcs-footer-bottom">
                    <div className="whmcs-copyright">
                        <p>&copy; 2025 Nexor Records. Todos os direitos reservados.</p>
                    </div>
                    <div className="whmcs-footer-badges">
                        <span className="whmcs-badge-item">Segurança SSL</span>
                        <span className="whmcs-badge-item">Suporte 24/7</span>
                        <span className="whmcs-badge-item">Pagamento Seguro</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default WHMCSFooter;

