import json
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

connection = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    port=os.getenv('DB_PORT'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME')
)
cursor = connection.cursor(buffered=True)
path = os.getcwd()
with open(path + "/data/taipei-attractions.json", "r", encoding='utf-8') as file:
    data = json.load(file)
    attractionList = data["result"]["results"]
for i in range(len(attractionList)):
    urlList = attractionList[i]["file"].split("https://")[1:]
    urlString = ""
    for url in urlList:
        if url[-3:] == "jpg" or url[-3:] == "JPG":
            urlString = urlString + "https://" + url +","
    if urlString:
        urlString = urlString[:-1]
    sql = "INSERT INTO attractions VALUES (%(id)s, %(name)s, %(category)s, %(description)s, %(address)s, %(transport)s, %(mrt)s, %(latitude)s, %(longitude)s, %(images)s)"
    params = {
        "id": i+1,
        "name": attractionList[i]["stitle"],
        "category": attractionList[i]["CAT2"],
        "description": attractionList[i]["xbody"],
        "address": attractionList[i]["address"],
        "transport": attractionList[i]["info"],
        "mrt": attractionList[i]["MRT"],
        "latitude": attractionList[i]["latitude"],
        "longitude": attractionList[i]["longitude"],
        "images": urlString
    }
    cursor.execute(sql, params)
    connection.commit()
cursor.close()
connection.close()
