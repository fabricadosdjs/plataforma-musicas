'use client';

import { useState } from 'react';
import {
    Code,
    Palette,
    Upload,
    Music,
    Disc3,
    Facebook,
    Instagram,
    ExternalLink,
    Heart,
    Star,
    Users,
    Globe,
    Award,
    Zap,
    Sparkles
} from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    description: string;
    skills: string[];
    photo: string;
    socialMedia: {
        facebook?: string;
        instagram?: string;
    };
    color: string;
    gradient: string;
    icon: React.ReactNode;
}

const WhoDoesPage = () => {
    const teamMembers: TeamMember[] = [
        {
            name: "Ederson Leonardo",
            role: "Programador, Design, Uploader",
            description: "Desenvolvedor full-stack responsável pela criação e manutenção da plataforma. Especialista em Next.js, React, TypeScript e design de interfaces modernas.",
            skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
            photo: "https://i.ibb.co/Y4Gf1wDg/ederson-leonardo.jpg",
            socialMedia: {
                facebook: "https://www.facebook.com/ederson.leo.siebeneichler",
                instagram: "ederson_leonardosie"
            },
            color: "from-blue-500 to-cyan-500",
            gradient: "from-blue-600/20 to-cyan-600/20",
            icon: <Code className="h-8 w-8" />
        },
        {
            name: "Jéssika Luana",
            role: "DJ, Produtora, Uploader",
            description: "DJ e produtora musical que domina os ritmos dançantes. Responsável pelo conteúdo musical e curadoria da plataforma.",
            skills: ["DJ", "Produção Musical", "Curadoria", "Upload", "Música Eletrônica"],
            photo: "https://i.ibb.co/zh9XDKDT/20250508-0652-Iluminaci-n-Creativa-y-Sombras-remix-01jtqmvwcae12bzqjk2yegam5r.png",
            socialMedia: {
                facebook: "https://www.facebook.com/djjessikaluana",
                instagram: "djjessikaluana"
            },
            color: "from-purple-500 to-pink-500",
            gradient: "from-purple-600/20 to-pink-600/20",
            icon: <Music className="h-8 w-8" />
        }
    ];

    const stats = [
        { label: "Anos de Experiência", value: "5+", icon: <Star className="h-6 w-6" /> },
        { label: "Projetos Concluídos", value: "50+", icon: <Award className="h-6 w-6" /> },
        { label: "Usuários Atendidos", value: "1000+", icon: <Users className="h-6 w-6" /> },
        { label: "Países Alcançados", value: "15+", icon: <Globe className="h-6 w-6" /> }
    ];

    return (
        <div className="min-h-screen bg-black z-0" style={{ zIndex: 0 }}>
            <div className="container mx-auto px-4 py-8">

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                            <div className="relative bg-black border border-gray-800 rounded-full p-6">
                                <Users className="h-16 w-16 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-white mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        QUEM FAZ
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Conheça a equipe por trás da plataforma. Pessoas apaixonadas por música e tecnologia
                        trabalhando juntas para criar a melhor experiência possível.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                                    <p className="text-3xl font-black text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team Members */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-white mb-4">Nossa Equipe</h2>
                        <p className="text-gray-400 text-lg">Pessoas dedicadas que fazem a diferença</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="group">
                                <div className="bg-black border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-500 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                    <div className="relative">
                                        {/* Header */}
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="relative">
                                                <div className={`absolute inset-0 bg-gradient-to-r ${member.color} rounded-full blur-xl opacity-30`}></div>
                                                <div className="relative w-24 h-24 bg-black border border-gray-700 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
                                                    <img
                                                        src={member.photo}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-white mb-2">{member.name}</h3>
                                                <p className="text-gray-400 mb-3">{member.role}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${member.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                                        {member.icon}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-300 mb-6 leading-relaxed">
                                            {member.description}
                                        </p>

                                        {/* Skills */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-yellow-400" />
                                                Especialidades
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {member.skills.map((skill, skillIndex) => (
                                                    <span
                                                        key={skillIndex}
                                                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Social Media */}
                                        <div className="flex items-center gap-4">
                                            {member.socialMedia.facebook && (
                                                <a
                                                    href={member.socialMedia.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Facebook className="h-4 w-4" />
                                                    Facebook
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {member.socialMedia.instagram && (
                                                <a
                                                    href={`https://instagram.com/${member.socialMedia.instagram}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
                                                >
                                                    <Instagram className="h-4 w-4" />
                                                    Instagram
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 mb-16">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-xl opacity-30"></div>
                                <div className="relative bg-black border border-gray-700 rounded-full p-4">
                                    <Heart className="h-12 w-12 text-yellow-400" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Nossa Missão</h2>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
                            Criar a melhor plataforma de música eletrônica do Brasil, conectando DJs, produtores
                            e amantes da música através de tecnologia inovadora e design moderno. Nossa paixão
                            pela música nos motiva a sempre buscar a excelência em tudo que fazemos.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Inovação</h3>
                        <p className="text-gray-400">
                            Sempre buscamos as melhores tecnologias e soluções para oferecer uma experiência única.
                        </p>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Comunidade</h3>
                        <p className="text-gray-400">
                            Acreditamos no poder da música para unir pessoas e criar conexões significativas.
                        </p>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                            <Star className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Qualidade</h3>
                        <p className="text-gray-400">
                            Comprometimento com a excelência em cada detalhe, desde o código até a experiência do usuário.
                        </p>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="text-center">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
                        <h2 className="text-3xl font-black text-white mb-4">Entre em Contato</h2>
                        <p className="text-gray-400 mb-6 text-lg">
                            Tem alguma dúvida ou sugestão? Adoraríamos ouvir de você!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:contato@plataforma.com"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300"
                            >
                                <ExternalLink className="h-5 w-5" />
                                Enviar Email
                            </a>
                            <a
                                href="/record_label"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-black border border-gray-700 text-white font-bold rounded-2xl hover:bg-gray-900 transition-all duration-300"
                            >
                                <Disc3 className="h-5 w-5" />
                                Conhecer Gravadora
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhoDoesPage; 