var apiWeiboAll = function(callback) {
    var path = '/api/weibo/all'
    ajax('GET', path, '', callback)
//    r = ajax('GET', path, '', callback)
//    callback(r)
}

var apiWeiboAdd = function(form, callback) {
    var path = '/api/weibo/add'
    ajax('POST', path, form, callback)
}

var apiWeiboDelete = function(weibo_id, callback) {
    var path = `/api/weibo/delete?id=${weibo_id}`
    ajax('GET', path, '', callback)
}

var apiWeiboUpdate = function(form, callback) {
    var path = `/api/weibo/update`
    ajax('POST', path, form, callback)
}

var apiCommentAdd = function(form, callback) {
    var path =`/api/comment/add`
    ajax('POST', path, form, callback)
}

var apiCommentUpdate = function(form, callback) {
    var path = `/api/comment/update`
    ajax('POST', path, form, callback)
}

var apiCommentDelete = function(comment_id, callback) {
    var path = `/api/comment/delete?id=${comment_id}`
    ajax('GET', path, '', callback)
}

var weiboTemplate = function(weibo) {
// <span class="todo-id" hidden=True>${todo.id}</span>
    var c = ''
    if (weibo['comments'] !== undefined) {
        comments = weibo['comments']
        for(var i = 0; i < comments.length; i++) {
            comment = comments[i]
            c += commentTemplate(comment)
        }
    }
    var t = `
        <div class="weibo-cell" data-id="${weibo.id}">
            <br>
            <span class="weibo-content">${weibo.content} from ${weibo.username}</span>
            <button class="weibo-edit">编辑</button>
            <button class="weibo-delete">删除</button>
            <br>
            <input class="comment-input">
            <button class='comment-add'>发表评论</button>
            <br>
            ${c}
        </div>

    `
    return t
}

var weiboUpdateTemplate = function(title) {
    var t = `
        <div class="weibo-update-form">
            <input class="weibo-update-input" value="${title}"/>
            <button class="weibo-update">更新</button>
        </div>
    `
    return t
}

var commentTemplate = function(comment) {
    var t = `
        <div class="comment-cell" data-id="${comment.id}">
            <p class="comment">
            <span class="comment-author">${comment.username} :</span>
            <span class="comment-content">${comment.content}</span>
            <button class="comment-edit">编辑</button>
            <button class="comment-delete">删除评论</button>
            </p>
        </div>
    `
    return t
}

var commentUpdateTemplate = function(content) {
    var t = `
        <div class="comment-update-form">
            <input class="comment-update-input" value="${content}"/>
            <button class="comment-update">更新</button>
        </div>
    `
    return t
}

var insertWeibo = function(weibo) {
    var weiboCell = weiboTemplate(weibo)
    // 插入 todo-list
    var weiboList = e('#id-weibo-list')
    weiboList.insertAdjacentHTML('beforeend', weiboCell)
}

var insertComment = function(comment, weiboCell) {
    var commentCell = commentTemplate(comment)
    weiboCell.insertAdjacentHTML('beforeend', commentCell)
}

var insertUpdateForm = function(title, weiboCell) {
    var updateForm = weiboUpdateTemplate(title)
    weiboCell.insertAdjacentHTML('beforeend', updateForm)
}

var insertCommentUpdateForm = function(content, commentCell) {
    var updateForm = commentUpdateTemplate(content)
    commentCell.insertAdjacentHTML('beforeend', updateForm)
}

var loadWeibos = function() {
    // 调用 ajax api 来载入数据
    // todos = api_todo_all()
    // process_todos(todos)
    apiWeiboAll(function(weibos) {
        log('load all weibos', weibos)
        // 循环添加到页面中
        for(var i = 0; i < weibos.length; i++) {
            var weibo = weibos[i]
            insertWeibo(weibo)
        }
    })
    // second call
}

