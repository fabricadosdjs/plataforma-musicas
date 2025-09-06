import React from "react";
import Header from "@/components/layout/Header";
import FooterPlayer from "@/components/player/FooterPlayer";

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter">
            <Header />

            <main className="pt-20 pb-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                                POLÍTICA DE PRIVACIDADE
                            </h1>
                        </div>
                        <p className="text-xl text-gray-300 font-inter font-medium max-w-3xl mx-auto leading-relaxed">
                            Nexor Records - Proteção de Dados Pessoais
                        </p>
                        <p className="text-gray-400 font-inter mt-4 max-w-2xl mx-auto">
                            Valorizamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. Esta política explica como coletamos, usamos e protegemos suas informações.
                        </p>
                        <div className="mt-4 text-sm text-gray-500 font-inter">
                            Última atualização: 30/07/2025
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">1</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">DADOS QUE COLETAMOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Coletamos e processamos os seguintes tipos de dados pessoais:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Informações de Cadastro</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Nome, e-mail, telefone, dados de pagamento, endereço IP e outros dados fornecidos ao criar sua conta ou contratar nossos serviços.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Dados de Uso</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Informações sobre como você utiliza nosso site, incluindo logs de acesso, páginas visitadas, interações com o conteúdo e preferências.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Dados Técnicos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Informações sobre seu dispositivo, navegador, sistema operacional e endereço IP, para garantir segurança e otimização do serviço.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">2</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">COMO USAMOS SEUS DADOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Utilizamos seus dados pessoais para as seguintes finalidades:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Prestação de Serviços</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Fornecer acesso à plataforma, processar pagamentos, gerenciar sua conta e oferecer suporte ao cliente.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Melhoria da Experiência</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Personalizar conteúdo, recomendar músicas, melhorar funcionalidades e otimizar a performance do site.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Comunicação</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Enviar notificações sobre atualizações, novidades, promoções e informações importantes sobre sua conta.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">3</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">COMPARTILHAMENTO DE DADOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto nas seguintes situações:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Prestadores de Serviço</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Compartilhamos dados com provedores de serviços confiáveis que nos auxiliam na operação da plataforma, sempre sob acordos de confidencialidade.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Obrigação Legal</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Quando exigido por lei, ordem judicial ou autoridades competentes para cumprimento de obrigações legais.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Consentimento</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Quando você nos der consentimento explícito para compartilhar suas informações com terceiros específicos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">4</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">SEGURANÇA DOS DADOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Criptografia</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Utilizamos criptografia SSL/TLS para proteger dados em trânsito e criptografia de dados sensíveis em repouso.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Controle de Acesso</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Acesso restrito aos dados pessoais apenas para funcionários autorizados que necessitam dessas informações para suas funções.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Monitoramento</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Monitoramento contínuo de sistemas e atividades para detectar e prevenir acessos não autorizados.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">5</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">SEUS DIREITOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Você tem os seguintes direitos em relação aos seus dados pessoais:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Acesso e Portabilidade</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Solicitar uma cópia dos seus dados pessoais ou transferi-los para outro serviço.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Correção e Atualização</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Corrigir dados incorretos ou desatualizados em sua conta.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Exclusão</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Solicitar a exclusão dos seus dados pessoais, sujeito a obrigações legais de retenção.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Oposição</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Opor-se ao processamento dos seus dados para finalidades específicas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">6</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">RETENÇÃO DE DADOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Dados de Conta</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Mantidos enquanto sua conta estiver ativa e por um período adicional conforme exigido por lei.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Dados de Uso</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Retidos por períodos específicos para análise e melhoria dos serviços, geralmente não excedendo 2 anos.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Dados Financeiros</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Mantidos conforme exigido por regulamentações fiscais e contábeis aplicáveis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">7</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">COOKIES E TECNOLOGIAS SIMILARES</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Utilizamos cookies e tecnologias similares para melhorar sua experiência:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Cookies Essenciais</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Necessários para o funcionamento básico do site, incluindo autenticação e segurança.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Cookies de Performance</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Coletam informações sobre como você usa o site para melhorar sua funcionalidade.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Cookies de Preferências</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Lembram suas escolhas e preferências para personalizar sua experiência.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 8 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">8</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">ALTERAÇÕES NA POLÍTICA</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Podemos atualizar esta Política de Privacidade periodicamente. Quando isso acontecer:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Notificação</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Notificaremos sobre mudanças significativas através do site ou por e-mail.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Data de Vigência</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                A data de "última atualização" será modificada para refletir as alterações.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Aceitação</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                O uso continuado do serviço após as alterações constitui aceitação da nova política.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 9 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">9</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">CONTATO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Para questões relacionadas à privacidade ou para exercer seus direitos:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">E-mail</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Entre em contato através do e-mail de suporte disponível na plataforma.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Resposta</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Responderemos às suas solicitações dentro de 30 dias úteis.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Autoridade de Proteção</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Você tem o direito de apresentar reclamação à autoridade de proteção de dados competente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Message */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
                            <p className="text-gray-300 font-inter text-lg font-medium">
                                Sua privacidade é nossa prioridade.
                                <span className="text-orange-300 font-bold"> Estamos comprometidos em proteger seus dados pessoais com transparência e responsabilidade.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <FooterPlayer />
        </div>
    );
}
