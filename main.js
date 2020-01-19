'use strict';

(function () {
    var blog;

    document.addEventListener('DOMContentLoaded', onDocumentReady);

    function onDocumentReady() {
        var pageElement = document.querySelector('.js-page');

        blog = new Blog(pageElement);
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
        this._isScrollDisabled = false;

        this.cacheValues();
        this.onResize();
        this.onScroll();

        window.addEventListener('resize', function() {
            window.requestAnimationFrame(me.onResize.bind(me))
        });
        window.addEventListener('scroll', function() {
            if (!this._isScrollDisabled) {
                window.requestAnimationFrame(me.onScroll.bind(me))
                this._isScrollDisabled = true;
            }
        });

        // Disable scroll-jumping for a short time to avoid flickering
        window.setInterval(function () {
            this._isScrollDisabled = false;
        }, 100);
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
        var root = document.documentElement,
            visiblePost = this.getVisiblePost(),
            scrollPosition = this.getScrollPosition(),
            scrollPositionNext;

        root.style.setProperty('--background-color', visiblePost.color);


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

    Blog.prototype.getVisiblePost = function() {
        var scrollPosition = this.getScrollPosition(),
            viewportCenterPosition = scrollPosition + (window.outerHeight / 1.5),
            posts = this.posts,
            postsCount = posts.length,
            index = 0,
            post, visiblePost;

        // TODO: remove
        this.element.dataset.scrollPosition = scrollPosition;

        while (!visiblePost && index < postsCount) {
            post = posts[index];

            if (viewportCenterPosition >= post.y1 && viewportCenterPosition <= post.y2) {
                visiblePost = post;
            }

            index += 1;
        }

        return visiblePost;
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
        var colorDefault = document.documentElement.style.getPropertyValue('--background-color');

        this.element = data.element;
        this.color = this.element.dataset.color || colorDefault;
        this.y1 = data.y1;
        this.y2 = data.y2;
    }
})();
