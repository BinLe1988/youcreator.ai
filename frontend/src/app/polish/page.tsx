'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import ComprehensivePolishService from '@/components/polish/ComprehensivePolishService';

export default function PolishPage() {
  const searchParams = useSearchParams();
  const [initialContent, setInitialContent] = useState('');
  const [initialImageData, setInitialImageData] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image'>('text');

  useEffect(() => {
    const content = searchParams.get('content');
    const imageData = searchParams.get('imageData');
    const type = searchParams.get('type') as 'text' | 'image';
    
    if (content) {
      setInitialContent(decodeURIComponent(content));
      setContentType('text');
    }
    if (imageData) {
      setInitialImageData(decodeURIComponent(imageData));
      setContentType('image');
    }
    if (type) {
      setContentType(type);
    }
  }, [searchParams]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <ComprehensivePolishService 
          content={initialContent}
          imageData={initialImageData}
          contentType={contentType}
        />
      </div>
    </Layout>
  );
}
