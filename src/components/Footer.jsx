import React from 'react'
import InstagramLogo from '../assets/instagram.png'
const Footer = () => {
    return (
        <footer className="bg-[#0f0c29] border-t border-gray-500 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-semibold">🔐 Encriptify</h2>
                    <p className="text-sm text-gray-400">Secure. Simple. Smart.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <a href="https://www.instagram.com/shivam_agarwal_078" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-pink-500 text-blue-500 transition-colors duration-200">
                        <img src={InstagramLogo} alt="instalogo" className='w-5 h-5' />
                        @shivam_agarwal_078
                    </a>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">&copy; 2025 Encriptify. All rights reserved.</p>
        </footer>

    )
}

export default Footer
