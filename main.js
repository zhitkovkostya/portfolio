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
        this._clonedPost = this.clonePost();

        this.initScrollLoop();
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
                me.setScrollPosition(5);
            }
        }, {
            threshold: [0.95]
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


    function TagList(element) {
        this.element = element;
        this.tagElements = Array.from(this.element.querySelectorAll('.js-tag'));
        this.collection = this.createCollection();
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

    function Tag(data) {
        this.element = data.element;
        this.name = data.name;
        this.text = data.text;
    }

    Tag.prototype.toggleActive = function(state) {
        this.element.classList.toggle('tags__item--active', state);
    }
})();
