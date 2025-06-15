# Usa la imagen oficial de Nginx
FROM nginx:latest

# Copia los archivos del frontend a la carpeta de Nginx
COPY ./public /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80
