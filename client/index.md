---
layout: default
---

<ul class="portfolio js-portfolio">
    <li class="portfolio__item js-portfolio-item">
        {% capture excerpt %}
            {{ site.description }}
            
            <ul class="socials">
                {% for social in site.socials %}
                    <li class="socials__item">
                        <a href="{{ social[1] }}" class="button button--white" target="_blank" rel="noopener">{{ social[0] }}</a>
                    </li>
                {% endfor %}
            </ul>  
        {% endcapture %}
    
        {% include post.html
           title=site.title
           excerpt=excerpt
           uid="info"
           color="000000"
           is_inverted=true
        %}
    </li>
    {% for post in site.posts %}
        <li class="portfolio__item js-portfolio-item">
            {% include post.html
               title=post.title
               excerpt=post.excerpt
               uid=post.uid
               color=post.color
               tags=post.tags
               images=post.images
               links=post.links
               is_inverted=false
            %}
        </li>
    {% endfor %}
</ul>
