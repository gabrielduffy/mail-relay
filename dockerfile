FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache melhor)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

# EasyPanel costuma rotear para porta 80
ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
