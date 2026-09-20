# Клиент и API развёрнуты разными сервисами Cloud Run: над клиентом может работать отдельная команда,
# а в API кроме браузера будут ходить мобильные приложения. Поэтому здесь только собранная статика и nginx.
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

# Vite подставляет VITE_* на этапе сборки и запекает значения в бандл, поэтому они приходят аргументами
# сборки: переменная окружения Cloud Run до готовой статики не доедет. Предупреждение сборщика про секрет
# в ARG здесь неприменимо — и ключ карты, и адрес API открыты любому, кто откроет приложение.
ARG VITE_2GIS_MAP_KEY
ARG VITE_API_BASE_URL
RUN npm run build

FROM nginx:1-alpine

# Официальный образ прогоняет envsubst по шаблонам при старте, так что ${PORT} подставится тем,
# что передаст Cloud Run; 8080 остаётся значением по умолчанию для локального запуска.
ENV PORT=8080

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
