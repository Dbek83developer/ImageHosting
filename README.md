# 📸 Image Hosting Service

Простое веб-приложение для загрузки, хранения и раздачи изображений.

## 🚀 Развертывание через Docker Compose

### 1️⃣ Установите Docker и Docker Compose
Перед запуском убедитесь, что у вас установлены **Docker** и **Docker Compose**:
- [Скачать Docker](https://www.docker.com/get-started)
- [Скачать Docker Compose](https://docs.docker.com/compose/install/)

Проверьте установку командой:
```bash
docker --version
docker-compose --version
```

### 2️⃣ Клонируйте репозиторий проекта
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 3️⃣ Запустите проект
Выполните команду для сборки и запуска контейнеров:
```bash
docker-compose up --build -d
```
Флаг `-d` запускает контейнеры в фоновом режиме.

### 4️⃣ Проверьте работу сервиса
- **Бэкенд:** `http://localhost:8000`
- **Галерея изображений:** `http://localhost/images/`
- **Страница загрузки:** `http://localhost/upload/`

Проверить работающие контейнеры можно командой:
```bash
docker ps
```

### 5️⃣ Управление контейнерами
**Перезапуск контейнеров:**
```bash
docker-compose restart
```

**Остановка контейнеров:**
```bash
docker-compose down
```

## 📂 Структура проекта

```plaintext
project/
├── app.py                # Бэкенд (Python)
├── requirements.txt      # Зависимости Python
├── Dockerfile            # Dockerfile для бэкенда
├── compose.yml           # Конфигурация Docker Compose
├── nginx.conf            # Конфигурация Nginx
├── images/               # Загруженные изображения (volume)
├── logs/                 # Логи (volume)
└── static/               # Дополнительные файлы (CSS, JS)
```

### 🔹 Основные компоненты
1. **Бэкенд (`app.py`)**
   - `GET /api/images` – список загруженных изображений
   - `POST /upload/` – загрузка изображения
   - `DELETE /delete/` – удаление изображения
2. **Nginx (`nginx.conf`)**
   - Раздача статических файлов
   - Проксирование API-запросов
3. **Docker Compose (`compose.yml`)**
   - Управляет контейнерами (`app` и `nginx`)
   - Настраивает `volumes` для изображений и логов

## 📌 API Маршруты

### 🔹 Получение списка изображений
**Запрос:**  
```http
GET /api/images
```
**Ответ:**  
```json
{
  "images": ["img1.jpg", "img2.png"]
}
```

### 🔹 Загрузка изображения
**Запрос:**  
`POST /upload/`  
**Тело (файл):** `image/jpeg, image/png, image/gif`  
**Ответ:**  
```http
201 Created
Location: http://localhost/images/{image_id}.jpg
```

### 🔹 Удаление изображения
**Запрос:**  
```http
DELETE /delete/
Content-Type: application/json

{
  "filename": "img1.jpg"
}
```
**Ответ:** `200 OK` или `404 Not Found`

## 🛠 Автор и Контакт
**Разработчик: [Daminov Bahodir]**  
**Связаться: [dbek.developer@gmail.com]**  

