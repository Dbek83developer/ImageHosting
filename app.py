import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from uuid import uuid4

from loguru import logger

SERVER_ADDRESS = ('0.0.0.0', 8000)
STATIC_PATH = 'static/'
IMAGES_PATH = 'images/'
ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif']
MAX_FILE_SIZE = 5 * 1024 * 1024
LOG_PATH = 'logs/'
LOG_FILE = 'app.log'

logger.add(LOG_PATH + LOG_FILE,
           format='[{time:YYYY-MM-DD HH:mm:ss}] {level}: {message}',
           level='INFO')


class ImageHostingHttpRequestHandler(BaseHTTPRequestHandler):
    server_version = 'Image Hosting Server v0.1'

    def __init__(self, request, client_address, server):
        self.get_routes = {
            '/api/images': self.get_images
        }
        self.post_routes = {
            '/upload/': self.post_upload
        }
        self.delete_routes = {
            '/delete/': self.delete_image
        }
        self.default_response = lambda: self.send_html('404.html', 404)
        super().__init__(request, client_address, server)

    def get_images(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            'images': next(os.walk(IMAGES_PATH))[2]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def post_upload(self):
        length = int(self.headers.get('Content-Length'))
        if length > MAX_FILE_SIZE:
            logger.warning('File too large')
            self.send_html('upload_failed.html', 413)
            return

        data = self.rfile.read(length)
        _, ext = os.path.splitext(self.headers.get('Filename'))
        image_id = uuid4()
        if ext not in ALLOWED_EXTENSIONS:
            logger.warning('File type not allowed')
            self.send_html('upload_failed.html', 400)
            return

        with open(IMAGES_PATH + f'{image_id}{ext}', 'wb') as file:
            file.write(data)
        self.send_html('upload_success.html', headers={'Location': f'http://localhost/{IMAGES_PATH}/{image_id}{ext}'})

    def delete_image(self):
        length = int(self.headers.get('Content-Length'))
        data = json.loads(self.rfile.read(length))
        filename = data.get('filename')
        file_path = os.path.join(IMAGES_PATH, filename)

        if not os.path.exists(file_path):
            logger.warning(f'File {filename} not found')
            self.send_response(404)
            self.end_headers()
            return

        try:
            os.remove(file_path)
            logger.info(f'File {filename} deleted successfully')
            self.send_response(200)
        except Exception as e:
            logger.error(f'Error deleting file {filename}: {e}')
            self.send_response(500)

        self.end_headers()

    def send_html(self, file_path, code=200, headers=None):
        self.send_response(code)
        self.send_header('Content-type', 'text/html')
        if headers:
            for header, value in headers.items():
                self.send_header(header, value)
        self.end_headers()
        with open(STATIC_PATH + file_path, 'rb') as file:
            self.wfile.write(file.read())

    def do_GET(self):
        logger.info(f'GET {self.path}')
        self.get_routes.get(self.path, self.default_response)()

    def do_POST(self):
        logger.info(f'POST {self.path}')
        self.post_routes.get(self.path, self.default_response)()

    def do_DELETE(self):
        logger.info(f'Получен DELETE-запрос: {self.path}')
        if self.path == "/delete/":
            length = int(self.headers.get('Content-Length', 0))
            if length == 0:
                self.send_response(400)
                self.end_headers()
                return
            try:
                data = json.loads(self.rfile.read(length).decode('utf-8'))
                filename = data.get('filename')
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return

            if not filename:
                logger.warning('Запрос без имени файла')
                self.send_response(400)
                self.end_headers()
                return

            file_path = os.path.join(IMAGES_PATH, filename)

            if not os.path.exists(file_path):
                logger.warning(f'Файл {filename} не найден')
                self.send_response(404)
                self.end_headers()
                return

            try:
                os.remove(file_path)
                logger.info(f'Файл {filename} успешно удалён')
                self.send_response(200)
            except Exception as e:
                logger.error(f'Ошибка при удалении файла {filename}: {e}')
                self.send_response(500)

            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()


def run(server_class=HTTPServer, handler_class=ImageHostingHttpRequestHandler):
    httpd = server_class(SERVER_ADDRESS, handler_class)
    logger.info(f'Serving on http://{SERVER_ADDRESS[0]}:{SERVER_ADDRESS[1]}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.warning('Keyboard interrupt received, exiting.')
        httpd.server_close()
    finally:
        logger.info('Server stopped.')


if __name__ == '__main__':
    run()
