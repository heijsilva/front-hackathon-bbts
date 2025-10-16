'use client';

import Header from '@/app/components/Header';
import Home from '@/app/Home';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="visao" />
      <Home />
    </div>
  );
}