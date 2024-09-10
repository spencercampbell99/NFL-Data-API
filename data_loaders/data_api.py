import requests

class LocalhostAPI:
    def __init__(self):
        self.base_url = 'http://localhost:8000'
        self.auth_cookie = None
        
        # Load the password from the file
        try:
            with open('api_pass.txt', 'r') as f:
                self.api_pass = f.read().strip()
        except FileNotFoundError:
            print('api_pass.txt not found. Please create a file with the password for the API')
            exit()

        self.api_user = 'sallertonc@gmail.com'
        
        # Login and extract the SHHBETS-AUTH cookie
        login_response = self.post('/api/auth/login', {'email': self.api_user, 'password': self.api_pass}, return_response=True)

        if login_response is None or 'SHHBETS-AUTH' not in login_response.cookies:
            print('Error logging in. SHHBETS-AUTH cookie not found in the response.')
            exit()

        # Store the SHHBETS-AUTH cookie
        self.auth_cookie = login_response.cookies['SHHBETS-AUTH']

    def get_headers(self):
        """Helper function to get headers (optional) and cookies."""
        return {
            'Content-Type': 'application/json'
        }

    def get_cookies(self):
        """Helper function to return cookies for authenticated requests."""
        
        if self.auth_cookie is None:
            return None
        
        return {'SHHBETS-AUTH': self.auth_cookie}

    def get(self, endpoint):
        url = self.base_url + endpoint
        try:
            response = requests.get(url, headers=self.get_headers(), cookies=self.get_cookies())
            
            # if the response is not 200, print details
            if response.status_code != 200:
                print(f"Error in GET request: {response.status_code} - {response.text}")
                return None
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:            
            print(f"Error in GET request: {e}")
            return None

    def post(self, endpoint, data, return_response=False):
        url = self.base_url + endpoint
        try:
            response = requests.post(url, json=data, headers=self.get_headers(), cookies=self.get_cookies())
            response.raise_for_status()
            return response if return_response else response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error in POST request: {e}")
            return None

    def put(self, endpoint, data):
        url = self.base_url + endpoint
        try:
            response = requests.put(url, json=data, headers=self.get_headers(), cookies=self.get_cookies())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error in PUT request: {e}")
            return None

    def delete(self, endpoint):
        url = self.base_url + endpoint
        try:
            response = requests.delete(url, headers=self.get_headers(), cookies=self.get_cookies())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error in DELETE request: {e}")
            return None