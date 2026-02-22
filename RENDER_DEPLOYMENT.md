# Deployment Instructions

Your code is now ready to be deployed to Render! I have configured an Infrastructure-as-Code `render.yaml` file so you can launch the exact environment without manually clicking through menus.

## Steps to Deploy on Render
1. Push your `what-in-the-civic-sense` folder to a new GitHub repository.
2. Go to [Render's Dashboard](https://dashboard.render.com).
3. Click **"New +" -> "Blueprint"**.
4. Connect the GitHub repository you just created.
5. Render will detect the `render.yaml` file and automatically ask you to provide the `MONGO_URI` environment variable.

### Setting up the Database (MONGO_URI)
Since Render does not offer a free-tier MongoDB host, you will need to create a database instance elsewhere:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up for a free Shared cluster.
2. In the "Database Access" section, create a user and password.
3. In the "Network Access" section, allow IP address `0.0.0.0/0` (anywhere) so Render can connect to it.
4. Click **Connect -> Drivers -> Python** to get your connection string. It will look like this: `mongodb+srv://<user>:<password>@clusterX.mongodb.net/civicsense?retryWrites=true&w=majority`
5. Copy this string entirely and paste it into the **RENDER DASHBOARD** when it asks for the `MONGO_URI`.

Once you provide the `MONGO_URI` and click **"Apply"**, Render will:
- Build the Python Flask API (`civic-sense-backend`).
- Build the React Frontend (`civic-sense-frontend`).
- Automatically pass the Backend's generated URL to the React app so they talk to each other.
