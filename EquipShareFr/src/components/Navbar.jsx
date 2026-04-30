import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Circles', href: '/circles' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary font-bold text-2xl hover:text-primary-dark transition-colors"
            aria-label="EquipShare Home"
            onClick={handleNavClick}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ES</span>
            </div>
            <span className="hidden sm:inline">EquipShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-text-secondary hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-text-secondary hover:text-error font-medium transition-colors"
              >
                Admin Panel
              </Link>
            )}
            {user?.role !== 'admin' && (
              <Link
                to="/create-listing"
                className="text-text-secondary hover:text-primary font-medium transition-colors"
              >
                List Equipment
              </Link>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link to="/signin">
                  <Button variant="text" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors text-sm font-bold"
                  title="View Profile"
                  aria-label="User profile"
                >
                  U
                </Link>
                <span className="text-sm text-text-secondary">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-error font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-2xl"
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="flex flex-col space-y-3 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-text-secondary hover:text-primary font-medium px-2 py-2 hover:bg-surface rounded transition-colors"
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-text-secondary hover:text-error font-medium px-2 py-2 hover:bg-surface rounded transition-colors"
                  onClick={handleNavClick}
                >
                  Admin Panel
                </Link>
              )}
              {user?.role !== 'admin' && (
                <Link
                  to="/create-listing"
                  className="text-text-secondary hover:text-primary font-medium px-2 py-2 hover:bg-surface rounded transition-colors"
                  onClick={handleNavClick}
                >
                  List Equipment
                </Link>
              )}
              <div className="border-t border-border pt-3 flex flex-col space-y-2">
                {!user ? (
                  <>
                    <Link to="/signin" onClick={handleNavClick}>
                      <Button variant="text" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={handleNavClick}>
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="text-left px-2 py-2 text-text-secondary hover:text-primary font-medium transition-colors hover:bg-surface rounded"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left px-2 py-2 text-text-secondary hover:text-error font-medium transition-colors hover:bg-surface rounded"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
