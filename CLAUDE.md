# CLAUDE.md — Portfolio Codebase Guide

## Quick Navigation

| What | Where |
|------|-------|
| Portfolio projects | `_posts/` |
| Site layout HTML | `_layouts/default.html` |
| Project card template | `_includes/post.html` |
| Styles (SCSS) | `assets/styles/` |
| JavaScript | `assets/scripts/main.js` |
| Site config | `_config.yml` |
| CMS config | `admin/config.yml` |

## Architecture Overview

This is a **Jekyll static site generator** project with:

1. **Content Layer:** Markdown posts in `_posts/` with YAML front matter
2. **Template Layer:** Liquid-based layouts and includes
3. **Style Layer:** SCSS modules with component-based organization
4. **Script Layer:** Vanilla JavaScript for interactivity (Swiper carousel, tag cloud)
5. **Build & Deployment:** Docker + Jekyll build pipeline

## Content Management

### Posts Format (`_posts/YYYY-MM-DD-slug.md`)

Every portfolio project is a Jekyll post with front matter:

```markdown
---
title: Project Name
date: 2024-04-11T00:00:00.000Z
color: "#e6e6e6"
tags: [react, typescript, css3]
links:
  - title: View website
    url: https://example.com
images:
  - url: /assets/images/screenshot.png
    title: Caption
---
Brief description (excerpt displayed on portfolio card)
```

**Key field behaviors:**
- `date` controls publish order (latest first)
- `color` sets portfolio card background (use hex colors)
- `tags` enable filtering on the portfolio page
- `links` are displayed as buttons on the project card
- `images` are shown in the Swiper carousel
- Content after front matter becomes the project excerpt

### Adding Projects

1. Create `_posts/YYYY-MM-DD-projectname.md`
2. Add front matter with required fields
3. Add brief description (1-3 sentences)
4. Place screenshots in `assets/images/`
5. Git commit and push (auto-deploys on Netlify)

## Templates & Liquid

### `_layouts/default.html`
Main site wrapper:
- Metadata (title, description, favicon)
- CSS/JS includes
- Layout structure: `<aside>` (tag cloud) + `<main>` (content)

### `_includes/post.html`
Portfolio card component. Used by `index.md` to render each project:

```liquid
{% include post.html
  title=post.title
  excerpt=post.excerpt
  color=post.color
  tags=post.tags
  images=post.images
  links=post.links
  is_inverted=false
%}
```

**Variables passed:**
- `title`, `excerpt`, `color`, `tags` — display properties
- `images`, `links` — carousel and button data
- `is_inverted` — affects styling (true for info card, false for projects)

### `index.md`
Portfolio page generator. Liquid loop renders info card + all posts:

```liquid
{% for post in site.posts %}
  {% include post.html slug=post.slug ... %}
{% endfor %}
```

Posts displayed newest-first (Jekyll default date sorting).

## Styling

### SCSS Module Organization

| File | Purpose |
|------|---------|
| `main.scss` | Imports and compiles all modules |
| `_variables.scss` | Colors, fonts, breakpoints, spacing tokens |
| `_base.scss` | HTML defaults and global resets |
| `_portfolio.scss` | Grid layout for portfolio items |
| `_project.scss` | Project card component styles |
| `_swiper.scss` | Carousel/slider customization |
| `_button.scss` | Button component (used for links) |
| `_link.scss` | Link styling |
| `_tag.scss` | Tag/label component |
| `_tag-cloud.scss` | Aside tag filter UI |
| `_fonts.scss` | Font faces (often large, contains @font-face definitions) |
| `_text.scss` | Typography utilities |
| `_media.scss` | Responsive breakpoints and media queries |
| `_aside.scss` | Aside container styling |

### Key Patterns

- **Variables:** Defined in `_variables.scss` and imported by all modules
- **Media Queries:** Centralized in `_media.scss` for consistency
- **Component Classes:** BEM naming (e.g., `.portfolio__item`, `.button--white`)
- **Responsive:** Mobile-first with breakpoints in `_media.scss`

### Build Configuration

```yaml
sass:
  sass_dir: assets/styles
autoprefixer:
  only_production: true
```

Autoprefixer automatically adds vendor prefixes during production builds.

## JavaScript

### `assets/scripts/main.js`

