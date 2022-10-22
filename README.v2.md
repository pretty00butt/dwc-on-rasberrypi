# Serverless app for RESTful APIs as Database
### 1. Dependencies
- [cloudflare workers](https://workers.cloudflare.com/) (serverless app using `node`)
- [supabase](https://supabase.com) (SaaS for database)

### 2. APIs
- [postman collection](https://fgrdnnangbuaycxvveqb.supabase.co/storage/v1/object/public/personal/dwc-on-cloudflare-workers.json)

### 3. Installation
```bash
# Documentation: https://developers.cloudflare.com/workers/
npm install -g wrangler # CLI tool for cloudflare workers
wrangler login # login to cloudflare
cd /PATH/TO/dwc-on-cloudflare-workers/APP
wrangler dev # wrangler dev --env={ENV} for specific env
wrangler publish # wrangler publish --env={ENV} for specific env
```

### 4.  Development
loren ipsum loren ipsum loren ipsum loren ipsum loren ipsum loren ipsum loren ipsum loren ipsum loren ipsum

---

# Rasberry-pi

### 1. structure 
- client (canvas)
- server (socket)

### 2. installation
##### 0. Prerequisite

**0-1. access to rasberry-pi**
1. connect to wifi (mesh (*dwc2Mesh*) or each pi directly)
2. access to the pi using  `ssh` on terminal
```bash
ssh {HOST_IP_FOR_A_PI} -p {PORT_FOR_A_PI}
# ssh 192.168.100.1 -p 22 (if connected to each pi directly)
# ssh 192.168.0.{IP NUMBER OF EACH PI} -p {PORT NUMBER OF EACH PI}
```


**0-2. installation**
```bash
# 1. Install `node`
# Documentation - https://github.com/nvm-sh/nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
nvm install --lts # or specific version -> nvm install 16

# 2. Install `pm2` to manage nodejs apps
# Documentation - https://pm2.keymetrics.io/docs/usage/quick-start/
npm install -g pm2

# 3. Install `nginx` to server client(canvas) app
sudo apt update && sudo apt install nginx
```

##### 1. client (/canvas)
```
### First time setup: Frontend

We are going to serve the frontend using `nginx`. In order to set that up, you need to follow the steps below *once*, the first time when setting a PI up.

1. Make sure nginx installed properly, by navigating to the PI's IP (port 80) in the browser. You should see an `nginx` default webpage.
2. Create a folder called `dwc` for the frontend, inside of `/var/www`: `mkdir /var/www/dwc`. You might need `sudo`.
3. Point nginx to the `dwc` folder as a default, by editing the file at `/etc/nginx/sites-enabled/default`. You need to change the `root` and `location` properties. `root` should point to `/var/www/dwc` instead of the default `/var/www/html`. `location` should be `try_files $uri $uri/ /index.html =404`.
4. Restart nginx: `sudo service nginx restart`.

Since the folder is currently empty, if you navigate to the PI's IP in the browser you won't see anything.
```

##### 2. socket (/server)
Under the `server` folder of this repository, you should see a `.env-sample.txt` file. This is the template for the server `.env` configuration. Rename this file into `.env` (with no other extension,) and make sure to change the parameters in there to match the type of garden you want. There are four garden types: `moss`, `mushroom`, `lichen` and `all`. The individual gardens only contain one type of creature, while the `all` one contains all three types of creatures.
Make sure to also update the `WEATHER_API` variable with the correct URL of the local weather server.

In order to start the server, you need to run the following in your terminal, in the server folder (with the appropriate name, i.e. change `moss` to `lichen`, `mushroom` or `all`):

```
pm2 start index.js --name "moss"
```

You can make sure that the server started by typing `pm2 ls` in your terminal. You should see a list of all running servers.
You can stop the server by running `pm2 stop moss`. (or `pm2 stop mushroom`, etc. Use the name you've assigned the server in the start command.)
After stopping, you can restart the server by running `pm2 start moss`.

**2-1. more useful commands for `pm2`**
```bash
pm2 list # show a list of current apps to manage
pm2 start index.js # run a file named `index.js`
pm2 start index.js --name 'MYAPP' # run a file named `index.js` with a name `MYAPP`
pm2 stop {PM2_ID} # stop the app with id
pm2 stop {PM2_NAME} # stop the app with name typed when started
pm2 restart {PM2_ID} # restart the app with id
pm2 restart {PM2_NAME} # restart the app with name
pm2 logs # show logs for all apps managed now
pm2 logs {PM2_ID} # show logs for the specific app with id
pm2 logs {PM2_NAME} # show logs for the specific app with name
```