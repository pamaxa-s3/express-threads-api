# Використовуємо образ Лінукс с версією node 14
FROM node:19.5.0-alpine

# Вказуємо нашу робочу дерикторію
WORKDIR /app

# Скопіювати package.json та package-lock.json в середину контейнеру
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо всі файли в контейнер
COPY . .

# Встановити Prisma
RUN npm install -g prisma

# Генеруємо Prisma client
RUN prisma generate

# Копіюємо Prisma schema
COPY prisma/schema.prisma ./prisma/

# Відкриваємо порт в контейнері
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "start"]