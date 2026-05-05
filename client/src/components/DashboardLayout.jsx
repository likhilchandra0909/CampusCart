import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="layout-container">
      <Navbar />
      <Sidebar />
      <main className="main-content">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