var bindEventCommentEdit = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    var self = event.target
    if (self.classList.contains('comment-edit')) {
        log('点到了编辑按钮', self)
        var commentCell = self.closest('.comment-cell')
        // var commentId = commentCell.dataset['id']
        var commentSpan = e('.comment-content', commentCell)
        var content = commentSpan.innerText
        insertCommentUpdateForm(content, commentCell)
    } else {
        log('点到了 todo cell')
    }
})}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        log('click add', content)
        var form = {
            content: content,
        }
        apiWeiboAdd(form, function(weibo) {
            // 收到返回的数据, 插入到页面中
            insertWeibo(weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)
    // 通过比较被点击元素的 class
    // 来判断元素是否是我们想要的
    // classList 属性保存了元素所有的 class
    log(self.classList)
    if (self.classList.contains('weibo-delete')) {
        log('点到了删除按钮')
        var weiboId = self.parentElement.dataset['id']
        apiWeiboDelete(weiboId, function(r) {
            // log('apiWeiboDelete', r.message)
            // 删除 self 的父节点
            if (r.message !== '权限不足') {
                self.parentElement.remove()
            }
            alert(r.message)
        })
    } else {
        log('点到了 todo cell')
    }
})}

var bindEventWeiboEdit = function() {
    var weiboList = e('#id-weibo-list')
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event)
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target
    log('被点击的元素', self)
    // 通过比较被点击元素的 class
    // 来判断元素是否是我们想要的
    // classList 属性保存了元素所有的 class
    log(self.classList)
    if (self.classList.contains('weibo-edit')) {
        log('点到了编辑按钮', self)
        var weiboCell = self.closest('.weibo-cell')
        // var weiboId = weiboCell.dataset['id']
        var weiboSpan = e('.weibo-content', weiboCell)
        var content = weiboSpan.innerText
        insertUpdateForm(content, weiboCell)
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventWeiboUpdate = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    log(event)
    var self = event.target
    log(self.classList)
    if (self.classList.contains('weibo-update')) {
        log('点到了更新按钮')
        var weiboCell = self.closest('.weibo-cell')
        var weiboId = weiboCell.dataset['id']
        var weiboInput = e('.weibo-update-input', weiboCell)
        var content = weiboInput.value
        var form = {
            id: weiboId,
            content: content,
        }

        apiWeiboUpdate(form, function(weibo) {
            var updateForm = e('.weibo-update-form', weiboCell)
            if (weibo.message !== '权限不足') {
                var weiboSpan = e('.weibo-content', weiboCell)
                weiboSpan.innerText = weibo.content
            }
            alert(weibo.message)
            updateForm.remove()
        })
    } else {
        log('点到了 todo cell')
    }
    })
}

var bindEventCommentAdd = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    var self = event.target
    log(self.classList)
    if (self.classList.contains('comment-add')) {
        log('点到了评论按钮')
        var weiboCell = self.closest('.weibo-cell')
        var weiboId = weiboCell.dataset['id']
        var input = e('.comment-input', weiboCell)
        content = input.value
        var form = {
            weibo_id: weiboId,
            content: content,
        }

        apiCommentAdd(form, function(comment) {
            log('apiWeiboUpdate', comment)
            insertComment(comment, weiboCell)

            alert('评论成功')
        })
    } else {
        log('点到了 todo cell')
    }
})}

var bindEventCommentUpdate = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    var self = event.target
    if (self.classList.contains('comment-update')) {
        log('点到了评论更新按钮')
        var commentCell = self.closest('.comment-cell')
        var commentId = commentCell.dataset['id']
        var commentInput = e('.comment-update-input', commentCell)
        var content = commentInput.value
        var form = {
            id: commentId,
            content: content,
        }

        apiCommentUpdate(form, function(r) {
            var updateForm = e('.comment-update-form', commentCell)
            if (r.message !== '权限不足') {
                var commentSpan = e('.comment-content', commentCell)
                commentSpan.innerText = r.content
            }
            alert(r.message)
            updateForm.remove()
        })
    } else {
        log('点到了 todo cell')
    }
    })
}

var bindEventCommentDelete = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    log(event)
    var self = event.target
    if (self.classList.contains('comment-delete')) {
        log('点到了评论删除按钮')
        var commentId = self.parentElement.parentElement.dataset['id']
        apiCommentDelete(commentId, function(r) {
            log('apiWeiboDelete', r.message)
            if (r.message !== '权限不足') {
                self.parentElement.remove()
            }
            alert(r.message)
    })
    }
})}

var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventCommentAdd()
    bindEventCommentDelete()
    bindEventCommentEdit()
    bindEventCommentUpdate()

}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()