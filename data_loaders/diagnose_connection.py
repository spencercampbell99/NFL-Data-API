#!/usr/bin/env python3
"""
Diagnostic script to test SSH and MySQL connectivity step by step
"""

import json
import socket
from sshtunnel import SSHTunnelForwarder

def test_ssh_connectivity():
    """Test if we can establish SSH connection"""
    print("=== Testing SSH Connectivity ===")
    
    # Load credentials
    with open('db_creds.json', 'r') as f:
        creds = json.load(f)
    
    ssh_config = creds['ssh_tunnel']
    
    try:
        # Test basic SSH connection
        tunnel = SSHTunnelForwarder(
            (ssh_config['ssh_host'], ssh_config['ssh_port']),
            ssh_username=ssh_config['ssh_user'],
            ssh_pkey=ssh_config['ssh_key'],
            remote_bind_address=(creds['host'], creds['port']),
            local_bind_address=('127.0.0.1', 0)
        )
        
        tunnel.start()
        
        if tunnel.is_alive:
            print(f"✓ SSH tunnel established successfully")
            print(f"  Local port: {tunnel.local_bind_port}")
            print(f"  Remote target: {creds['host']}:{creds['port']}")
            
            # Test if we can connect to the local tunnel port
            print(f"\n=== Testing Local Tunnel Port ===")
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)
                result = sock.connect_ex(('127.0.0.1', tunnel.local_bind_port))
                sock.close()
                
                if result == 0:
                    print(f"✓ Can connect to local tunnel port {tunnel.local_bind_port}")
                else:
                    print(f"✗ Cannot connect to local tunnel port {tunnel.local_bind_port}")
                    
            except Exception as e:
                print(f"✗ Error testing local tunnel port: {e}")
            
            tunnel.stop()
            return True
        else:
            print(f"✗ SSH tunnel failed to start")
            return False
            
    except Exception as e:
        print(f"✗ SSH tunnel error: {e}")
        return False

def test_direct_mysql():
    """Test direct MySQL connectivity (if SSH tunnel disabled)"""
    print("\n=== Testing Direct MySQL Connectivity ===")
    
    with open('db_creds.json', 'r') as f:
        creds = json.load(f)
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((creds['host'], creds['port']))
        sock.close()
        
        if result == 0:
            print(f"✓ Can connect to MySQL at {creds['host']}:{creds['port']}")
            return True
        else:
            print(f"✗ Cannot connect to MySQL at {creds['host']}:{creds['port']}")
            return False
            
    except Exception as e:
        print(f"✗ Error testing direct MySQL: {e}")
        return False

if __name__ == "__main__":
    try:
        # Load and display config
        with open('db_creds.json', 'r') as f:
            creds = json.load(f)
        
        print("=== Configuration ===")
        print(f"MySQL Host: {creds['host']}")
        print(f"MySQL Port: {creds['port']}")
        print(f"SSH Enabled: {creds.get('ssh_tunnel', {}).get('enabled', False)}")
        
        if creds.get('ssh_tunnel', {}).get('enabled', False):
            ssh_config = creds['ssh_tunnel']
            print(f"SSH Host: {ssh_config['ssh_host']}")
            print(f"SSH Port: {ssh_config['ssh_port']}")
            print(f"SSH User: {ssh_config['ssh_user']}")
            
            test_ssh_connectivity()
        else:
            test_direct_mysql()
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
