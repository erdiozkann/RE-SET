# RE-SET Platform - Product Requirements Document

## 1. Product Overview

RE-SET is a professional psychology/therapy practice website and management platform built for a Turkish-based practitioner. It serves as both a public-facing website for potential clients and an internal management dashboard for the practice owner.

### 1.1 Target Users
- **Public Visitors**: Potential clients browsing therapy services, methods, blog, and podcast content
- **Registered Clients**: Authenticated users who can book appointments and access their client panel
- **Admin/Practitioner**: The practice owner who manages all content, appointments, users, and accounting

### 1.2 Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3
- **Backend/Database**: Supabase (Auth, Database, Storage)
- **Animations**: Framer Motion
- **i18n**: i18next (multi-language support)
- **Charts**: Recharts (for accounting reports)
- **Payments**: Stripe integration
- **Analytics**: Firebase, Microsoft Clarity

---

## 2. Core Features

### 2.1 Public Website

#### 2.1.1 Homepage (`/`)
- Hero section with call-to-action for booking
- Services overview section
- Client reviews slider component
- Navigation header with links to all public pages
- Footer with contact info and legal links

#### 2.1.2 About Page (`/about`)
- Practitioner biography and credentials
- Professional approach and philosophy

#### 2.1.3 Methods Page (`/methods`)
- List of therapy methods and approaches offered
- Description of each methodology

#### 2.1.4 Blog (`/blog`)
- Blog post listing with pagination
- Individual blog post reading view
- Content fetched from Supabase

#### 2.1.5 Podcast (`/podcast`)
- Podcast episodes listing
- Episode playback or links

#### 2.1.6 YouTube (`/youtube`)
- YouTube content integration and display

#### 2.1.7 Booking (`/booking`)
- Online appointment booking form
- Date and time selection
- Contact information collection
- Booking submission to Supabase

#### 2.1.8 Contact (`/contact`)
- Contact form with name, email, message fields
- Form submission stored in Supabase messages table

#### 2.1.9 Legal Pages
- **KVKK** (`/kvkk`): Turkish data protection law compliance
- **Privacy Policy** (`/privacy`): Privacy policy disclosure
- **Copyright** (`/copyright`): Copyright information
- **Cookies** (`/cookies`): Cookie policy and preferences

### 2.2 Authentication System

#### 2.2.1 Login (`/login`)
- Email and password authentication via Supabase Auth
- Error handling for invalid credentials
- Link to registration and password reset

#### 2.2.2 Registration (`/register`)
- User registration form
- Password strength requirements (min 8 chars, 1 letter, 1 number)
- Email verification flow

#### 2.2.3 Password Reset (`/reset-password`)
- Email-based password reset via Supabase Auth
- Reset link sent to registered email

### 2.3 Client Panel (`/client-panel`) - Auth Required
- View upcoming appointments
- View profile information
- Edit profile settings
- Protected route - requires authentication

### 2.4 Admin Dashboard (`/admin`) - Admin Auth Required

#### 2.4.1 Content Management (`ContentTab`)
- Edit homepage content sections
- Manage static page content

#### 2.4.2 Appointments Management (`AppointmentsTab`)
- View all booked appointments
- Approve/reject/cancel appointments
- Calendar view of schedule

#### 2.4.3 Blog Management (`BlogTab`)
- Create new blog posts
- Edit existing posts
- Delete posts
- Rich text editing

#### 2.4.4 Podcast Management (`PodcastTab`)
- Add podcast episodes
- Edit episode details
- Manage podcast content

#### 2.4.5 User Management (`AccountsTab`, `PendingUsersTab`)
- View all registered users
- Approve pending user registrations
- Manage user roles and permissions

#### 2.4.6 Client Management (`ClientsTab`)
- View client list
- Client details and history

#### 2.4.7 Services Management (`ServicesTab`)
- Add/edit/remove offered services
- Service pricing and descriptions

#### 2.4.8 Methods Management (`MethodsTab`)
- Add/edit/remove therapy methods
- Method descriptions and details

#### 2.4.9 Messages (`MessagesTab`)
- View contact form submissions
- Reply to client inquiries

#### 2.4.10 Ads Management (`AdsTab`)
- Manage promotional content and advertisements

#### 2.4.11 Accounting (`AccountingTab`)
- Financial reporting with charts (Recharts)
- Revenue tracking
- Receipt and invoice management
- Report generation and viewing

#### 2.4.12 Configuration (`ConfigTab`)
- Site-wide configuration settings
- Feature toggles

#### 2.4.13 Account Settings (`AccountSettingsTab`)
- Admin profile management
- Password change

### 2.5 Cross-Cutting Features

#### 2.5.1 Cookie Consent Banner
- GDPR/KVKK compliant cookie consent
- Accept/reject options
- Link to cookie policy page

#### 2.5.2 Internationalization (i18n)
- Multi-language support via i18next
- Language switching capability
- Browser language detection

#### 2.5.3 SEO
- SEO component for meta tags
- Proper heading structure
- Semantic HTML

#### 2.5.4 Error Handling
- Error boundary component
- Toast notification system
- 404 Not Found page

#### 2.5.5 Performance
- Lazy loading for all page components
- Optimized image component
- Page transition animations

---

## 3. Non-Functional Requirements

### 3.1 Security
- Supabase Row Level Security (RLS) policies
- Protected routes for authenticated areas
- Admin-only route protection
- XSS protection via DOMPurify

### 3.2 Performance
- Code splitting with React.lazy
- Optimized images
- Smooth page transitions with Framer Motion

### 3.3 Accessibility
- Semantic HTML structure
- Keyboard navigation support

### 3.4 Compliance
- KVKK (Turkish GDPR) compliance
- Cookie consent management
- Privacy policy disclosure

---

## 4. API Endpoints (Supabase)

### 4.1 Authentication
- `supabase.auth.signInWithPassword` - User login
- `supabase.auth.signUp` - User registration
- `supabase.auth.resetPasswordForEmail` - Password reset

### 4.2 Data Tables
- `users` - User profiles and roles
- `appointments` - Booking data
- `blog_posts` - Blog content
- `messages` - Contact form submissions
- `services` - Therapy services
- `methods` - Therapy methods
- `config` - Site configuration
- `ads` - Promotional content
- `clients` - Client records

---

## 5. Deployment

- **Hosting**: Hostinger (static build deployment)
- **Database**: Supabase Cloud
- **Build**: `vite build` produces static assets
- **Dev Server**: `vite` on port 3000
