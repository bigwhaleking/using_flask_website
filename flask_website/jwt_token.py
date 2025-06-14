import jwt
import datetime

SECRET_KEY = 'secret_key'
ALGORITHM = 'HS256'

def create_token(username):
    encoded = jwt.encode({'username':username, 'exp':datetime.datetime.utcnow() + datetime.timedelta(hours=6)}, SECRET_KEY, algorithm=ALGORITHM)

    return encoded

def decode_token(get_token):
    decode = jwt.decode(get_token, SECRET_KEY, algorithms=[ALGORITHM])

    return decode