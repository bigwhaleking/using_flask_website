import os
from flask import Flask, render_template, request, url_for, redirect, make_response, jsonify
import jwt_token
from mongo_db import save_uploaded_image, get_all_products, insert_post, get_all_posts_by_category, insert_product, get_user_info,\
                     update_user_info, get_user_by_id, insert_user, check_user_exists, get_products_by_filter, get_produce_by_id,\
                     add_comment, get_post_by_id, count_posts_by_category, get_notice_posts

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

@app.route('/')
def redirect_to_main():
    return redirect(url_for('main'))

@app.route('/main')
def main():
    selected_category_id = request.args.get('selected_category_id', '')
    selected_category_name = request.args.get('selected_category_name', '')
    search_query = request.args.get('query', '')
    sort = request.args.get('sort','')

    item_posted = request.args.get('item_posted', '')
    token = request.cookies.get('token')
    
    page = int(request.args.get('page', 1))
    per_page = 10
    skip = (page - 1) * per_page

    if selected_category_id:
        items = get_products_by_filter(selected_category_id, None, None, None, None, skip=skip, limit=per_page)
    elif search_query:
        items = get_products_by_filter(None, search_query, None, None, None, skip=skip, limit=per_page)
    elif sort:
        if ( sort == 'popularity' ):
            items = get_products_by_filter(None, None, None, None, 'popularity_sort', skip=skip, limit=per_page)
        elif ( sort == 'latest' ):
            items = get_all_products(skip=skip, limit=per_page)
        elif ( sort == 'price_asc' ):
            items = get_products_by_filter(None, None, 'lower_sort', None, None, skip=skip, limit=per_page)
        elif ( sort == 'price_desc'):
            items = get_products_by_filter(None, None, None, 'upper_sort', None, skip=skip, limit=per_page)
    else:
        items = get_all_products(skip=skip, limit=per_page)
        
    total_items = len(get_all_products(skip=0, limit=10000))
    total_pages = (total_items + per_page - 1) // per_page

    return render_template('main.html',
                items = items,
                page = page,
                total_pages=total_pages,
                query=search_query, 
                selected_category_id=selected_category_id,
                selected_category_name=selected_category_name,
                item_posted_success=item_posted,
                sort=sort,
                token=token)

@app.route('/item_page')
def item_page():
    token = request.cookies.get('token')

    item_id = request.args.get('item_id')

    item, user = get_produce_by_id(item_id)

    user_info = get_user_info(user)

    return render_template('item_page.html', item = item, user_info=user_info, token = token)

@app.route('/community_page')
def community_page():
    token = request.cookies.get('token')
    item_id = request.args.get('item_id')
    
    item, user = get_post_by_id(item_id)
    user_info = get_user_info(user)

    return render_template('community_page.html', item=item, user_info = user_info, token = token)

@app.route('/post_comment', methods=['POST'])
def post_comment():
    
    id = request.form.get('id')
    comment = request.form.get('comment')
    page = request.form.get('page')

    if id and comment:
        add_comment(page, id, comment)  
    if( page == 'item_page' ):
        return redirect(url_for('item_page', item_id = id))
    elif( page == 'community_page' ):
        return redirect(url_for('community_page', item_id = id))
    return redirect(url_for('main'))

@app.route('/community')
def community():

    token = request.cookies.get('token')

    board_to_show = request.args.get('board_to_show', 'notice')

    return render_template('community.html', 
                           board_to_show=board_to_show,
                           token = token)

@app.route('/community_post', methods=['GET'])
def community_post():
    category = request.args.get('category', 'notice')
    page = int(request.args.get('page', 1))
    per_page = 10
    skip = (page - 1) * per_page

    posts_page = get_all_posts_by_category(category, skip=skip, limit=per_page)
    total_posts = count_posts_by_category(category)
    total_pages = (total_posts + per_page - 1) // per_page
    
    notice_posts = get_notice_posts(limit=5)

    return jsonify({
        "posts": posts_page,
        "notices": notice_posts,
        "total_pages": total_pages,
        "current_page": page
    })

