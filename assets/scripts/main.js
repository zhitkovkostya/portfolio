/**
 * Portfolio — Vanilla JS with SOLID principles
 *
 * Classes:
 * - ColorInterpolator: pure color math
 * - BackgroundUpdater: scroll-driven background color
 * - TagCloud: tag rendering and activation
 * - InfiniteScroll: seamless infinite scroll
 * - SwiperManager: Swiper initialization
 * - Portfolio: orchestrator
 */

class ColorInterpolator {
  parse(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  lerp(colorA, colorB, t) {
    const tc = Math.min(1, Math.max(0, t));
    return [
      Math.round(colorA[0] + (colorB[0] - colorA[0]) * tc),
      Math.round(colorA[1] + (colorB[1] - colorA[1]) * tc),
      Math.round(colorA[2] + (colorB[2] - colorA[2]) * tc),
    ];
  }

  toString(color) {
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  }
}

class BackgroundUpdater {
  constructor(portfolioEl, colorInterpolator) {
    this.el = portfolioEl;
    this.interpolator = colorInterpolator;
    this.el.style.transition = 'none';
  }

  update(allItems, scrollTop) {
    if (allItems.length === 0) return;

    let lowerIdx = 0;
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].offsetTop <= scrollTop) {
        lowerIdx = i;
      } else {
        break;
      }
    }

    const itemA = allItems[lowerIdx];
    const itemB = allItems[Math.min(lowerIdx + 1, allItems.length - 1)];

    const projectA = itemA.querySelector('.js-project');
    const projectB = itemB.querySelector('.js-project');

    if (!projectA || !projectB) return;

    const colorA = this.interpolator.parse(projectA.dataset.color || '#000000');
    const colorB = this.interpolator.parse(projectB.dataset.color || '#000000');

    const topA = itemA.offsetTop;
    const topB = itemB.offsetTop;

    let t = 0;
    if (topB !== topA) {
      t = (scrollTop - topA) / (topB - topA);
    }

    const blended = this.interpolator.lerp(colorA, colorB, t);
    this.el.style.backgroundColor = this.interpolator.toString(blended);
  }
}

class TagCloud {
  constructor(containerEl) {
    this.el = containerEl;
    this.tagMap = new Map();
    this.activeTagNames = new Set();
  }

  build(projects) {
    const allTags = new Set();

    projects.forEach((project) => {
      const tagsAttr = project.dataset.tags;
      if (!tagsAttr) return;

      tagsAttr.split(',').forEach((rawTag) => {
        const tag = rawTag.trim();
        if (tag) allTags.add(tag);
      });
    });

    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach((tag) => {
      const li = document.createElement('li');
      li.className = 'tag js-tag';
      li.textContent = tag;
      this.el.appendChild(li);
      this.el.appendChild(document.createTextNode(' '));
      this.tagMap.set(tag, li);
    });
  }

  setActiveProject(tagsString) {
    const newTags = new Set();
    if (tagsString) {
      tagsString.split(',').forEach((rawTag) => {
        const tag = rawTag.trim();
        if (tag) newTags.add(tag);
      });
    }

    this.tagMap.forEach((el, tagName) => {
      if (newTags.has(tagName)) {
        if (!this.activeTagNames.has(tagName)) {
          el.classList.add('tag--active');
          this.activeTagNames.add(tagName);
        }
      } else {
        if (this.activeTagNames.has(tagName)) {
          el.classList.remove('tag--active');
          this.activeTagNames.delete(tagName);
        }
      }
    });
  }
}

class InfiniteScroll {
  constructor(containerEl) {
    this.el = containerEl;
    this.itemCount = 0;
    this.itemHeight = 0;
  }

  setup() {
    const realItems = Array.from(this.el.querySelectorAll('.js-portfolio-item'));
    const N = realItems.length;

    if (N === 0) return { itemCount: 0, itemHeight: 0 };

    const leadingClone = realItems[N - 1].cloneNode(true);
    leadingClone.setAttribute('aria-hidden', 'true');
    this.el.insertBefore(leadingClone, realItems[0]);

    const trailingClone = realItems[0].cloneNode(true);
    trailingClone.setAttribute('aria-hidden', 'true');
    this.el.appendChild(trailingClone);

    this.itemHeight = realItems[0].offsetHeight;
    this.itemCount = N;

    this.el.scrollTop = this.itemHeight;

    return { itemCount: N, itemHeight: this.itemHeight };
  }

  checkBoundary(scrollTop) {
    if (this.itemHeight === 0 || this.itemCount === 0) return false;

    if (scrollTop < this.itemHeight) {
      this.el.scrollTop = scrollTop + this.itemCount * this.itemHeight;
      return true;
    }

    if (scrollTop >= (this.itemCount + 1) * this.itemHeight) {
      this.el.scrollTop = scrollTop - this.itemCount * this.itemHeight;
      return true;
    }

    return false;
  }
}

class AnchorNavigation {
  constructor(portfolioEl) {
    this.el = portfolioEl;
  }

  handleHash() {
    const slug = window.location.hash.slice(1);
    if (!slug) return;

    const project = this.el.querySelector(`[data-slug="${slug}"]`);
    if (!project) return;

    const item = project.closest('.js-portfolio-item');
    if (item) {
      item.scrollIntoView({ block: 'start' });
    }
  }

  attach() {
    window.addEventListener('hashchange', () => this.handleHash(), { passive: true });
    this.handleHash();
  }
}

class TagCloudFitter {
  constructor(containerEl, parentEl) {
    this.el = containerEl;
    this.parent = parentEl;
    this._debounceTimer = null;
  }

