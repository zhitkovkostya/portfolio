---
layout: default
title: Portfolio
---

<ul class="portfolio js-portfolio">
    <li class="portfolio__item js-portfolio-item">
        {% capture excerpt %}
            {{ site.description }}
            
            <ul class="socials">
                {% for social in site.socials %}
                    <li class="socials__item">
                        <a href="{{ social[1] }}" class="button button--white" target="_blank">{{ social[0] }}</a>
                    </li>
                {% endfor %}
            </ul>  
        {% endcapture %}
    
        {% include post.html
           title=page.title
           excerpt=excerpt
           uid="info"
           color="000000"
           is_inverted=1
        %}
    </li>
    {% for post in site.posts %}
        <li class="portfolio__item js-portfolio-item">
            {% include post.html %}
        </li>
    {% endfor %}
</ul>
