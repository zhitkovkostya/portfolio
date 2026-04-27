FROM ruby:3.2-alpine

RUN apk add --no-cache \
    build-base \
    libffi-dev \
    nodejs

WORKDIR /srv/jekyll

EXPOSE 4000 35729

ENTRYPOINT ["sh", "-c"]
CMD ["bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"]
