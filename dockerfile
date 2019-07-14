FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./dist/elexifier /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

RUN apk update \
    && apk add openssl

RUN sh -c "echo -n 'elexifier-test:' >> /etc/nginx/.htpasswd"
RUN sh -c "openssl passwd -apr1 elexifier-test >> /etc/nginx/.htpasswd"
# ARG CONF_FILE
# COPY ${CONF_FILE} /etc/nginx/nginx.conf
# COPY /dist ./dist