FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
# nginx listens on 80 inside the container; publish it on the host's 2026 (all IPs)
EXPOSE 80
