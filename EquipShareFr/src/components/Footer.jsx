import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Categories', href: '/categories' },
      { label: 'Popular Items', href: '/popular' },
    ],
    help: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Contact Support', href: '/support' },
      { label: 'FAQ', href: '/faq' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Disputes', href: '/disputes' },
    ],
  };

  const socialLinks = [
    { text: 'f', href: '#', label: 'Facebook' },
    { text: '𝕏', href: '#', label: 'Twitter' },
    { text: 'Instagram', href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">ES</span>
              </div>
              <span className="font-bold text-xl">EquipShare</span>
            </div>
            <p className="text-primary-light text-sm leading-relaxed">
              Community equipment rental marketplace for KFUPM students and freelancers.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="hover:text-accent transition-colors font-bold text-lg"
                >
                  {social.text}
                </a>
              ))}
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Browse</h4>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-light hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Help</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-light hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-light hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-primary-dark pt-8 mb-8">
          <h4 className="font-bold text-lg mb-4">Get In Touch</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-accent flex-shrink-0 mt-1 font-bold">✉️</span>
              <div>
                <p className="text-sm text-primary-light">Email</p>
                <p className="text-white hover:text-accent transition-colors cursor-pointer">
                  support@equipshare.sa
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-accent flex-shrink-0 mt-1 font-bold">CONTACT</span>
              <div>
                <p className="text-sm text-primary-light">Phone</p>
                <p className="text-white hover:text-accent transition-colors cursor-pointer">
                  +966 13 860 8000
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-accent flex-shrink-0 mt-1 font-bold">LOCATION</span>
              <div>
                <p className="text-sm text-primary-light">Location</p>
                <p className="text-white">KFUPM, Saudi Arabia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-dark pt-8 text-center">
          <p className="text-primary-light text-sm">
            © {currentYear} EquipShare. All rights reserved.
          </p>
          <p className="text-primary-light text-sm mt-2">
            Proudly built for the KFUPM community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
