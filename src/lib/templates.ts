import { Template } from './types';

export const templates: Template[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero section with navigation, headline, CTA, and feature cards',
    cols: 82,
    rows: 18,
    content: `┌──────────────────────────────────────────────────────────────────────────────┐
│  Logo   │  Home  │  About  │  Pricing  │  Blog  │              [Sign Up]    │
└──────────────────────────────────────────────────────────────────────────────┘

                    ╔══════════════════════════════════╗
                    ║     Your Amazing Product         ║
                    ╚══════════════════════════════════╝

              A short tagline describing what your product does

                         ┌────────────────┐
                         │   Get Started  │
                         └────────────────┘

    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  Feature 1      │  │  Feature 2      │  │  Feature 3      │
    │  Description    │  │  Description    │  │  Description    │
    └─────────────────┘  └─────────────────┘  └─────────────────┘`,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'App dashboard with sidebar, stat cards, and chart area',
    cols: 82,
    rows: 15,
    content: `┌──────────────────────────────────────────────────────────────────────────────┐
│  App  │  Dashboard  │  Reports  │  Settings  │               [Avatar]       │
└──────────────────────────────────────────────────────────────────────────────┘
┌────────────┐ ┌──────────────────────────────────────────────────────────────┐
│  Menu      │ │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ ─────────  │ │  │  Card 1  │ │  Card 2  │ │  Card 3  │ │  Card 4  │       │
│  Overview  │ │  │  Value   │ │  Value   │ │  Value   │ │  Value   │       │
│  Analytics │ │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  Reports   │ │                                                             │
│  Users     │ │  ┌──────────────────────────────────────────────────────┐   │
│  Settings  │ │  │                                                      │   │
│            │ │  │              Chart / Graph Area                       │   │
│            │ │  │                                                      │   │
│            │ │  └──────────────────────────────────────────────────────┘   │
└────────────┘ └──────────────────────────────────────────────────────────────┘`,
  },
  {
    id: 'login',
    name: 'Login Form',
    description: 'Centered login card with email, password, and CTA',
    cols: 49,
    rows: 22,
    content: `
            ┌─────────────────────────────────┐
            │         ┌───┐                   │
            │         │ A │                   │
            │         └───┘                   │
            │                                 │
            │     Welcome Back                │
            │                                 │
            │  Email:                         │
            │  [_____________________________]│
            │                                 │
            │  Password:                      │
            │  [_____________________________]│
            │                                 │
            │  [x] Remember me                │
            │                                 │
            │  ┌─────────────────────────────┐│
            │  │          Sign In            ││
            │  └─────────────────────────────┘│
            │                                 │
            │  Don't have an account? Sign Up │
            └─────────────────────────────────┘`,
  },
  {
    id: 'settings',
    name: 'Settings Page',
    description: 'Form-heavy page with sections, toggles, and inputs',
    cols: 82,
    rows: 25,
    content: `┌──────────────────────────────────────────────────────────────────────────────┐
│  App  │  Dashboard  │  Reports  │  Settings  │               [Avatar]       │
└──────────────────────────────────────────────────────────────────────────────┘

  ╔══════════════════════════════════════╗
  ║            Settings                  ║
  ╚══════════════════════════════════════╝

  Profile
  ────────────────────────────────────────
  Name:      [_____________________________]
  Email:     [_____________________________]
  Bio:       ┌─────────────────────────────┐
             │                             │
             └─────────────────────────────┘

  Notifications
  ────────────────────────────────────────
  Email alerts    [    ●====] On
  Push alerts     [====○    ] Off
  Weekly digest   [    ●====] On

        ┌──────────┐  ┌──────────┐
        │  Cancel  │  │   Save   │
        └──────────┘  └──────────┘`,
  },
  {
    id: 'data-table',
    name: 'Data Table View',
    description: 'Search bar, filters, data table with pagination',
    cols: 82,
    rows: 20,
    content: `┌──────────────────────────────────────────────────────────────────────────────┐
│  App  │  Dashboard  │  Users  │  Settings  │                 [Avatar]       │
└──────────────────────────────────────────────────────────────────────────────┘

  Home > Users > All Users

  [Search________________]  ┌──────────────┐  ┌──────────────┐
                            │ Filter...  ▼ │  │  + Add User  │
                            └──────────────┘  └──────────────┘

  ┌──────┬──────────────────┬──────────────┬──────────┬──────────┐
  │  ID  │  Name            │  Email       │  Role    │  Status  │
  ├──────┼──────────────────┼──────────────┼──────────┼──────────┤
  │  01  │  Alice Johnson   │  alice@...   │  Admin   │  Active  │
  │  02  │  Bob Smith       │  bob@...     │  User    │  Active  │
  │  03  │  Carol White     │  carol@...   │  Editor  │  Paused  │
  │  04  │  Dave Brown      │  dave@...    │  User    │  Active  │
  └──────┴──────────────────┴──────────────┴──────────┴──────────┘

  Showing 1-4 of 24            < 1  2  3  4  5  6 >`,
  },
];
