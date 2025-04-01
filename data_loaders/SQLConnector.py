from sqlalchemy import create_engine
class MySQLConnection:
    def __init__(self):
        # Replace with your own connections (TODO: Put connection info into a .env or config file)
        self.engine = create_engine('mysql+mysqlconnector://root:password@localhost/nfldb')
        self.connection = None
        self.connect()

    def connect(self):
        self.connection = self.engine.connect()
        print('Connected to MySQL database')

    def close(self):
        if self.connection:
            self.connection.close()
