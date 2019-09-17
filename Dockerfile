FROM node:10 as builder
RUN mkdir /app
WORKDIR /app
COPY . /app/

RUN npm install \
&& npm run build

FROM nginx
COPY --from=builder /app/build/* /usr/share/nginx/html/
EXPOSE 80
RUN echo "Asia/shanghai" > /etc/timezone
CMD ["nginx","-g","daemon off;"]

