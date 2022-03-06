from urllib import response
from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
app = Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
app.secret_key = os.getenv('SECRET_KEY')
load_dotenv()
connection = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    port=os.getenv('DB_PORT'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME')
)

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
        # define next page
        if attractions and pageNumber == (count//perCount):
            nextPage = None
        elif attractions:
            nextPage = pageNumber+1
        else:
            return jsonify({"error": True, "message": "No result exists."}), 400
        contents = []
        # return result
        for attaction in attractions:
            content = dict(zip(columnName[:-1], attaction[:-1]))
            content["images"] = attaction[-1].split(",")
            contents.append(content)
        return {"nextPage": nextPage, "data": contents}
    except:
        return jsonify({"error": True, "message": "Internal Server Error"}), 500

# API: Get attraction
@app.route("/api/attraction/<attractionId>", methods=['GET'])
def getAttraction(attractionId):
    if not attractionId.isdigit():
        return jsonify({"error": True, "message": "wrong id"}), 400
    try:
        cursor = connection.cursor(buffered=True)
        cursor.execute("SELECT * FROM attractions WHERE id = %s",
                       (attractionId,))
        attraction = cursor.fetchone()
        if attraction:
            columnName = [description[0] for description in cursor.description]
            attractionDict = dict(zip(columnName[:-1], attraction[:-1]))
            attractionDict["images"] = attraction[-1].split(",")
            cursor.close()
            return jsonify({"data": attractionDict}), 200
        return jsonify({"error": True, "message": "wrong id"}), 400
    except:
        return jsonify({"error": True, "message": "Internal Server Error"}), 500


if __name__ == '__main__':
    app.run(port=3000)
