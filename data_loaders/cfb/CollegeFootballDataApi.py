import requests

class APIClient:
    def __init__(self):
        """
        Initializes an instance of the APIClient class.

        Reads the API key from the 'cfb_api_key.txt' file and sets up the base URL and headers for API requests.

        Raises:
            FileNotFoundError: If the 'cfb_api_key.txt' file is not found.
        """
        try:
            with open('cfb/cfb_api_key.txt', 'r') as file:
                self.api_key = file.read()
        except FileNotFoundError:
            print("Error: cfb_api_key.txt file not found. Create the file in /cfb with your API key and try again.")
            return
        
        self.base_url = "https://api.collegefootballdata.com"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def call_endpoint(self, endpoint, method='GET', data=None, params=None, verbose=False):
        """
        Calls the specified API endpoint with the given HTTP method and data.

        Args:
            endpoint (str): The API endpoint to call.
            method (str, optional): The HTTP method to use. Defaults to 'GET'.
            data (dict, optional): The data to send in the request body for 'POST' method. Defaults to None.
            params (dict, optional): The query parameters to send with the request. Defaults to None.
            verbose (bool, optional): Whether to print the URL and response. Defaults to False.

        Returns:
            dict: The JSON response from the API.

        Raises:
            requests.exceptions.RequestException: If an error occurs while making the API request.
        """
        url = f"{self.base_url}/{endpoint}"
        if method == 'GET':
            # Make a GET request to the specified endpoint and attach params if they exist
            response = requests.get(url, headers=self.headers, params=params)
        elif method == 'POST':
            response = requests.post(url, headers=self.headers, json=data)
        
        if verbose:
            print(f"URL: {response.url}")
        
        # Add other methods as needed
        return response.json()