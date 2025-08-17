'use client';

import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 YouCreator.AI. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Powered by AI • 让创作更简单 • 让分享更精彩
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
