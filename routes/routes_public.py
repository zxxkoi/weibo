from routes import (
    current_user,
    html_response,
)
from utils import log


def index(request):
    """
    主页的处理函数, 返回主页的响应
    """
    u = current_user(request)
    return html_response('index.html', username=u.username)


def static(request):
    filename = request.query['file']
    path = 'static/' + filename
    with open(path, 'rb') as f:
        header = b'HTTP/1.x 200 OK\r\n\r\n'
        response = header + f.read()
        return response


def route_dict():
    d = {
        '/': index,
        '/static': static,
    }
    return d