Handles:
1. **Swiper Initialization:** Image carousels for each project
2. **Portfolio Interaction:** Item selection and filtering
3. **Tag Cloud:** Dynamic tag generation and filtering
4. **Event Delegation:** Handles click events on portfolio items

**Key selectors:**
- `.js-portfolio` — Main portfolio grid
- `.js-portfolio-item` — Individual project card
- `.js-tag-cloud` — Tag filter sidebar
- `.js-swiper-*` — Swiper-specific elements

No frontend framework; vanilla JavaScript with DOM manipulation.

## Build & Deployment

### Docker Setup (`docker-compose.yml`)

```yaml
services:
  site:
    image: jekyll/jekyll:3.8.6
    command: jekyll serve --livereload --verbose
    ports:
      - 8080:4000
    volumes:
      - .:/srv/jekyll
```

**Start dev server:**
```bash
npm start  # or: docker-compose up
```

**Build output:** `_site/` (generated, git-ignored)

### Jekyll Configuration (`_config.yml`)

```yaml
markdown: kramdown          # Markdown parser
exclude: [node_modules, vendor, README.md, package.json, ...]
```

### Netlify CMS Integration

Enabled via `admin/` folder:
- `admin/index.html` — CMS interface
- `admin/config.yml` — Content model configuration

Allows non-technical users to edit `_posts/` via web UI.

## Local Development Workflow

1. **Start server:** `npm start` (Docker) or `bundle exec jekyll serve`
2. **Edit files:** Modify `_posts/`, `_layouts/`, `assets/styles/`, or `assets/scripts/`
3. **Live reload:** Changes auto-refresh in browser (via `--livereload`)
4. **Commit:** `git add . && git commit -m "message"`
5. **Deploy:** Push to main branch; Netlify auto-builds and deploys

## Common Tasks

### Add a New Project
1. Create `_posts/YYYY-MM-DD-projectname.md`
2. Fill in front matter (title, color, tags, links, images)
3. Add brief description
4. Place images in `assets/images/`
5. Commit and push

### Change Styling
1. Edit `.scss` file in `assets/styles/`
2. Jekyll auto-compiles on save
3. Browser auto-refreshes (live reload)

### Customize Fonts
- Modify `_fonts.scss` (contains @font-face definitions)
- Update font-family in `_variables.scss` if changing primary font

### Update Site Config
- `_config.yml` — Title, URL, email, social links
- `admin/config.yml` — CMS collections and fields

### Debug Liquid Templates
- Check `_includes/post.html` for variable syntax
- Verify front matter in `_posts/` matches expected fields
- Use Jekyll `{% debug %}` tags or browser inspector

## Dependencies

### Ruby Gems (via Bundler)
- `jekyll` 3.8.6 — Static site generator
- `jekyll-autoprefixer` — CSS vendor prefix automation
- Others in `Gemfile` (auto-installed by `bundle install`)

### NPM (minimal)
- `package.json` — Metadata only (no dependencies listed)
- Docker image includes all Ruby gems

### JavaScript Library
- **Swiper.js** (`assets/libs/swiper/`) — Image carousel library
  - Loaded in `_layouts/default.html`
  - Initialized in `assets/scripts/main.js`

## Performance Notes

- **Static output:** No server-side processing (fast, cacheable)
- **Autoprefixer:** CSS optimization in production
- **Minification:** Handled by Jekyll build (if configured)
- **Image optimization:** Manual (ensure images are compressed before adding)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 4000/8080 already in use | Change port in docker-compose.yml or kill process |
| Styles not updating | Clear `.sass-cache/` directory and restart server |
| New post not showing | Check `date` in front matter (must be in past) |
| Images not loading | Verify path in `images` list starts with `/assets/images/` |
| CMS not working | Check `admin/config.yml` syntax and Netlify deployment |

## Key Files to Know

- **`_config.yml`** — Everything about the site
- **`_posts/`** — The content
- **`assets/styles/main.scss`** — Compilation entry point for CSS
- **`assets/scripts/main.js`** — All frontend interactions
- **`_layouts/default.html`** — The HTML skeleton
- **`docker-compose.yml`** — Local dev setup

## Next Steps / Future Improvements

Potential enhancements (not currently implemented):
- Add search functionality to portfolio
- Implement project filtering by tags without page refresh (AJAX)
- Add dark mode toggle
- Optimize image loading (lazy-loading, srcset)
- Add analytics (Google Analytics, Plausible)
- Migrate to newer Jekyll/Ruby versions
