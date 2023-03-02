Сервер для нашего [проекта](https://github.com/Alexkhokhlow/rs-clone)
Стек: Node.js, Exspress, Sequelize, Postgresql

Метод для проверки:
Авторизация клиента. Передается почта и пароль.

Method: POST

URL: https://trello-clone-x3tl.onrender.com/api/login

req body:

email: string,
password: string
res body:

token: string,
error bodies:

message:"Authentication failed"