@app.route('/community/write', methods=['GET', 'POST'])
def write_post():

    token = request.cookies.get('token')

    if request.method == 'POST':

        if not token:
            return render_template(url_for('login'))
        
        data = jwt_token.decode_token(token)
        username = data['username']
        category = request.form.get('board_category')
        title = request.form.get('post_title')
        content = request.form.get('post_content')
        tags_raw = request.form.get('post_tags', '')
        
        tags_list = [tag.strip() for tag in tags_raw.split(',') if tag.strip()]
        tags_limited = tags_list[:10]
        tags = ', '.join(tags_limited) if tags_limited else None
        
        # 카테고리/타입 결정
        if username == 'admin':
            category = 'notice'
            type_value = '공지'
        else:
            if category == 'wanted':
                type_value = '구해요'
            elif category == 'selling':
                type_value = '팔아요'
            else :
                type_value = 'QnA'
                
        
        insert_post(type_value, title, username, content, category, tags, [])
        return redirect(url_for('community', token=token))

    return render_template('write_post.html', token = token)

@app.route('/sell_item', methods=['GET', 'POST'])
def sell_item():
    
    token = request.cookies.get('token')

    if request.method == 'POST':

        user_data = jwt_token.decode_token(token)
        user_id = user_data['username']
        
        item_title = request.form.get('item_title')
        item_category = request.form.get('item_category')
        item_price = request.form.get('item_price')
        item_description = request.form.get('item_description')
        
        # 이미지들 저장 (item_photo1~3)
        image_urls = []
        for i in range(1, 4):
            file = request.files.get(f'item_photo{i}')
            if file and file.filename:
                image_url = save_uploaded_image(file)
                if image_url:
                    image_urls.append(image_url)
        
        # MongoDB에 상품 저장
        insert_product(item_title, item_price, image_urls, item_description, item_category, user_id, [])

        return redirect(url_for('main', item_posted='true', token = token)) 
    return render_template('sell_item.html', token = token)

@app.route('/my_page')
def my_page():
    token = request.cookies.get('token')
    if not token:
        return redirect(url_for('login'))
    
    user_data = jwt_token.decode_token(token)
    user_id = user_data['username']

    if request.method == 'POST':
        #db 갱신해줘야 하는 값임
        name = request.form.get('user_name')
        phone = request.form.get('user_phone')
        
        update_user_info(user_id, name, phone)
        return render_template(url_for('my_page'))

    #db 사용자 정보 가져옴
    user_info = get_user_info(user_id)
    return render_template('my_page.html', 
                           user_info=user_info,
                           token = token)

@app.route('/login', methods=['GET', 'POST']) 
def login():
    if request.method == 'POST':
        user_id = request.form['username']
        user_pw = request.form['password']

        if (user_id ==' ' or user_pw == ' '):
            return render_template('login.html')

        #조건식에 db 정보 가져와 pw 비교
        user = get_user_by_id(user_id)
        if user and user.get("pw") == user_pw:
            new_token = jwt_token.create_token(user_id)
            resp = make_response(redirect('/'))
            resp.set_cookie('token', new_token)
            return resp
        else:
            return render_template('login.html')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == 'POST':

        user_id = request.form.get('id')
        pw = request.form.get('pw')
        name = request.form.get('name')
        phone = request.form.get('phone')
        
        if (user_id == 'admin' or not user_id.strip() or not pw.strip() or not name.strip()):
            return render_template('register.html')
    
        # ID 중복 확인
        if check_user_exists(user_id):
            return render_template('register.html')

        insert_user(user_id, pw, name, phone)
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/check_duplicate', methods=['POST'])
def check_duplicate():
    user_id = request.json.get('id')
    
    if not user_id:
        return jsonify({'error': 'ID가 전송되지 않았습니다.'}), 400

    exists = check_user_exists(user_id)

    return jsonify({'exists': exists})

@app.route('/logout')
def logout():
    resp = make_response(redirect(url_for('main')))
    resp.set_cookie('token','',expires=0)
    return resp

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)