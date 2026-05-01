# Portfolio — Konstantin Zhitkov

A modern, minimalist portfolio website showcasing projects and experiments by Konstantin Zhitkov, a front-end developer from Saint Petersburg, Russia.

**Live site:** https://zhitkovkostya.github.io/portfolio/

## Overview

This is a Jekyll-based static site portfolio with:
- Clean, responsive design with mobile support
- Image carousel/slider functionality (Swiper.js)
- Project showcase with tagging and filtering
- Git-based CMS integration (Netlify CMS)
- Docker setup for local development

## Technology Stack

- **Static Generator:** Jekyll 3.8.6
- **Styling:** SCSS with autoprefixer
- **Frontend:** Vanilla JavaScript (ES6+)
- **Slider:** Swiper.js
- **CMS:** Netlify CMS (optional, admin interface)
- **Build:** Docker & Docker Compose
- **Hosting:** Deployment-ready static site

## Project Structure

```
portfolio/
├── _posts/              # Portfolio projects (Markdown posts with front matter)
├── _layouts/            # Jekyll HTML layouts (default.html)
├── _includes/           # Reusable template components (post.html)
├── assets/
│   ├── images/          # Project screenshots and assets
│   ├── styles/          # SCSS stylesheets (main.scss + components)
│   ├── scripts/         # JavaScript (main.js with Swiper setup)
│   └── libs/            # Third-party libraries (Swiper.js)
├── admin/               # Netlify CMS configuration
├── _config.yml          # Jekyll configuration
├── docker-compose.yml   # Docker Compose setup for development
└── package.json         # Project metadata and dependencies
```

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Ruby with Jekyll and Bundler

### Development with Docker

```bash
# Start local development server with live reload
npm start
# Server runs at http://localhost:8080
```

### Development without Docker

```bash
# Install dependencies
bundle install

# Start Jekyll with live reload
bundle exec jekyll serve --livereload --verbose
```

## Adding a New Project

Create a new Markdown file in `_posts/` with the naming convention `YYYY-MM-DD-slug.md`:

```markdown
---
title: Project Name
date: 2024-04-11T00:00:00.000Z
color: "#e6e6e6"
tags:
  - react
  - typescript
  - css3
links:
  - title: View website
    url: https://example.com
images:
  - url: /assets/images/screenshot.png
    title: Screenshot description
---

Brief project description for the portfolio card.
```

### Front Matter Fields
- **title:** Project name
- **date:** Publication date
- **color:** Card background color (hex)
- **tags:** Technology/skill tags
- **links:** Project URLs (website, GitHub, etc.)
- **images:** Screenshots/project images with titles

## Content Management

### Using Netlify CMS

Visit `/admin/` to access the Netlify CMS interface for managing projects and content.

Configuration file: `admin/config.yml`

### Manual Editing

Edit `_posts/` files directly and push to git. Site rebuilds automatically on deployment.

## Styling & Components

SCSS modules in `assets/styles/`:
- `_variables.scss` — Design tokens and colors
- `_base.scss` — Base HTML styles
- `_portfolio.scss` — Portfolio grid
- `_project.scss` — Project card component
- `_swiper.scss` — Image carousel customization
- `_button.scss`, `_link.scss`, `_tag.scss` — Atomic components
- `_fonts.scss` — Font definitions
- `_media.scss` — Media queries and responsive design

Main stylesheet: `main.scss`

## JavaScript

`assets/scripts/main.js`:
- Swiper carousel initialization
- Portfolio interaction handlers
- Tag cloud generation and filtering
- Dynamic portfolio item selection

## Configuration

### Site Settings (`_config.yml`)
```yaml
title: Konstantin Zhitkov Portfolio v1.0
url: https://zhitkovkostya.github.io/portfolio/
email: zhitkovkostya@gmail.com
socials:
  GIT: GitHub profile
  IN: LinkedIn profile
  IG: Instagram profile
  Mail: Email contact
```

### Build Exclusions
- `node_modules`, `vendor`, `Gemfile`, `package.json`, `README.md`

## Performance & Optimization

- Autoprefixer: Automatically adds vendor prefixes to CSS (production builds only)
- Static site: No database or server-side processing required
- Lazy-loaded images via Swiper
- Minified CSS/JS on build

## Deployment

The site is a static Jekyll build, ready for deployment to:
- Netlify (with CMS integration)
- GitHub Pages
- Any static hosting (Vercel, Firebase, etc.)

Build output: `_site/` directory

## Browser Support

Targets modern browsers with graceful degradation:
- Autoprefixer coverage based on `_config.yml` settings
- Responsive design tested on mobile and desktop
- CSS Grid and Flexbox for layout

## License

ISC

## Author

Konstantin Zhitkov — [@zhitkovkostya](https://github.com/zhitkovkostya)

- GitHub: https://github.com/zhitkovkostya
- LinkedIn: https://linkedin.com/in/zhitkovkostya
- Website: https://zhitkovkostya.github.io/portfolio/
