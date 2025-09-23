import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const streamingLinks = [
    { name: 'YouTube', href: 'https://www.youtube.com/@YoBaeXo' },
    { name: 'Apple Music', href: 'https://music.apple.com/artist/yobaexo' },
    { name: 'Amazon Music', href: 'https://music.amazon.com/artists/yobaexo' },
    { name: 'Audiomack', href: 'https://audiomack.com/yobaexo' },
    // { name: 'Anghami', href: 'https://play.anghami.com/artist/yobaexo' },
    // { name: 'iHeart', href: 'https://iheart.com/artist/yobaexo' },
    // { name: 'Last.fm', href: 'https://www.last.fm/music/YoBaeXo' },
  ];

  const exploreLinks = [
    { name: 'Albums', href: '/albums' },
    { name: 'Licensing', href: '/licensing' },
    { name: 'Donate', href: '/donate' },
    { name: 'Remix', href: '/remix' },
    // { name: 'EPK', href: '/epk' },
  ];

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/yobaexo' },
    { name: 'Twitter', href: 'https://twitter.com/yobaexo' },
    { name: 'YouTube', href: 'https://www.youtube.com/@YoBaeXo' },
    { name: 'Audiomack', href: 'https://audiomack.com/yobaexo' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Stream Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Stream</h3>
            <ul className="space-y-3">
              {streamingLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Explore</h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Connect</h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-pink-400 transition-colors duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-violet-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <img src="/YoBaeXo.png" alt="YoBaeXo" className="h-8 w-auto" />
              <span className="text-gray-400 font-poppins">
                Feel the Beat, Live the Vibe
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 YoBaeXo. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;