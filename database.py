import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def getDatabaseConnection():
    """ MySQL 데이터베이스 연결을 생성하고 반환합니다. """
    try:
        dbConnection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=os.getenv("DB_PORT")
        )
        return dbConnection
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def executeQuery(queryString, params=None):
    """ 쿼리를 실행하고 결과를 반환합니다. """
    try:
        dbConnection = getDatabaseConnection()
        if dbConnection is not None:
            cursor = dbConnection.cursor(dictionary=True)
            cursor.execute(queryString, params)
            
            if queryString.strip().upper().startswith("SELECT"):
                queryResult = cursor.fetchall()
                finalData = []
                for i in range(0, len(queryResult)):
                    finalData.append(queryResult[i])
                
                cursor.close()
                dbConnection.close()
                return finalData
            else:
                dbConnection.commit()
                cursor.close()
                dbConnection.close()
                return True
        else:
            return False
    except Exception as e:
        print(f"Query Error: {str(e)}")
        return False

def saveAiResponse(requestText, responseText, modelName):
    """ AI 응답 결과를 데이터베이스에 저장합니다. """
    try:
        sqlQuery = "INSERT INTO ai_logs (request_text, response_text, model_name) VALUES (%s, %s, %s)"
        queryParams = (requestText, responseText, modelName)
        insertResult = executeQuery(sqlQuery, queryParams)
        return insertResult
    except Exception as e:
        print(f"Save Error: {str(e)}")
        return False
