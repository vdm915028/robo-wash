# Сервера пока нет, поэтому образ отдаёт только собранный клиент, а раздаёт его nginx.
FROM node:24-alpine AS build
WORKDIR /app

COPY src/robo-wash-react/package.json src/robo-wash-react/package-lock.json ./
RUN npm ci

COPY src/robo-wash-react/ ./

# Vite подставляет VITE_* на этапе сборки и запекает значение в бандл, поэтому ключ карты приходит
# аргументом сборки: переменная окружения Cloud Run до собранной статики не доедет. Предупреждение сборщика
# про секрет в ARG здесь неприменимо — ключ карты клиентский и публичен по своей природе, он и так уезжает
# в бандл, который открыт любому посетителю.
ARG VITE_2GIS_MAP_KEY
RUN npm run build

FROM nginx:1-alpine

# Официальный образ прогоняет envsubst по шаблонам при старте, так что ${PORT} подставится тем,
# что передаст Cloud Run; 8080 остаётся значением по умолчанию для локального запуска.
ENV PORT=8080

COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
