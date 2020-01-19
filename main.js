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

        this.onResize();
        this.onScroll();

        window.addEventListener('resize', function() {
            window.requestAnimationFrame(me.onResize.bind(me))
        });
        window.addEventListener('scroll', function() {
            window.requestAnimationFrame(me.onScroll.bind(me))
        });
    }

    Blog.prototype.onResize = function() {
        var scrollPosition = this.getScrollPosition();

        if (scrollPosition <= 0) {
            this.setScrollPosition(1); // Scroll 1 pixel to allow upwards scrolling
        }
    };

    Blog.prototype.onScroll = function() {
        var root = document.documentElement,
            visiblePost = this.getVisiblePost();

        root.style.setProperty('--background-color', visiblePost.color);
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
