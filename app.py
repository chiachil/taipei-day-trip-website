# DB
from dotenv import load_dotenv
import os
import mysql.connector.pooling
load_dotenv()
db = mysql.connector.pooling.MySQLConnectionPool(
    pool_name='taipei_trip',
    pool_size=10,
    pool_reset_session=True,
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME')
)

# flask
from flask import *
app = Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
app.secret_key = os.getenv('SECRET_KEY')

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# API: Get attraction list
@app.route("/api/attractions", methods=['GET'])
def getAttractions():
    try:
        pageNumber = int(request.args.get("page", ""))
        perCount = 12
        pageStart = pageNumber*perCount+1
        pageEnd = pageNumber*perCount+perCount
        keyword = request.args.get("keyword", "")
        connection = db.get_connection()
        cursor = connection.cursor(buffered=True)
        # count
        if keyword:
            sql = 'SELECT count(*) FROM attractions WHERE name LIKE "%"%s"%"'
            cursor.execute(sql, (keyword,))
        else:
            sql = 'SELECT count(*) FROM attractions'
            cursor.execute(sql)
        count = cursor.fetchone()[0]
        # filter
        if keyword:
            sql = 'SELECT * FROM attractions WHERE name LIKE "%"%s"%"'
            cursor.execute(sql, (keyword,))
        else:
            param = tuple(range(pageStart, pageEnd+1))
            sql = 'SELECT * FROM attractions WHERE id IN {}'.format(param)
            cursor.execute(sql)
            pageStart, pageEnd = 1, 12
        attractions = cursor.fetchall()[pageStart-1:pageEnd]
        columnName = [description[0] for description in cursor.description]
        cursor.close()
        connection.close()
        # define next page
        if attractions and pageNumber == (count//perCount):
            nextPage = None
        elif attractions:
            nextPage = pageNumber+1
        else:
            return jsonify({"error": True, "message": "搜尋無結果，建議檢查有無錯別字，或改用其他關鍵字:)"}), 400
        contents = []
        # return result
        for attaction in attractions:
            content = dict(zip(columnName[:-1], attaction[:-1]))
            content["images"] = attaction[-1].split(",")
            contents.append(content)
        return {"nextPage": nextPage, "data": contents}
    except:
        return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500

# API: Get attraction
@app.route("/api/attraction/<attractionId>", methods=['GET'])
def getAttraction(attractionId):
    if not attractionId.isdigit():
        return jsonify({"error": True, "message": "查無此景點編號的頁面，建議檢查有無輸入錯誤，或改用其他景點編號:)"}), 400
    try:
        connection = db.get_connection()
        cursor = connection.cursor(buffered=True)
        cursor.execute("SELECT * FROM attractions WHERE id = %s", (attractionId,))
        attraction = cursor.fetchone()
        if attraction:
            columnName = [description[0] for description in cursor.description]
            attractionDict = dict(zip(columnName[:-1], attraction[:-1]))
            attractionDict["images"] = attraction[-1].split(",")
            cursor.close()
            connection.close()
            return jsonify({"data": attractionDict}), 200
        return jsonify({"error": True, "message": "查無此景點編號的頁面，建議檢查有無輸入錯誤，或改用其他景點編號:)"}), 400
    except:
        return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500

# API: CRUD user info
@app.route("/api/user", methods=['GET','POST','PATCH','DELETE'])
def getUser():
    if request.method =='GET':
        if 'email' in session:
            email = session['email']
            connection = db.get_connection()
            cursor = connection.cursor(buffered=True)
            cursor.execute('SELECT id, name, email from member WHERE email = %s', (email,))
            data = cursor.fetchone()
            cursor.close()
            connection.close()
            column_name = [('id'),('name'),('email')]
            if data:
                result = dict(zip(column_name,data))
                return jsonify({"data": result}), 200
        return jsonify({"data": None}), 200
    if request.method =='POST':
        try:
            data = request.get_json()
            name = data["name"]
            email = data["email"]
            password = data["password"]
            # check if data is empty
            if name == "" or email == "" or password == "":
                return jsonify({"error": True, "message": "任一欄位不得為空"}), 400
            connection = db.get_connection()
            cursor = connection.cursor(buffered=True)
            cursor.execute("SELECT email FROM member WHERE email = %s", (email,))
            data = cursor.fetchone()
            # check if account has been registered
            if data:
                cursor.close()
                connection.close()
                return jsonify({"error": True, "message": "此E-mail已被註冊"}), 400
            sql = "INSERT INTO member (name,email,password) VALUES (%(name)s, %(email)s, %(password)s)"
            params = {"name": name, "email": email, "password": password}
            cursor.execute(sql,params)
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"ok": True}), 200
        except:
            return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500
    if request.method =='PATCH':
        try:
            data = request.get_json()
            email = data["email"]
            password = data["password"]
            # check if data is empty
            if email == "" or password == "":
                return jsonify({"error": True, "message": "任一欄位不得為空"}), 400
            connection = db.get_connection()
            cursor = connection.cursor(buffered=True)
            sql = 'SELECT email, password FROM member WHERE email = %(email)s and password = %(password)s'
            params = {"email": email, "password": password}
            cursor.execute(sql,params)
            data = cursor.fetchall()
            # check if login info are correct
            if data:
                session['email'] = email
                cursor.close()
                connection.close()
                return jsonify({"ok": True}), 200
            else:
                return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤"}), 400
        except:
            return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500
    if request.method =='DELETE':
        session.pop('email', "")
        return jsonify({"ok": True}), 200
if __name__ == '__main__':
    app.run(host='0.0.0.0',port=3000)