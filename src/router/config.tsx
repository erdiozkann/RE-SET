import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from '../components/Layout';

const HomePage = lazy(() => import('../pages/home/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const MethodsPage = lazy(() => import('../pages/methods/page'));
const BlogPage = lazy(() => import('../pages/blog/page'));
const PodcastPage = lazy(() => import('../pages/podcast/page'));
const YouTubePage = lazy(() => import('../pages/youtube/page'));
const BookingPage = lazy(() => import('../pages/booking/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const RegisterPage = lazy(() => import('../pages/register/page'));
const ResetPasswordPage = lazy(() => import('../pages/reset-password/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const ClientPanelPage = lazy(() => import('../pages/client-panel/page'));
const KVKKPage = lazy(() => import('../pages/kvkk/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const CopyrightPage = lazy(() => import('../pages/copyright/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
// Defense-in-depth: Only import DebugPage in DEV
const DebugPage = import.meta.env.DEV ? lazy(() => import('../pages/debug/page')) : null;
import CookiesPage from '../pages/cookies/page';

import ProtectedRoute from '../components/ProtectedRoute';

import PageTransition from '../components/PageTransition';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />, // Layout already handles its children transitions
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'methods', element: <MethodsPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'podcast', element: <PodcastPage /> },
      { path: 'youtube', element: <YouTubePage /> },
      { path: 'booking', element: <BookingPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'kvkk', element: <KVKKPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'copyright', element: <CopyrightPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <PageTransition>
        <LoginPage />
      </PageTransition>
    ),
  },
  {
    path: '/register',
    element: (
      <PageTransition>
        <RegisterPage />
      </PageTransition>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PageTransition>
        <ResetPasswordPage />
      </PageTransition>
    ),
  },
  {
    path: '/admin',
    element: (
      <PageTransition>
        <ProtectedRoute requireAdmin>
          <AdminPage />
        </ProtectedRoute>
      </PageTransition>
    ),
  },
  {
    path: '/client-panel',
    element: (
      <PageTransition>
        <ProtectedRoute>
          <ClientPanelPage />
        </ProtectedRoute>
      </PageTransition>
    ),
  },
  {
    path: '/cookies',
    element: (
      <PageTransition>
        <CookiesPage />
      </PageTransition>
    ),
  },
  ...(import.meta.env.DEV && DebugPage ? [{
    path: '/debug',
    element: (
      <PageTransition>
        <DebugPage />
      </PageTransition>
    ),
  }] : []),
  {
    path: '*',
    element: (
      <PageTransition>
        <NotFoundPage />
      </PageTransition>
    ),
  },
];

export default routes;
