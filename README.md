### Сервер для нашего [проекта](https://github.com/Alexkhokhlow/rs-clone)

#### Стек: Node.js, Exspress, Sequelize, Postgresql

Метод для проверки:
Авторизация клиента. Передается почта и пароль.

Method: POST

URL: https://trello-clone-x3tl.onrender.com/api/login

req body:
 - email: 12345@gmail.com,
 - password: 12345
res body:
- token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjc3NzUwNDI2LCJleHAiOjE2Nzg2MTQ0MjZ9.X8h4WcowUDGUPNafrXM_L-bAA7__EjaGnXuTCfNjtig",

error bodies:
 - message:"Authentication failed"
