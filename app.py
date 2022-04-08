# DB
from dotenv import load_dotenv
import os
import mysql.connector.pooling
load_dotenv()
db = mysql.connector.pooling.MySQLConnectionPool(
    pool_name='taipei_trip',
    pool_size=5,
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
        if 'id' in session:
            id = session['id']
            connection = db.get_connection()
            cursor = connection.cursor(buffered=True)
            cursor.execute('SELECT id, name, email from member WHERE id = %s', (id,))
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
            sql = 'SELECT id FROM member WHERE email = %(email)s and password = %(password)s'
            params = {"email": email, "password": password}
            cursor.execute(sql,params)
            data = cursor.fetchone()
            # check if login info are correct
            if data:
                session['id'] = str(data[0])
                cursor.close()
                connection.close()
                return jsonify({"ok": True}), 200
            else:
                return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤"}), 400
        except:
            return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500
    if request.method =='DELETE':
        session.pop('id', "")
        return jsonify({"ok": True}), 200

# API: CRUD booking info
@app.route("/api/booking", methods=['GET','POST','DELETE'])
def getBooking():
    if request.method =='GET':
        if 'id' not in session:
            return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
        member_id = session['id']
        connection = db.get_connection()
        cursor = connection.cursor(buffered=True)
        sql = 'SELECT attraction_id, attraction_name, attraction_address, attraction_image, date, time, price FROM booking WHERE member_id = %s'
        param = (member_id,)
        cursor.execute(sql,param)
        data = cursor.fetchone()
        cursor.close()
        connection.close()
        if data:
            attractionColumns = [('id'),('name'),('address'),('image')]
            bookingAttraction = dict(zip(attractionColumns,data[:4]))
            booking = {"attraction": bookingAttraction, "date": data[4], "time": data[5], "price": data[6]}
            return jsonify({"data": booking}), 200
        return jsonify({"data": data}), 200
    if request.method =='POST':
        try:
            data = request.get_json()
            attractionId = data["attractionId"]
            date = data["date"]
            time = data["time"]
            price = data["price"]
            # check if user hasn't logged in
            if 'id' not in session:
                return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
            # check if data is empty
            if attractionId == "" or date == "" or time == "" or price== "":
                return jsonify({"error": True, "mess age": "建立失敗，請完整填寫預訂資訊"}), 400
            # get attraction info from attraction id
            connection = db.get_connection()
            cursor = connection.cursor(buffered=True)
            cursor.execute("SELECT name, address, images FROM attractions WHERE id = %s",(attractionId,))
            attractionData = cursor.fetchone()
            name = attractionData[0]
            address = attractionData[1]
            imageList = attractionData[2].split(",")
            imageFirst = imageList[0]
            # check if user has booked any schedule
            memberId = int(session['id'])
            cursor.execute("SELECT COUNT(*) FROM booking WHERE member_id = %s",(memberId,))
            bookingCount = sum(cursor.fetchone())
            if bookingCount > 0:
                sql = "UPDATE booking SET attraction_id = %(a_id)s, attraction_name = %(name)s, attraction_address = %(address)s, attraction_image = %(image)s, date = %(date)s, time = %(time)s, price = %(price)s WHERE member_id = %(m_id)s"
            else:
                sql = "INSERT INTO booking (attraction_id, member_id,attraction_name,attraction_address,attraction_image,date,time,price) VALUES (%(a_id)s, %(m_id)s, %(name)s, %(address)s, %(image)s, %(date)s, %(time)s, %(price)s)"
            params = {"a_id": attractionId,"m_id": memberId, "name": name, "address": address, "image": imageFirst, "date": date, "time": time,"price": price}
            cursor.execute(sql,params)
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"ok": True, "message": "建立成功"}), 200
        except:
            return jsonify({"error": True, "message": "內部伺服器錯誤，請洽網站管理員"}), 500
    if request.method =='DELETE':
        if 'id' not in session:
            return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
        member_id = session['id']
        connection = db.get_connection()
        cursor = connection.cursor(buffered=True)
        sql = 'DELETE FROM booking WHERE member_id = %s'
        param = (member_id,)
        cursor.execute(sql,param)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"ok": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=3000)