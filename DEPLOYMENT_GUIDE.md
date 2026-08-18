# 🚀 The Ultimate Beginner's Guide to Deploying ArchLab

Welcome! If you've never deployed a web application before, you are in the right place. This guide is designed to be **100% beginner-friendly**. We will go step-by-step to get ArchLab live on the internet, securely and efficiently.

We are going to use **Docker**. Think of Docker as a magic shipping container. It packs up your code, the database, and everything else it needs, so it can run exactly the same way on *any* computer without breaking.

---

## 🛠️ Step 1: Getting a Server (Your App's New Home)

You can't run a website 24/7 from your laptop. You need to rent a small piece of a computer in the cloud. This is called a **VPS (Virtual Private Server)**.

1. Go to a provider like **DigitalOcean**, **Hetzner**, or **AWS**.
2. Create a new server (often called a "Droplet" or "Instance").
3. Choose **Ubuntu** (version 22.04 or 24.04 is great) as the Operating System.
4. The cheapest plan ($4 - $6/month) is perfectly fine for starting out!
5. **Important:** Add an SSH Key or set a strong root password during setup.

---

## 🔑 Step 2: Logging into Your Server

Once your server is created, the provider will give you an **IP Address** (a string of numbers like `123.45.67.89`).

1. Open your computer's terminal (Command Prompt/PowerShell on Windows, Terminal on Mac).
2. Type the following command (replace `your_server_ip` with the real numbers):
   ```bash
   ssh root@your_server_ip
   ```
3. Type `yes` if it asks about a fingerprint, and enter your password. You are now inside your cloud server! ☁️

---

## 📦 Step 3: Installing the Magic Shipping Container (Docker)

Now that we are inside the server, we need to install Docker. Copy and paste this exact command into your terminal and hit Enter:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
```

Wait a minute or two for it to finish. You now have everything you need to run the app!

---

## 📥 Step 4: Downloading Your Code

Next, we need to bring your ArchLab code onto this server. We do this using `git`.

1. Run this command to download the code:
   ```bash
   git clone https://github.com/yourusername/ArchLab.git
   ```
   *(Note: Replace the link with your actual GitHub repository link)*

2. Go inside the folder we just downloaded:
   ```bash
   cd ArchLab
   ```

---

## 🔒 Step 5: The Secret Settings (CRITICAL)

For security, we never share passwords in our code. We put them in a hidden file called `.env` (Environment Variables). 

1. Create your secret file by copying the template:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open the file to edit it:
   ```bash
   nano backend/.env
   ```

3. **What to change inside this file:**
   - `SECRET_KEY`: Change this to random gibberish. (e.g., `dsf879sdf7sd89fsdfh23uhbdsf`)
   - `DEBUG`: Change `True` to `False`. This is super important so hackers don't see error details!
   - `ALLOWED_HOSTS`: Change `localhost,127.0.0.1` to your server's IP address (e.g., `123.45.67.89`).
   - `DB_PASSWORD`: Change `your-postgres-password` to a strong database password.

4. **How to save and exit:** Press `Ctrl + O`, then `Enter`, then `Ctrl + X`.

---

## 🚀 Step 6: Launching the Application!

Here is the magic moment. We will tell Docker to read our instructions, build our backend, build our frontend, and connect the database securely.

Run this command:
```bash
docker compose up -d --build
```

*(This will take a few minutes the first time as it downloads Ubuntu, Python, and Node.js behind the scenes. Grab some water! 💧)*

---

## 🗃️ Step 7: Setting up the Database

The containers are running, but the database is completely empty. We need to tell Django to create the tables.

1. Run this command to set up the database tables:
   ```bash
   docker exec -it archlab_backend python manage.py migrate
   ```

2. (Optional) Create an admin account so you can log into the backend control panel:
   ```bash
   docker exec -it archlab_backend python manage.py createsuperuser
   ```

🎉 **CONGRATULATIONS!** 🎉
Open your browser and type in your server's IP address. You should see ArchLab up and running!

---

## 🛡️ A Note on Security (100% Secure)

You might be wondering, "Is my database safe from hackers?"
**YES!** 
In this setup, your PostgreSQL database and Redis cache are *not* exposed to the public internet. They don't have open ports. They live in a private virtual network created by Docker, and *only* your Python backend is allowed to talk to them. 

Additionally, your Python backend is running as a restricted "non-root" user, meaning even if someone exploited the code, they couldn't take over the server.

---

## 🚑 Troubleshooting (What if it breaks?)

If the website isn't loading, don't panic! Check the logs (the server's diary):

To see what the backend is doing:
```bash
docker compose logs backend
```

To see what the frontend/web-server is doing:
```bash
docker compose logs frontend
```

If you ever need to restart the application, just run:
```bash
docker compose restart
```
