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
        var me = this,
            postElements = pageElement.querySelectorAll('.js-post');

        this.element = pageElement;
        this.posts = this.createPostCollection(postElements);
        this._clonedPosts = this.clonePosts();
        this._scrollPosition = 0;
        this._scrollHeight = 0;
        this._clonedPostsHeight = 0;

        this.cacheValues();
        this.onResize();
        this.onScroll();

        window.addEventListener('resize', function() {
            window.requestAnimationFrame(me.onResize.bind(me))
        });
        document.addEventListener('wheel', function() {
            window.requestAnimationFrame(me.onScroll.bind(me))
        }, {
      capture: true,
      passive: true
    });
    }

    Blog.prototype.cacheValues = function() {
        this._scrollPosition = this.getScrollPosition();
        this._scrollHeight = this.getScrollHeight();
        this._clonedPostsHeight = this.getClonedPostsHeight();

        if (this._scrollPosition <= 0) {
            // Scroll 1px to allow upwards scrolling
            this.setScrollPosition(1);
        }
    };

    Blog.prototype.onResize = function() {
        this.cacheValues();
    };

    Blog.prototype.onScroll = function() {
        var scrollPosition = this.getScrollPosition(),
            scrollPositionNext;

        // Scroll to the top when you’ve reached the bottom
        if (this._clonedPostsHeight + scrollPosition >= this._scrollHeight) {
            // Scroll down 1 pixel to allow upwards scrolling
            scrollPositionNext = 1;
        } else if (scrollPosition <= 0) {
            // Scroll to the bottom when you reach the top
            scrollPositionNext = this._scrollHeight - this._clonedPostsHeight;
        }

        this.setScrollPosition(scrollPositionNext);
    };

    Blog.prototype.clonePosts = function() {
        var postElements = this.posts.map(function(post) {
                return post.element;
            }),
            lastPostElement = postElements[postElements.length - 1],
            parentElement = lastPostElement.parentElement,
            postClones = [],
            cloneElement, cloneInstance, i;

        cloneElement = postElements[0].cloneNode(true);
        parentElement.insertBefore(cloneElement, lastPostElement.nextSibling);
        cloneInstance = this.createPostModel(cloneElement);

        this.posts.push(cloneInstance);
        postClones.push(cloneInstance);

        return postClones;
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

    Blog.prototype.getClonedPostsHeight = function() {
        var postElement, postMarginBottom, postHeight;

        return this._clonedPosts.reduce(function(totalHeight, clonedPost) {
            postElement = clonedPost.element;
            postMarginBottom = parseInt(getComputedStyle(postElement).marginBottom);
            postHeight = postElement.offsetHeight;

            return totalHeight + postHeight + postMarginBottom;
        }, 0);
    };

    Blog.prototype.getScrollHeight = function() {
        var verticalPadding = parseInt(getComputedStyle(this.element).paddingTop)
            + parseInt(getComputedStyle(this.element).paddingBottom);

        return this.element.scrollHeight - verticalPadding;
    };

    Blog.prototype.getScrollPosition = function() {
        return window.scrollY;
    };

    Blog.prototype.setScrollPosition = function(position) {
        window.scrollTo({top: position});
    };

    function Post(data) {
        var me = this,
            io;

        this.element = data.element;
        this.y1 = data.y1;
        this.y2 = data.y2;
        this.color = this.element.dataset.color;
        this.tags = this.parseTags(this.element.dataset.tags);

        io = new IntersectionObserver(entries => {
            var entry = entries[0];

            if (entry.isIntersecting) {
                tagList.setActiveTags(me.tags);
                blog.setActiveColor(this.color)
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
