(function() {
    document.addEventListener('DOMContentLoaded', initPortfolio);

    function initPortfolio() {
        new Portfolio(document.querySelector('.js-portfolio'));
    }
})();

function Portfolio(element) {
    var me = this;

    this.element = element;
    this.projects = this.createProjectCollection();
    this.tagCloud = this.initTagCloud();

    this.scrollToProject(1);

    this.element.addEventListener('scroll', throttle(this.updateColorOnScroll.bind(this), 50));
    this.element.addEventListener('scroll', debounce(this.loopProjectsOnScroll.bind(this)));

    this.colors = this.projects.map(function(project) {
        return {
            color: project.color,
            position: project.element.offsetTop / me.element.scrollHeight * 100
        }
    });
    this.colors.push({
        color: this.projects[2].color,
        position: 100
    });
}

Portfolio.prototype.loopProjectsOnScroll = function(event) {
    var offsetHeight = this.element.offsetHeight,
        scrollHeight = this.element.scrollHeight,
        scrollTop = this.element.scrollTop;

    if (offsetHeight + scrollTop >= scrollHeight) {
        event.preventDefault();
        this.scrollToProject(1, 'bottom');
    } else if (this.element.scrollTop === 0) {
        event.preventDefault();
        this.scrollToProject(this.projects.length - 2);
    }
};

Portfolio.prototype.updateColorOnScroll = function() {
    var scrollHeight = this.element.scrollHeight,
        scrollTop = this.element.scrollTop,
        scrollAmount = scrollTop / scrollHeight * 100,
        relativePos, pos1, pos2, color, color1, color2, i;


    if (scrollAmount <= this.colors[0].position) {
        // Use the first color the the colors array
        this.setColor(this.colors[0].color);
    } else if (scrollAmount >= this.colors[this.colors.length - 1].position) {
        // Use the last color the the colors array
        this.setColor(this.colors[this.colors.length - 1].color);
    } else {
        // Get the position
        for (i = 0; i < this.colors.length; i += 1) {
            // Find out between which 2 colors we currently are
            if (scrollAmount >= this.colors[i].position) {
                pos1 = this.colors[i].position;
                color1 = this.colors[i].color;
            } else {
                pos2 = this.colors[i].position;
                color2 = this.colors[i].color;
                break;
            }
        }
    }

    // Calculate the relative amount scrolled
    relativePos = ((scrollAmount - pos1) / (pos2 - pos1));

    // Calculate new color value and set it using setColor
    color = this.calculateColor(color1, color2, relativePos);
    this.setColor(color);
};

Portfolio.prototype.createProjectCollection = function() {
    var projectElements;

    this.cloneElements();

    projectElements = this.element.querySelectorAll('.js-project');

    return Array.from(projectElements).map(this.createProjectModel.bind(this));
};

Portfolio.prototype.createProjectModel = function(element) {
    return new Project(element, {
        portfolio: this
    });
};

Portfolio.prototype.cloneElements = function() {
    var portfolioItemElements = this.element.querySelectorAll('.js-portfolio-item'),
        firstItemElement = portfolioItemElements[0],
        lastItemElement = portfolioItemElements[portfolioItemElements.length - 1],
        parentElement = lastItemElement.parentElement,
        firstProjectCloneElement, lastProjectCloneElement;

    firstProjectCloneElement = firstItemElement.cloneNode(true);
    lastProjectCloneElement = lastItemElement.cloneNode(true);
    parentElement.insertBefore(firstProjectCloneElement, lastItemElement.nextSibling);
    parentElement.insertBefore(lastProjectCloneElement, firstItemElement);
};

Portfolio.prototype.initTagCloud = function() {
    var element = document.querySelector('.js-tag-cloud'),
        tags = this.projects
            .reduce(function(allTags, project) {
                return allTags.concat(project.tags);
            }, [])
            .filter(function(value, index, self) {
                return value && self.indexOf(value) === index;
            })
            .sort();

    return new TagCloud(element, {
        tags: tags
    });
};

Portfolio.prototype.setActiveProject = function(project) {
    this.tagCloud.setActiveTags(project.tags);
};

Portfolio.prototype.setColor = function(color) {
    document.documentElement.style.setProperty('--background-color', color);
};

Portfolio.prototype.calculateColor = function(begin, end, pos) {
    var color = 'rgba(' + [parseInt((begin[0] + pos * (end[0] - begin[0])), 10), parseInt((begin[1] + pos * (end[1] - begin[1])), 10), parseInt((begin[2] + pos * (end[2] - begin[2])), 10), 1].join(', ') + ')';

    return color;
};

