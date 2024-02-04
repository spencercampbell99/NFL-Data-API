from sqlalchemy import create_engine
class MySQLConnection:
    def __init__(self):
        self.engine = create_engine('mysql+mysqlconnector://root:password@localhost/cfbdb', echo=False)
        self.connection = None
        self.connect()

    def connect(self):
        self.connection = self.engine.connect()
        print('Connected to MySQL database')

    def close(self):
        if self.connection:
            self.connection.close()
