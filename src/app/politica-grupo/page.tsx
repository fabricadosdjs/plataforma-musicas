import React from "react";
import Header from "@/components/layout/Header";
import FooterPlayer from "@/components/player/FooterPlayer";

export default function PoliticaGrupoPage() {
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
                                POLÍTICA DO GRUPO
                            </h1>
                        </div>
                        <p className="text-xl text-gray-300 font-inter font-medium max-w-3xl mx-auto leading-relaxed">
                            Regras Oficiais do Grupo Nexor Records – Música Eletrônica
                        </p>
                        <p className="text-gray-400 font-inter mt-4 max-w-2xl mx-auto">
                            Estas regras foram estabelecidas para garantir uma experiência positiva, segura e produtiva para todos os membros.
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="mb-12">
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 rounded-xl p-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">!</span>
                                </div>
                                <h2 className="text-2xl font-bebas font-bold text-white tracking-wide">REQUISITO IMPORTANTE</h2>
                            </div>
                            <p className="text-gray-200 font-inter text-lg leading-relaxed mb-4">
                                Para entrar no grupo e participar da <span className="text-orange-300 font-bold">comunidade ativa no WhatsApp</span>,
                                é necessário ter um <span className="text-orange-300 font-bold">plano ativo</span> na plataforma.
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
                                <p className="text-orange-300 font-inter font-medium">
                                    <span className="font-bold">⚠️ Acesso Restrito:</span> Apenas membros com planos ativos podem participar das discussões,
                                    receber suporte direto e acessar conteúdo exclusivo da comunidade.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {/* Rule 1 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">1</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">RESPEITO E CONVIVÊNCIA</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Todos os membros devem manter respeito mútuo, evitando ofensas, preconceitos, discursos políticos ou religiosos.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Promover um ambiente saudável, focado em música eletrônica e livre de conflitos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 2 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">2</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">FOCO NO TEMA: MÚSICA ELETRÔNICA</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Compartilhe apenas conteúdos relacionados ao universo da música eletrônica: packs, playlists, lançamentos, produções, dicas e eventos.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Manter o grupo organizado e relevante.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 3 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">3</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">PROIBIDO SPAM E DIVULGAÇÃO SEM AUTORIZAÇÃO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Não é permitido divulgar links para outros grupos, lojas, cursos ou produtos sem autorização prévia da administração.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Evitar excesso de propaganda e preservar a qualidade do conteúdo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 4 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">4</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">COMPARTILHAMENTO RESPONSÁVEL DE ARQUIVOS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Ao compartilhar arquivos ou links, sempre descreva o conteúdo e certifique-se de que está livre de vírus ou malwares.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Garantir a segurança dos membros.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 5 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">5</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">SOLICITAÇÃO DE PACKS E PLAYLISTS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Solicitações devem respeitar os limites do plano de assinatura de cada membro e ser feitas via mensagem privada ou formulário oficial, conforme orientações da administração.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Organizar e agilizar o atendimento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 6 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">6</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">PROIBIDO O COMPARTILHAMENTO DE DADOS PESSOAIS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Evite divulgar números de telefone, endereços ou quaisquer dados pessoais dentro do grupo.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Proteger a privacidade e segurança de todos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 7 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">7</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">RESPEITO AOS DIREITOS AUTORAIS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Não compartilhe materiais que infrinjam direitos autorais, como lançamentos oficiais pagos sem autorização.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Respeitar os artistas, produtores e preservar a ética.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 8 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">8</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">DENÚNCIAS E RECLAMAÇÕES</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Qualquer comportamento inadequado deve ser comunicado diretamente à administração via mensagem privada.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Garantir o cumprimento das regras e resolver conflitos com discrição.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 9 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">9</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">PENALIDADES</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        O descumprimento das regras pode resultar em advertência, suspensão temporária ou banimento, dependendo da gravidade da infração.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Manter a ordem e bom funcionamento do grupo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 10 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">10</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">PROIBIÇÃO DE COMPARTILHAMENTO INDEVIDO DE ACESSO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        É proibido compartilhar arquivos bloqueados ou disponibilizar acesso ao drive via sua conta pessoal Google. Essa prática acarretará banimento imediato, pois coloca em risco a segurança do grupo e da sua conta pessoal, podendo gerar bloqueios e sanções.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Proteger a segurança do grupo e evitar o uso indevido das plataformas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 11 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">11</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">ATUALIZAÇÕES DAS REGRAS</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        As regras podem ser atualizadas periodicamente. Os membros serão notificados sobre mudanças importantes.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Manter as diretrizes sempre atualizadas e relevantes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rule 12 */}
                        <div className="bg-music-list rounded-lg p-6 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bebas font-bold text-lg">12</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bebas font-bold text-white mb-3 tracking-wide">CONTATO COM A ADMINISTRAÇÃO</h2>
                                    <p className="text-gray-300 font-inter leading-relaxed mb-3">
                                        Para dúvidas, sugestões ou problemas, entre em contato com a administração através dos canais oficiais.
                                    </p>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-inter font-medium text-sm">
                                            <span className="font-bold">Objetivo:</span> Garantir comunicação eficiente e suporte adequado aos membros.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Message */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
                            <p className="text-gray-300 font-inter text-lg font-medium">
                                A colaboração de todos é fundamental para um grupo saudável e produtivo.
                                <span className="text-orange-300 font-bold"> Agradecemos sua compreensão e participação!</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <FooterPlayer />
        </div>
    );
}
