'use strict';

(function () {
    var blog;

    document.addEventListener('DOMContentLoaded', onDocumentReady);

    window.addEventListener('scroll', throttle(onWindowScroll));

    function throttle(func, wait) {
        var wait = wait || 100,
            timer = null;

        return function(...args) {
            if (timer === null) {
                timer = setTimeout(() => {
                    func.apply(this, args);
                    timer = null;
                }, wait);
            }
        };
    }

    function onDocumentReady() {
        var postElements = document.querySelectorAll('.js-post');

        blog = new Blog(postElements);

        onWindowScroll();
    }

    function onWindowScroll(event) {
        var root = document.documentElement,
            scrollPosition = window.scrollY,
            visiblePost = blog.getVisiblePost(scrollPosition);

        root.style.setProperty('--background-color', visiblePost.color);
    }

    function Blog(postElements) {
        this.posts = this.createPostCollection(postElements);
    }

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

    Blog.prototype.getVisiblePost = function(scrollPosition) {
        var viewportCenterPosition = scrollPosition + (window.outerHeight / 1.5),
            posts = this.posts,
            postsCount = posts.length,
            index = 0,
            post, visiblePost;

        while (!visiblePost && index < postsCount) {
            post = posts[index];

            if (viewportCenterPosition >= post.y1 && viewportCenterPosition <= post.y2) {
                visiblePost = post;
            }

            index += 1;
        }

        return visiblePost;
    };

    function Post(data) {
        var colorDefault = document.documentElement.style.getPropertyValue('--background-color');

        this.element = data.element;
        this.color = this.element.dataset.color || colorDefault;
        this.y1 = data.y1;
        this.y2 = data.y2;
    }
})();
