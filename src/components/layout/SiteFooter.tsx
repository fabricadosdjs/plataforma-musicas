import { Facebook, Instagram, Twitter } from 'lucide-react';
import { memo } from 'react';

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Instagram size={24} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Twitter size={24} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Facebook size={24} />
                    </a>
                </div>
            </div>
        </footer>
    );
});

export default SiteFooter;
