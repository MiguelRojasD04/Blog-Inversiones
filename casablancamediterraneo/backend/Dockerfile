# Usa una imagen oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto en el que corre el backend
EXPOSE 5000

# Comando para correr el backend
CMD ["npm", "start"]
