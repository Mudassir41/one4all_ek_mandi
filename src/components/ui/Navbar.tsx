'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoUser } from '@/contexts/DemoUserContext';
import { UserSwitcher } from '@/components/ui/UserSwitcher';

interface NavbarProps {
    activePage?: 'home' | 'seller' | 'buyer' | 'add-product';
}

export function Navbar({ activePage = 'home' }: NavbarProps) {
    const { currentLanguage, setLanguage, t, languages } = useLanguage();
    const { currentUser } = useDemoUser();

    const isVendor = currentUser?.userType === 'vendor';
    const isBuyer = currentUser?.userType?.includes('buyer');

    return (
        <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-orange-100">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl">
                            🏪
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                                {t('title')}
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">{t('subtitle')}</p>
                        </div>
                    </Link>

                    {/* Navigation - Role-based */}
                    <nav className="hidden md:flex items-center gap-3">
                        <Link
                            href="/"
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${activePage === 'home'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                }`}
                        >
                            🏠 {t('home')}
                        </Link>

                        {/* Role-specific navigation */}
                        {isVendor ? (
                            <>
                                <Link
                                    href="/seller"
                                    className={`px-3 py-1.5 rounded-lg font-medium transition ${activePage === 'seller'
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    📦 {t('sellerDashboard')}
                                </Link>
                                <Link
                                    href="/seller/add-product"
                                    className={`px-3 py-1.5 rounded-lg font-medium transition ${activePage === 'add-product'
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    ➕ {t('addProduct')}
                                </Link>
                            </>
                        ) : isBuyer ? (
                            <Link
                                href="/buyer"
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${activePage === 'buyer'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                🛒 {t('buyerDashboard')}
                            </Link>
                        ) : (
                            /* Not logged in - show role selection hint */
                            <span className="text-sm text-gray-400 italic">
                                👆 Select a user to see dashboard
                            </span>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <select
                            value={currentLanguage}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-white border-2 border-orange-200 text-gray-900 px-3 py-2 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer text-sm"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.native}</option>
                            ))}
                        </select>

                        {/* User Switcher */}
                        <UserSwitcher />
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
                    <Link
                        href="/"
                        className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${activePage === 'home' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        🏠 Home
                    </Link>
                    {isVendor && (
                        <>
                            <Link
                                href="/seller"
                                className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${activePage === 'seller' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                📦 Seller
                            </Link>
                            <Link
                                href="/seller/add-product"
                                className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${activePage === 'add-product' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                ➕ Add
                            </Link>
                        </>
                    )}
                    {isBuyer && (
                        <Link
                            href="/buyer"
                            className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${activePage === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            🛒 Buyer
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
