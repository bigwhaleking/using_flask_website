import os
from pymongo import MongoClient, ReturnDocument
from datetime import datetime
from bson.objectid import ObjectId

# MongoDB 연결
client = MongoClient("[your_db_url]")
db = client["used_market"]

# 컬렉션 참조
products = db["products"]
posts = db["posts"]
users = db["users"]

# 상품 등록
def insert_product(title, price, image_urls, description, category, user, comment):
    product = {
        "title": title,
        "price": int(price),
        "img_list": image_urls,
        "description": description,
        "category": category,
        "views": 0,
        "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "user":user,
        "comment":comment
    }
    products.insert_one(product)

# 최신 날짜에 따라 상품 목록 조회
def get_all_products(skip=0, limit=20):
    items = list(products.find().sort("created_at", -1).skip(skip).limit(limit))
    for item in items:
        item["_id"] = str(item["_id"])
    return items

#id 기반 물품 내용 출력 & 작성 유저 정보 확인
def get_produce_by_id(id):
    item = products.find_one_and_update(
        {"_id":ObjectId(id)},
        {"$inc":{"views":1}},
        return_document=ReturnDocument.AFTER
        )
    if item:
        item["_id"] = str(item["_id"])
        user = item.get("user", None)
        return item, user
#댓글
def add_comment(page, id, comment):
    if page == 'item_page':
        products.update_one(
            {"_id": ObjectId(id)},
            {"$push":{"comment":comment}}
        )
    elif page == 'community_page':
            posts.update_one(
            {"_id": ObjectId(id)},
            {"$push":{"comment":comment}}
        )
    
# 검색 필터
def get_products_by_filter(category_name, title, lower_sort, upper_sort, popularity_sort, skip=0, limit=20):
    if category_name:
        items = list(products.find({"category": category_name}).sort("created_at", -1).skip(skip).limit(limit))
    elif title:
        items = list(products.find({"title": title}).sort("created_at", -1).skip(skip).limit(limit))
    elif lower_sort:
        items = list(products.find().sort("price", 1).skip(skip).limit(limit))
    elif upper_sort:
        items = list(products.find().sort("price", -1).skip(skip).limit(limit))
    elif popularity_sort:
        items = list(products.find().sort("views", -1).skip(skip).limit(limit))

    for item in items:
        item["_id"] = str(item["_id"])

    return items

# 게시글 등록
def insert_post(post_type, title, author, content, category, tags, comment):
    post = {
        "type": post_type,
        "title": title,
        "author": author,
        "content": content,
        "category": category,
        "tags" : tags,
        "views": 0,
        "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "comment":comment
    }
    print("[DEBUG] post inserted:", post)
    posts.insert_one(post)

#id 기반 게시판 내용 출력 & 작성 유저 정보 확인
def get_post_by_id(id):
    item = posts.find_one_and_update(
        {"_id":ObjectId(id)},
        {"$inc":{"views":1}},
        return_document=ReturnDocument.AFTER
        )
    if item:
        item["_id"] = str(item["_id"])
        user = item.get("author", None)
        return item, user

# 게시글 카테고리별 조회
def get_all_posts_by_category(category, skip=0, limit=10):
    results = list(posts.find({"category": category}).sort("date", -1).skip(skip).limit(limit))
    parsed = []
    for idx, post in enumerate(results, start=1):
        parsed.append({
            "index": idx,
            "id": str(post.get("_id")),
            "type": post.get("type", ""),
            "title": post.get("title", ""),
            "author": post.get("author", ""),
            "views": post.get("views", 0),
            "date": post.get("date", "").split(" ")[0]
        })
    return parsed

# 모든 게시판에서 보여줄 공지글 가져오기
def get_notice_posts(limit=5):
    results = list(posts.find({"type": "공지"}).sort("date", -1).limit(limit))
    parsed = []
    for idx, post in enumerate(results, start=1):
        parsed.append({
            "index": idx,
            "id": str(post.get("_id")),
            "type": post.get("type", ""),
            "title": post.get("title", ""),
            "author": post.get("author", ""),
            "views": post.get("views", 0),
            "date": post.get("date", "").split(" ")[0]
        })
    return parsed

# 게시판 페이지 넘기기
def count_posts_by_category(category):
    return posts.count_documents({"category": category})

# 회원 등록
def insert_user(user_id, pw, name, phone):
    user = {
        "id": user_id,
        "pw": pw,
        "name": name,
        'phone': phone,
        "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    users.insert_one(user)

# 로그인용 사용자 조회
def get_user_by_id(user_id):
    return users.find_one({"id": user_id})

# 아이디 중복 확인
def check_user_exists(user_id):
    print(f"[중복체크] user_id={user_id}")
    result = users.find_one({"id": user_id})
    print(f"[중복체크 결과] result={result}")
    return result is not None

# 마이페이지 정보 조회
def get_user_info(user_id):
    user = users.find_one({"id": user_id})
    if user:
        return {
            "name": user.get("name", ""),
            "phone": user.get("phone", "")
        }
    return None

# 마이페이지 정보 수정
def update_user_info(user_id, name, phone):
    users.update_one({"id": user_id}, {
        "$set": {
            "name": name,
            "phone": phone
        }
    })

# 이미지 처리
def save_uploaded_image(file, upload_folder='static/uploads'):
    os.makedirs(upload_folder, exist_ok=True)
    
    if file and file.filename:
        filename = f"{datetime.now().timestamp()}_{file.filename}"
        save_path = os.path.join(upload_folder, filename)
        file.save(save_path)
        save_path = save_path.replace("\\", "/")
        return f"/{save_path}"
    else:
        return "https://via.placeholder.com/150?text=이미지없음"