  fit() {
    const parentH = this.parent.offsetHeight;
    if (!parentH) return;

    let fontSize = 3;
    this.el.style.fontSize = fontSize.toFixed(2) + 'rem';

    while (this.el.offsetHeight < parentH) {
      fontSize += 0.1;
      this.el.style.fontSize = fontSize.toFixed(2) + 'rem';
    }

    if (this.el.offsetHeight > parentH) {
      this.el.style.fontSize = ((fontSize - 0.1).toFixed(2)) + 'rem';
    }
  }

  attach() {
    document.fonts.ready.then(() => this.fit());
    window.addEventListener('resize', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.fit(), 150);
    }, { passive: true });
    window.addEventListener('orientationchange', () => this.fit(), { passive: true });
  }
}

class SwiperManager {
  static updateTextTop(item) {
    const header = item.querySelector('.js-project-header');
    if (!header) return;
    item.style.setProperty('--header-height', header.offsetHeight + 'px');
  }

  static init(items) {
    items.forEach((item) => {
      const swiperEl = item.querySelector('.js-swiper');
      const paginationEl = swiperEl?.querySelector('.js-swiper-pagination');
      const slideCount = swiperEl?.querySelectorAll('.js-swiper-slide').length || 0;

      if (!swiperEl || slideCount === 0) return;

      new window.Swiper(swiperEl, {
        loop: slideCount > 1,
        watchOverflow: true,
        resizeObserver: true,
        watchSlidesProgress: true,
        preloadImages: false,
        lazy: {
          loadOnTransitionStart: true,
          elementClass: 'image--lazy',
        },
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        followFinger: false,
        pagination: paginationEl
          ? {
              el: paginationEl,
              type: 'bullets',
              clickable: true,
              bulletElement: 'button',
              bulletClass: 'button',
              bulletActiveClass: 'button--active',
            }
          : false,
        a11y: {
          enabled: true,
        },
        keyboard: {
          enabled: true,
        },
        on: {
          init: () => SwiperManager.updateTextTop(item),
          resize: () => SwiperManager.updateTextTop(item),
        },
      });
    });
  }
}

class Portfolio {
  constructor(portfolioEl, tagCloudEl) {
    this.portfolioEl = portfolioEl;
    this.tagCloudEl = tagCloudEl;
    this.ticking = false;

    this.colorInterpolator = new ColorInterpolator();
    this.backgroundUpdater = new BackgroundUpdater(portfolioEl, this.colorInterpolator);
    this.tagCloud = new TagCloud(tagCloudEl);
    this.tagCloudFitter = new TagCloudFitter(tagCloudEl, tagCloudEl.parentElement);
    this.anchorNavigation = new AnchorNavigation(portfolioEl);
    this.infiniteScroll = new InfiniteScroll(portfolioEl);
  }

  init() {
    const realItems = Array.from(this.portfolioEl.querySelectorAll('.js-portfolio-item'));
    const realProjects = realItems.map((item) => item.querySelector('.js-project'));

    this.tagCloud.build(realProjects);
    this.tagCloudFitter.attach();
    this.infiniteScroll.setup();

    // Get all items including clones for Swiper initialization
    const allItems = Array.from(this.portfolioEl.querySelectorAll('.js-portfolio-item'));
    SwiperManager.init(allItems);

    // Update text top on window resize
    let _textResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(_textResizeTimer);
      _textResizeTimer = setTimeout(() => {
        allItems.forEach(item => SwiperManager.updateTextTop(item));
      }, 150);
    }, { passive: true });

    this._render();
    this._attachScrollListener();
    this.anchorNavigation.attach();
  }

  _render() {
    const allItems = this.portfolioEl.querySelectorAll('.js-portfolio-item');
    const scrollTop = this.portfolioEl.scrollTop;
    const viewportH = this.portfolioEl.clientHeight;

    this.backgroundUpdater.update(allItems, scrollTop);
    this._updateActiveTags(allItems, scrollTop, viewportH);
  }

  _updateActiveTags(allItems, scrollTop, viewportH) {
    let maxVisible = 0;
    let dominantProject = null;

    allItems.forEach((item) => {
      const top = item.offsetTop;
      const height = item.offsetHeight;
      const visibleTop = Math.max(top, scrollTop);
      const visibleBottom = Math.min(top + height, scrollTop + viewportH);
      const visible = Math.max(0, visibleBottom - visibleTop);

      if (visible > maxVisible) {
        maxVisible = visible;
        dominantProject = item.querySelector('.js-project');
      }
    });

    if (!dominantProject || maxVisible <= viewportH * 0.5) {
      this.tagCloud.setActiveProject('');
      return;
    }

    this.tagCloud.setActiveProject(dominantProject.dataset.tags || '');
  }

  _attachScrollListener() {
    this.portfolioEl.addEventListener('scroll', () => this._onScroll(), { passive: true });
  }

  _onScroll() {
    if (this.ticking) return;
    this.ticking = true;

    requestAnimationFrame(() => {
      const scrollTop = this.portfolioEl.scrollTop;

      const jumped = this.infiniteScroll.checkBoundary(scrollTop);

      if (!jumped) {
        this._render();
      }

      this.ticking = false;
    });
  }
}

(function () {
  'use strict';

  const portfolioEl = document.querySelector('.js-portfolio');
  const tagCloudEl = document.querySelector('.js-tag-cloud');

  if (!portfolioEl || !tagCloudEl) return;

  const portfolio = new Portfolio(portfolioEl, tagCloudEl);
  portfolio.init();
}());
