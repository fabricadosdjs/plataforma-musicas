import React from "react";
import Header from "@/components/layout/Header";
import FooterPlayer from "@/components/player/FooterPlayer";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Termos de Serviço',
    description: 'Termos de uso da plataforma Nexor Records para DJs e usuários VIP.'
};

export default function TermosPage() {
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
                                TERMOS DE SERVIÇO
                            </h1>
                        </div>
                        <p className="text-xl text-gray-300 font-inter font-medium max-w-3xl mx-auto leading-relaxed">
                            Nexor Records - Termos e Condições de Uso
                        </p>
                        <p className="text-gray-400 font-inter mt-4 max-w-2xl mx-auto">
                            Bem-vindo à plataforma Nexor Records! Ao acessar ou usar nossos serviços, você concorda com estes Termos de Serviço. Leia atentamente antes de utilizar a plataforma.
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="mb-12">
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 rounded-xl p-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">!</span>
                                </div>
                                <h2 className="text-2xl font-bebas font-bold text-white tracking-wide">AVISO IMPORTANTE</h2>
                            </div>
                            <p className="text-gray-200 font-inter text-sm leading-relaxed text-justify">
                                ESTES TERMOS E CONDIÇÕES ("TERMOS") ESTABELECEM UM CONTRATO LEGALMENTE VINCULANTE ENTRE VOCÊ E A NEXOR RECORDS POOLS ("NÓS", "NOS", "NOSSO").
                                LEIA ESTE CONTRATO E NOSSA POLÍTICA DE PRIVACIDADE COM ATENÇÃO ANTES DE USAR NEXOR DJ POOLS, QUAISQUER SUBPÁGINAS RELACIONADAS, APLICATIVOS E/OU VERSÕES MÓVEIS (COLETIVAMENTE, O "SITE") OU DE SE REGISTRAR NO SERVIÇO.
                                AO USAR O SITE OU SE REGISTRAR NO SERVIÇO, VOCÊ SE TORNA PARTE DESTE CONTRATO E ESTÁ VINCULADO AOS TERMOS AQUI CONTIDOS, SEJA VOCÊ UM VISITANTE, MEMBRO OU COLABORADOR (COLETIVAMENTE, O "USUÁRIO").
                                SE VOCÊ NÃO CONCORDAR COM TODOS OS TERMOS, INTERROMPA O USO DO SITE E O PROCESSO DE LOGIN. O USO CONTINUADO DO SITE CONSTITUIRÁ SUA ACEITAÇÃO VINCULATIVA AOS TERMOS AQUI CONTIDOS.
                            </p>
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">SERVIÇO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        A Nexor Records oferece uma plataforma de música eletrônica que inclui:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Acesso a Música</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Biblioteca de músicas eletrônicas, packs de DJ, playlists e conteúdo exclusivo para membros.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Planos de Assinatura</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Diferentes níveis de acesso com benefícios específicos para cada tipo de usuário.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Comunidade</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Acesso a grupos exclusivos, suporte direto e networking com outros profissionais da música eletrônica.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">ACEITAÇÃO DOS TERMOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Ao utilizar nossos serviços, você concorda com:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Contrato Vinculativo</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Estes termos constituem um acordo legalmente vinculativo entre você e a Nexor Records.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Uso Contínuo</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                O uso continuado da plataforma constitui aceitação dos termos e condições.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Maioridade</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Você declara ter pelo menos 18 anos de idade ou ter autorização de responsável legal.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">CONTA DE USUÁRIO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Para acessar nossos serviços, você deve criar uma conta:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Informações Precisas</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Você deve fornecer informações verdadeiras, precisas e atualizadas durante o cadastro.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Segurança da Conta</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades em sua conta.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Uma Conta por Pessoa</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Cada usuário pode ter apenas uma conta. Contas duplicadas serão suspensas.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">PAGAMENTOS E ASSINATURAS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Nossos serviços são oferecidos mediante pagamento:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Renovação Automática</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                As assinaturas são renovadas automaticamente até serem canceladas pelo usuário.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Preços</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Os preços podem ser alterados com aviso prévio de 30 dias. Alterações não afetam períodos já pagos.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Reembolsos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Reembolsos são considerados caso a caso, conforme nossa política de reembolso.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">USO ACEITÁVEL</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Você concorda em usar nossos serviços apenas para fins legais e de acordo com estes termos:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Uso Pessoal</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                O conteúdo é para uso pessoal e profissional. Não é permitida a redistribuição comercial.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Respeito aos Direitos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Você deve respeitar todos os direitos autorais e propriedade intelectual do conteúdo.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Comportamento</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Mantenha comportamento respeitoso em todas as interações na plataforma e comunidades.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">CONTEÚDO PROIBIDO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        É proibido o uso da plataforma para:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Atividades Ilegais</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Qualquer atividade que viole leis locais, nacionais ou internacionais.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Violação de Direitos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Infringir direitos autorais, marcas registradas ou outros direitos de propriedade intelectual.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Compartilhamento Indevido</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Compartilhar conteúdo com usuários não autorizados ou distribuir material protegido.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">SUSPENSÃO E TERMINAÇÃO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Reservamo-nos o direito de suspender ou encerrar contas em caso de:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Violação dos Termos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Descumprimento destes termos de serviço ou políticas da plataforma.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Atividade Suspeita</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Comportamento suspeito, fraude ou uso indevido da plataforma.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Não Pagamento</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Falha no pagamento de assinaturas ou taxas aplicáveis.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">LIMITAÇÃO DE RESPONSABILIDADE</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Nossa responsabilidade é limitada conforme permitido por lei:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Serviço "Como Está"</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                O serviço é fornecido "como está" sem garantias de disponibilidade contínua.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Danos Indiretos</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Não nos responsabilizamos por danos indiretos, consequenciais ou lucros cessantes.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Limite Máximo</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
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
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">ALTERAÇÕES NOS TERMOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Podemos modificar estes termos a qualquer momento:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Notificação</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Alterações significativas serão comunicadas com pelo menos 30 dias de antecedência.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Aceitação</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                O uso continuado após as alterações constitui aceitação dos novos termos.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Versão Atual</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                A versão mais recente dos termos estará sempre disponível nesta página.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 10 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">10</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">CONTATO E SUPORTE</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-4">
                                        Para questões relacionadas aos termos ou suporte:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Suporte Técnico</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Entre em contato através dos canais oficiais de suporte da plataforma.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Questões Legais</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Para questões legais ou disputas, consulte nossa seção de resolução de conflitos.
                                            </p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                            <h3 className="text-orange-300 font-inter font-bold mb-2">Tempo de Resposta</h3>
                                            <p className="text-gray-300 font-inter text-sm">
                                                Nos comprometemos a responder todas as consultas dentro de 48 horas úteis.
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
                                Ao utilizar nossos serviços, você concorda com estes termos.
                                <span className="text-orange-300 font-bold"> Estamos comprometidos em fornecer a melhor experiência possível em nossa plataforma.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <FooterPlayer />
        </div>
    );
}
