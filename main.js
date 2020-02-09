(function() {
    document.addEventListener('DOMContentLoaded', initPortfolio);

    function initPortfolio() {
        new Portfolio(document.querySelector('.js-portfolio'));
    }
})();

function Portfolio(element) {
    this.element = element;
    this.projects = this.createProjectCollection();
    this.tagCloud = this.initTagCloud();
}

Portfolio.prototype.createProjectCollection = function() {
    var projectElements = this.element.querySelectorAll('.js-project');

    return Array.from(projectElements).map(this.createProjectModel.bind(this));
};

Portfolio.prototype.createProjectModel = function(element) {
    return new Project(element, {
        portfolio: this
    });
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

function Project(element, config) {
    this.id = element.id;
    this.element = element;
    this.portfolio = config.portfolio;
    this.swiper = this.initSwiper();
    this.tags = this.element.dataset.tags ? this.element.dataset.tags.split(',') : [];

    this.initObserver();
}

Project.prototype.initSwiper = function() {
    var swiperElement = this.element.querySelector('.js-swiper-container'),
        swiperOptions = {
            loop: swiperElement.querySelectorAll('.js-swiper-slide').length > 1,
            watchOverflow: true,
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

Project.prototype.initObserver = function() {
    var me = this,
        observer = new IntersectionObserver(function(entries) {
            var entry = entries[0];

            if (entry.isIntersecting) {
                me.portfolio.setActiveProject(me)
            }
        }, {
            threshold: [0]
        });

    observer.observe(this.element);
};

function TagCloud(element, config) {
    this.element = element;
    this.tags = this.createTagCollection(config.tags);

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
