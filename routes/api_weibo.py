from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.comment import Comment
from models.user import User
from routes import login_required


def all(request):
    # u = current_user(request)
    # weibos = Weibo.find_all(user_id=u.id)
    # weibos_json = [w.json() for w in weibos]
    # weibos = Weibo.all_json()
    # return json_response(weibos)
    weibos = Weibo.all_json()
    for w in weibos:
        user_id = w['user_id']
        user = User.one(id=user_id)
        w['username'] = user.username
        comments = Comment.all(weibo_id = w['id'])
        w['comments'] = []
        for c in comments:
            u = User.one(id=c.user_id)
            c = c.json()
            c['username'] = u.username
            w['comments'].append(c)
    return json_response(weibos)


def add(request):
    form = request.json()
    # 创建一个 todo
    u = current_user(request)
    w = Weibo.add(form, u.id)
    w = w.json()
    w['username'] = u.username
    # 把创建好的 todo 返回给浏览器
    return json_response(w)


def delete(request):
    weibo_id = int(request.query['id'])
    Weibo.delete(weibo_id)
    comments = Comment.all(weibo_id = weibo_id)
    for c in comments:
        Comment.delete(c.id)
    d = dict(
        message="成功删除微博"
    )
    return json_response(d)


def update(request):
    form: dict = request.json()
    weibo_id = int(form.pop('id'))
    Weibo.update(weibo_id, **form)
    w = Weibo.one(id=weibo_id)
    w_json = w.json()
    w_json['message'] = '微博更新成功'
    return json_response(w_json)


def comment_add(request):
    form = request.json()
    u = current_user(request)
    form['user_id'] = u.id
    c = Comment.new(form).json()
    c['username'] = u.username
    return json_response(c)


def comment_update(request):
    form: dict = request.json()
    comment_id = int(form.pop('id'))
    Comment.update(comment_id, **form)
    c = Comment.one(id=comment_id)
    c_json = c.json()
    c_json['message'] = '评论更新成功'
    return json_response(c_json)


def comment_delete(request):
    comment_id = int(request.query['id'])
    Comment.delete(comment_id)
    d = dict(
        message="成功删除评论"
    )
    return json_response(d)


# def login_required(route_function):
#
#     def f(request):
#         u = current_user(request)
#         if u.is_guest():
#             d = dict(
#                 message="未登录"
#             )
#             return json_response(d)
#         else:
#             log('登录用户', route_function)
#             log('大家好我是', request)
#             return route_function(request)
#
#     return f


def weibo_owner_required(route_function):

    def f(request):
        u = current_user(request)
        if 'id' in request.query:
            weibo_id = int(request.query['id'])
        else:
            form = request.json()
            weibo_id = int(form['id'])
        w = Weibo.one(id=weibo_id)
        if u.id == w.user_id:
            log('没看到')
            return route_function(request)
        else:
            log('看到我了吗')
            d = dict(
                message="权限不足"
            )
            return json_response(d)
    return f


def comment_owner_or_weibo_owner_required(route_function):

    def f(request):
        u = current_user(request)
        if 'id' in request.query:
            comment_id = int(request.query['id'])
        else:
            form = request.json()
            comment_id = int(form['id'])
        c = Comment.one(id=comment_id)
        w = Weibo.one(id = c.weibo_id)
        if u.id == c.user_id or u.id == w.user_id:
            return route_function(request)
        else:
            d = dict(
                message="权限不足"
            )
            return json_response(d)

    return f


def comment_owner_required(route_function):

    def f(request):
        u = current_user(request)
        form = request.json()
        comment_id = int(form['id'])
        c = Comment.one(id=comment_id)
        if u.id == c.user_id:
            return route_function(request)
        else:
            d = dict(
                message="权限不足"
            )
            return json_response(d)

    return f


def route_dict():
    d = {
        '/api/weibo/all': login_required(all),
        '/api/weibo/add': login_required(add),
        '/api/weibo/delete': login_required(weibo_owner_required(delete)),
        '/api/weibo/update': login_required(weibo_owner_required(update)),
        '/api/comment/add': login_required(comment_add),
        '/api/comment/delete': login_required(comment_owner_or_weibo_owner_required(comment_delete)),
        '/api/comment/update': login_required(comment_owner_required(comment_update)),
    }
    # log()
    return d
