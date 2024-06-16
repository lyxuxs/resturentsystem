# resturentsystem



To run your Node.js server without stopping it manually, you typically need a process manager that can handle running your server as a background process. This ensures that the server continues to run even after you close your terminal session or log out from your SSH session.

Using pm2 as a Process Manager
One of the most popular process managers for Node.js applications is pm2. Here’s how you can use pm2 to start your Node.js server and keep it running:

Step 1: Install pm2

If you haven't installed pm2 globally yet, you can do so using npm:

bash
Copy code
npm install -g pm2
Step 2: Start Your Node.js Server with pm2

Navigate to your project directory where your Node.js server file (index.js, for example) is located.

bash
Copy code
cd /path/to/your/project
Start your Node.js server using pm2:

bash
Copy code
pm2 start index.js
Replace index.js with your actual server file name.

Step 3: Manage Your Application with pm2

Once started, pm2 will keep your Node.js server running in the background. You can manage your application using various pm2 commands:

Check status of all applications:

bash
Copy code
pm2 status
Stop an application:

bash
Copy code
pm2 stop <app_name or id>
Restart an application:

bash
Copy code
pm2 restart <app_name or id>
View logs:

bash
Copy code
pm2 logs
Monitor CPU and memory usage:

bash
Copy code
pm2 monit
Save current process list:

bash
Copy code
pm2 save
Startup script generation (to ensure application starts automatically on system boot):

bash
Copy code
pm2 startup
Step 4: Keep pm2 Running

By default, pm2 will keep your Node.js application running in the background even after you log out or close your terminal. This is the main advantage of using a process manager like pm2 for production deployments.

Notes:
Update or deploy: Whenever you update your Node.js application code, you can stop the current pm2 process (pm2 stop <app_name or id>) and restart it (pm2 start <app_name or id>).

Logging: pm2 automatically logs application output. You can view logs using pm2 logs.

Security: Ensure that your Node.js application is running securely, especially in production environments.

By following these steps, you can effectively manage your Node.js application using pm2, keeping it running continuously without manual intervention. This setup is suitable for long-running applications such as web servers, APIs, and background tasks.