Portfolio.prototype.scrollToProject = function(index, position) {
    var position = position || 'top',
        project = this.projects[index];

    project.element.scrollIntoView(position === 'top');
};

function Project(element, config) {
    this.id = element.id;
    this.element = element;
    this.portfolio = config.portfolio;
    this.swiper = this.initSwiper();
    this.tags = this.element.dataset.tags ? this.element.dataset.tags.split(',') : [];
    this.color = this.getRGBA(this.element.dataset.color);
    this.y1 = this.element.offsetTop;
    this.y2 = this.y1 + this.element.offsetHeight;

    this.element.parentElement.dataset.y1 = this.y1;
    this.element.parentElement.dataset.y2 = this.y2;

    this.initObserver();
}

Project.prototype.initSwiper = function() {
    var swiperElement = this.element.querySelector('.js-swiper-container'),
        swiperOptions = {
            loop: swiperElement.querySelectorAll('.js-swiper-slide').length > 1,
            watchOverflow: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            followFinger: false,
            pagination: {
                type: 'bullets',
                el: swiperElement.querySelector('.swiper-pagination'),
                clickable: true,
                bulletElement: 'button',
                bulletClass: 'button',
                bulletActiveClass: 'button--active'
            },
            on: {
                init: this.alignTextContent.bind(this),
                resize: this.alignTextContent.bind(this)
            }
        };

    return new Swiper(swiperElement, swiperOptions);
};

Project.prototype.alignTextContent = function() {
    var headerElement = this.element.querySelector('.js-project-header'),
        textElements = this.element.querySelectorAll('.text');

    textElements.forEach(function(textElement) {
        if (textElement) {
            textElement.style.top = headerElement.offsetHeight + 'px';
            textElement.style.opacity = '1';
        }
    });
};

/**
 *
 * @param hex - color in hex (e.g. #aabbcc)
 * @returns {*}
 */
Project.prototype.getRGBA = function(hex) {
    return hex.toLowerCase().match(/[0-9a-f]{2}/g).map(number => parseInt(number, 16));
};

Project.prototype.initObserver = function() {
    var me = this,
        observer = new IntersectionObserver(function(entries) {
            var entry = entries[0];

            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                me.portfolio.setActiveProject(me)
            }
        }, {
            threshold: [0.3]
        });

    observer.observe(this.element);
};

function TagCloud(element, config) {
    this.element = element;
    this.tags = this.createTagCollection(config.tags);

    this.setActiveTags([]);
    this.fitText();

    window.addEventListener('resize', this.fitText.bind(this));
    window.addEventListener('orientationchange', this.fitText.bind(this));
};

TagCloud.prototype.createTagCollection = function(tags) {
    var me = this,
        collection, tagElement, textNode;

    collection = tags.map(function(tag) {
        tagElement = document.createElement('li');
        tagElement.innerText = tag;
        tagElement.classList.add('tag');
        tagElement.classList.add('js-tag');
        textNode = document.createTextNode(' ');
        me.element.appendChild(tagElement);
        me.element.appendChild(textNode);

        return new Tag({
            element: tagElement,
            text: tag
        });
    });

    return collection;
};

/**
 * @param tags {[String]} - an array of tags
 */
TagCloud.prototype.setActiveTags = function(tags) {
    this.tags.forEach(function(tag) {
        tag.toggleActive(tags.includes(tag.text));
    });
};

TagCloud.prototype.fitText = function() {
    var parentHeight = this.element.parentElement.offsetHeight,
        fontSize = 3;

    while (this.element.offsetHeight < parentHeight) {
        fontSize += 0.1;
        this.setFontSize(fontSize.toFixed(2));
    }

    if (this.element.offsetHeight > parentHeight) {
        this.setFontSize(fontSize - 0.1);
    }
};

TagCloud.prototype.setFontSize = function(fontSize) {
    document.documentElement.style.setProperty('--font-size-tags', fontSize + 'rem');
};

function Tag(config) {
    this.element = config.element;
    this.text = config.text;
}

Tag.prototype.toggleActive = function(state) {
    this.element.classList.toggle('tag--active', state);
};

function throttle(fn, wait) {
    var time = Date.now();

    return function() {
        if ((time + wait - Date.now()) < 0) {
            fn(...arguments);
            time = Date.now();
        }
    }
}

var debounce = function (fn) {
    var timeout;

    return function () {
        var context = this,
            args = arguments;

        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(function () {
            fn.apply(context, args);
        });
    }
};
