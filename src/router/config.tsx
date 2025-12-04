import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from '../components/Layout';

const HomePage = lazy(() => import('../pages/home/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const MethodsPage = lazy(() => import('../pages/methods/page'));
const BlogPage = lazy(() => import('../pages/blog/page'));
const PodcastPage = lazy(() => import('../pages/podcast/page'));
const BookingPage = lazy(() => import('../pages/booking/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const RegisterPage = lazy(() => import('../pages/register/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const ClientPanelPage = lazy(() => import('../pages/client-panel/page'));
const KVKKPage = lazy(() => import('../pages/kvkk/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const CopyrightPage = lazy(() => import('../pages/copyright/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
import CookiesPage from '../pages/cookies/page';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'methods', element: <MethodsPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'podcast', element: <PodcastPage /> },
      { path: 'booking', element: <BookingPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'kvkk', element: <KVKKPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'copyright', element: <CopyrightPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/client-panel',
    element: <ClientPanelPage />,
  },
  {
    path: '/cookies',
    element: <CookiesPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
