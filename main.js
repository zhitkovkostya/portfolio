'use strict';

(function () {
    var blog, tagList;

    document.addEventListener('DOMContentLoaded', onDocumentReady);

    function onDocumentReady() {
        var pageElement = document.querySelector('.js-page'),
            tagListElement = document.querySelector('.js-tag-list');

        blog = new Blog(pageElement);
        tagList = new TagList(tagListElement);
    }

    function Blog(pageElement) {
        var postElements = pageElement.querySelectorAll('.js-post');

        this.element = pageElement;
        this.mainElement = this.element.querySelector('.js-page-main');
        this.posts = this.createPostCollection(postElements);
        this._clonedPost = this.clonePost();
        this._scrollTop = window.scrollY;

        var me = this;

        document.addEventListener('mousewheel', function(event) {
            var scaleDelta = event.deltaY;

            event.preventDefault();
            event.stopPropagation();

            me._scrollTop -= scaleDelta;

            window.gsap.to(me.mainElement, {y: me._scrollTop, duration: .5});
        }, {
            passive: false
        });

        // this.initScrollLoop();
    }

    Blog.prototype.clonePost = function() {
        var firstPostElement = this.posts[0].element,
            lastPostElement = this.posts[this.posts.length - 1].element,
            parentElement = lastPostElement.parentElement,
            firstPostCloneElement, cloneInstance;

        firstPostCloneElement = firstPostElement.cloneNode(true);
        parentElement.insertBefore(firstPostCloneElement, lastPostElement.nextSibling);
        cloneInstance = this.createPostModel(firstPostCloneElement);

        this.posts.push(cloneInstance);

        return cloneInstance;
    };

    Blog.prototype.createPostCollection = function(postElements) {
        return Array.from(postElements).map(this.createPostModel);
    };

    Blog.prototype.createPostModel = function(postElement) {
        var postElementHeight = postElement.offsetHeight + parseInt(getComputedStyle(postElement).marginBottom);

        return new Post({
            element: postElement,
            y1: postElement.offsetTop,
            y2: postElement.offsetTop + postElementHeight
        });
    };

    Blog.prototype.getActiveColor = function() {
        return document.documentElement.style.getPropertyValue('--background-color')
    };

    Blog.prototype.setActiveColor = function(color) {
        document.documentElement.style.setProperty('--background-color', color);
    };

    Blog.prototype.setScrollPosition = function(position) {
        window.scrollTo({top: position});
    };

    Blog.prototype.initScrollLoop = function() {
        var me = this,
            firstPostElement = this.posts[0].element,
            lastPostElement = this.posts[this.posts.length - 1].element,
            lastPostIntersectionObserver, firstPostIntersectionObserver;

        this.setScrollPosition(5);

        lastPostIntersectionObserver = new IntersectionObserver(function(entries) {
            var entry = entries[0];

            if (entry.isIntersecting) {
                me.setScrollPosition(0);
            }
        }, {
            threshold: [1]
        });

        lastPostIntersectionObserver.observe(lastPostElement);
    };

    function Post(data) {
        var me = this,
            io;

        this.element = data.element;
        this.y1 = data.y1;
        this.y2 = data.y2;
        this.color = this.element.dataset.color;
        this.tags = this.parseTags(this.element.dataset.tags);
        this.slider = this.createSlider();

        io = new IntersectionObserver(function(entries) {
            var entry = entries[0];

            if (entry.isIntersecting) {
                tagList.setActiveTags(me.tags);
                blog.setActiveColor(me.color)
            }
        });

        io.observe(this.element);
    }

    /**
     *
     * @param rawTags - project tags (e.g. 'react,redux,webpack')
     * @returns {*}
     */
    Post.prototype.parseTags = function(rawTags) {
        rawTags = rawTags || '';

        return rawTags.split(',');
    };

    Post.prototype.createSlider = function() {
        var sliderElement = this.element.querySelector('.js-slider'),
            slider = sliderElement ? new Slider(sliderElement, this.element) : null;

        return slider;
    };


    function TagList(element) {
        this.element = element;
        this.tagElements = Array.from(this.element.querySelectorAll('.js-tag'));
        this.collection = this.createCollection();

        this.fitText();

        window.addEventListener('resize', this.fitText.bind(this));
        window.addEventListener('orientationchange', this.fitText.bind(this));
    }

    TagList.prototype.createCollection = function() {
        var collection, name, text;

        collection = this.tagElements.map(function(element) {
            name = element.dataset.name.toLowerCase();
            text = element.textContent.toLowerCase();

            return new Tag({
                element: element,
                name: name,
                text: text
            });
        });

        return collection;
    };

    /**
     * @param tags {[String]} - an array of tags
     */
    TagList.prototype.setActiveTags = function(tags) {
        this.collection.forEach(function(tag) {
            tag.toggleActive(tags.includes(tag.name));
        });
    };

    TagList.prototype.fitText = function(tags) {
        var parentHeight = this.element.parentElement.offsetHeight,
            fontSize = 3;

        this.setFontSize(fontSize);

        while (this.element.offsetHeight < parentHeight) {
            fontSize += 0.1;
            this.setFontSize(fontSize);
        }
    };

    TagList.prototype.setFontSize = function(fontSize) {
        document.documentElement.style.setProperty('--font-size-tags', fontSize + 'rem');
    };

    function Tag(data) {
        this.element = data.element;
        this.name = data.name;
        this.text = data.text;
    }

    Tag.prototype.toggleActive = function(state) {
        this.element.classList.toggle('tags__item--active', state);
    };

    function Slider(element, postElement) {
        this.element = element;
        this.postElement = postElement;
        this.index = null;
        this.controlsElement = this.getControlsElement();
        this.slides = this.getSlides();
        this.controls = this.createControls();

        this.renderControls();
        this.setActiveSlide(0);
    }

    Slider.prototype.getSlides = function() {
        var slideElements = this.element.querySelectorAll('.js-slide');

        return Array.from(slideElements);
    };

    Slider.prototype.getControlsElement = function() {
        var controlsElements = this.element.querySelector('.js-controls');

        return controlsElements;
    };

    Slider.prototype.createControls = function() {
        var controls = this.slides.length > 1 ? this.slides.map(this.createControl.bind(this)) : [];
        return controls;
    };

    Slider.prototype.createControl = function(item, index) {
        var controlElement = document.createElement('li'),
            buttonElement = document.createElement('button');

        controlElement.classList.add('controls__item');
        controlElement.setAttribute('tabindex', '-1');
        controlElement.setAttribute('data-index', String(index));
        buttonElement.classList.add('controls__button');

        if (index === this.index) {
            buttonElement.classList.add('controls__button--active');
        }

        controlElement.appendChild(buttonElement);

        buttonElement.addEventListener('click', this.onControlClick.bind(this, index));

        return controlElement;
    };

    Slider.prototype.onControlClick = function(index) {
        this.setActiveSlide(index);
    };

    Slider.prototype.setActiveSlide = function(activeSlideIndex) {
        this.index = activeSlideIndex;

        this.slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('slider__item--active', slideIndex === activeSlideIndex);
        });

        this.controls.forEach(function(control, controlIndex) {
            control.classList.toggle('controls__button--active', controlIndex === activeSlideIndex);
        });

        this.postElement.classList.toggle('post--wide', activeSlideIndex > 0);
    };

    Slider.prototype.renderControls = function() {
        this.controls.map(this.renderControl.bind(this));
    };

    Slider.prototype.renderControl = function(controlElement) {
        this.controlsElement.appendChild(controlElement);
    };
})();
