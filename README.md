# NFL Data API
This repository provides an application for accessing NFL data, including player statistics, team information, game schedules, and more.

## Features
- Retrieve detailed player statistics.
- Access team information and standings.
- Fetch game schedules and results.

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/spencercampbell99/NFL-Data-API.git
    ```
2. Navigate to the project directory:
    ```bash
    cd NFL-Data-API
    ```
3. Install dependencies:
    ```bash
    cd api
    npm install
    ```
    ```bash
    cd nfl-stats
    npm install
    ```
    ```bash
    cd data-loaders
    {create venv from requirements.txt}
    ```
4. Create .env files in each application based on example env files provided

## Usage
### Backend
/api
1. Install dependencies with `npm install`
2. Start docker with the docker-compose file, at least for running the MySQL instance
3. If working locally, `npm run local` will access `.env.local`
4. Make sure `.env` or `.env.local` are populated based on `.env.example`

### Frontend
/nfl-stats
1. `npm install`
2. Populate `env.local` from `.env.example`
3. Run `npm run dev`
4. Open browser and navigate to `localhost:3000`

### Data Loaders
/data-loaders
1. Create python venv based on `requirements.txt`
2. Currently there is no entry point. The loaders are split into different scripts as needed and will insert into the connected MySQL instance (update SQLConnector.py with relevant connection details)

### Machine Models
These are no present in this repo.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please open an issue or contact the repository owner.
