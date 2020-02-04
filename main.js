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
        this.posts = this.createPostCollection(postElements);

        this.createPostClones();
        this.scrollToPost(1);

        this.element.addEventListener('scroll', this.onScroll.bind(this));
    }

    Blog.prototype.createPostClones = function() {
        var firstPostElement = this.posts[0].element,
            lastPostElement = this.posts[this.posts.length - 1].element,
            parentElement = lastPostElement.parentElement,
            firstPostCloneElement, firstPostCloneInstance, lastPostCloneElement, lastPostCloneInstance;

        firstPostCloneElement = firstPostElement.cloneNode(true);
        lastPostCloneElement = lastPostElement.cloneNode(true);
        parentElement.insertBefore(firstPostCloneElement, lastPostElement.nextSibling);
        parentElement.insertBefore(lastPostCloneElement, firstPostElement);
        firstPostCloneInstance = this.createPostModel(firstPostCloneElement);
        lastPostCloneInstance = this.createPostModel(lastPostCloneElement);

        this.posts.push(firstPostCloneInstance);
        this.posts.unshift(lastPostCloneInstance);
    };

    Blog.prototype.createPostCollection = function(postElements) {
        return Array.from(postElements).map(this.createPostModel);
    };

    Blog.prototype.createPostModel = function(postElement) {
        return new Post({ element: postElement });
    };

    Blog.prototype.getActiveColor = function() {
        return document.documentElement.style.getPropertyValue('--background-color')
    };

    Blog.prototype.setActiveColor = function(color) {
        document.documentElement.style.setProperty('--background-color', color);
    };

    Blog.prototype.scrollToPost = function(index, position) {
        var position = position || 'top';
        var post = this.posts[index];
        var value = position === 'bottom'
            ? post.element.offsetTop + post.element.offsetHeight
            : post.element.offsetTop;

        this.element.scrollTo({top: value});
    };

    Blog.prototype.onScroll = function(event) {
        if (this.element.offsetHeight + this.element.scrollTop >= this.element.scrollHeight) {
            event.preventDefault();
            this.scrollToPost(1, 'bottom');
        } else if (this.element.scrollTop === 0) {
            event.preventDefault();
            this.scrollToPost(this.posts.length - 2);
        }
    };

    function Post(data) {
        var me = this,
            io;

        this.element = data.element;
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
