import json
import os
import threading
from contextlib import contextmanager
from sqlalchemy import create_engine
from sshtunnel import SSHTunnelForwarder
import time

class MySQLConnection:
    def __init__(self, creds_file='db_creds.json'):
        self.creds_file = creds_file
        self.engine = None
        self.connection = None
        self.ssh_tunnel = None
        self.local_port = None
        
        # Load credentials
        self.creds = self._load_credentials()
        
        # Setup SSH tunnel if needed
        if self.creds.get('ssh_tunnel', {}).get('enabled', False):
            self._setup_ssh_tunnel()
        
        # Create engine and connect
        self._create_engine()
        self.connect()

    def _load_credentials(self):
        """Load database credentials from JSON file."""
        if not os.path.exists(self.creds_file):
            raise FileNotFoundError(f"Credentials file not found: {self.creds_file}")
        
        try:
            with open(self.creds_file, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in credentials file: {self.creds_file}")

    def _setup_ssh_tunnel(self):
        """Setup SSH tunnel for database connection."""
        ssh_config = self.creds['ssh_tunnel']
        
        try:
            self.ssh_tunnel = SSHTunnelForwarder(
                (ssh_config['ssh_host'], ssh_config['ssh_port']),
                ssh_username=ssh_config['ssh_user'],
                ssh_pkey=ssh_config['ssh_key'],
                remote_bind_address=(self.creds['host'], self.creds['port'])
            )
            
            self.ssh_tunnel.start()
            self.local_port = self.ssh_tunnel.local_bind_port
            print(f'SSH tunnel established on local port: {self.local_port}')
            
        except Exception as e:
            raise ConnectionError(f"Failed to establish SSH tunnel: {e}")

    def _create_engine(self):
        """Create SQLAlchemy engine with appropriate connection string."""
        if self.ssh_tunnel:
            # Use localhost and the tunnel's local port
            host = '127.0.0.1'
            port = self.local_port
        else:
            host = self.creds['host']
            port = self.creds['port']
        
        connection_string = (
            f"mysql+mysqlconnector://{self.creds['user']}:{self.creds['password']}"
            f"@{host}:{port}/{self.creds['database']}"
        )
        
        print(f"Creating engine with connection string: mysql+mysqlconnector://{self.creds['user']}:***@{host}:{port}/{self.creds['database']}")
        
        # Add connection timeout and other safety parameters
        self.engine = create_engine(
            connection_string,
            connect_args={
                'connect_timeout': 5,  # Reduced timeout
                'autocommit': True,
                'use_pure': True  # Use pure Python implementation
            },
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False  # Set to True for SQL debugging
        )

    def _connect_with_timeout(self, timeout_seconds=10):  # Reduced timeout
        """Connect to database with timeout using threading."""
        print(f"Attempting database connection with {timeout_seconds}s timeout...")
        result = {'connection': None, 'error': None, 'completed': False}
        
        def connect_thread():
            try:
                print("Starting connection thread...")
                result['connection'] = self.engine.connect()
                print("Connection successful in thread")
                result['completed'] = True
            except Exception as e:
                print(f"Connection failed in thread: {e}")
                result['error'] = e
                result['completed'] = True
        
        # Start connection in separate thread
        thread = threading.Thread(target=connect_thread)
        thread.daemon = True
        thread.start()
        print("Connection thread started, waiting...")
        
        # Wait for completion or timeout
        thread.join(timeout=timeout_seconds)
        
        if not result['completed']:
            # Thread is still running (timed out)
            print("Connection thread timed out")
            raise TimeoutError("Database connection timed out")
        
        if result['error']:
            raise result['error']
        
        return result['connection']

    def _test_tunnel_connectivity(self):
        """Test if the SSH tunnel is actually working."""
        if not self.ssh_tunnel:
            return True
            
        import socket
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex(('127.0.0.1', self.local_port))
            sock.close()
            
            if result == 0:
                print(f"SSH tunnel connectivity test passed on port {self.local_port}")
                return True
            else:
                print(f"SSH tunnel connectivity test failed on port {self.local_port}")
                return False
        except Exception as e:
            print(f"SSH tunnel connectivity test error: {e}")
            return False

    def connect(self):
        """Connect to the database with timeout protection."""
        try:
            # Test tunnel connectivity first if using SSH
            if self.ssh_tunnel and not self._test_tunnel_connectivity():
                raise ConnectionError("SSH tunnel is not accessible")
            
            self.connection = self._connect_with_timeout(10)  # Reduced timeout
            print('Connected to MySQL database')
                
        except TimeoutError:
            print("Database connection timed out")
            self.close()
            raise
        except Exception as e:
            print(f"Database connection failed: {e}")
            self.close()
            raise

    def close(self):
        """Close database connection and SSH tunnel."""
        if self.connection:
            try:
                self.connection.close()
                print('Database connection closed')
            except:
                pass
            
        if self.ssh_tunnel:
            try:
                self.ssh_tunnel.stop()
                print('SSH tunnel closed')
            except:
                pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()