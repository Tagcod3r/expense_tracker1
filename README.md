# Expense Tracker

Expense Tracker is a web application that helps you manage your finances efficiently. Track your expenses, generate insightful reports, and manage multiple accounts with ease—all through a responsive, modern interface.

## Features

- **User Authentication:** Secure registration and login with password hashing.
- **Dashboard:**  
  - Add and manage multiple accounts.  
  - View real-time balance updates and recent transactions.
- **Expense Tracking:**  
  - Log daily expenses with detailed information (date, time, category).  
  - View expenses in a searchable table with monthly summaries.
- **Report Generation:**  
  - Generate reports in various chart formats (bar, pie, line).  
  - Download reports as PDFs or images.
- **Settings:** Manage account preferences, logout, and delete your profile.
- **Responsive Design:** A clean, modern UI built with Bootstrap, Anime.js, and Lottie animations.
- **Flash Notifications:** Real-time alerts to guide user interactions.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, EJS, Bootstrap, Anime.js, Lottie
- **Backend:** Node.js, Express,Postgres (Development Phase), Supabase (Deployment Phase), bcryptjs, connect-flash, express-session
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Render, GitHub
## Preview
-  **Home Page**
  
![Dashboard Preview](https://github.com/user-attachments/assets/2982dfc8-84e2-48e5-94ac-51946e0665ed)

- **Dashboard View**
  
![Image](https://github.com/user-attachments/assets/180ebaa2-ccf6-4b52-bcbe-1ac68bcf3b39)

- **Responsive Design**

![Image](https://github.com/user-attachments/assets/0cc75c42-ffdd-46e4-8fca-08dc87a4ba24)

## Live Demo

Try Expense Tracker live: -> [expensetracker1-production.up.railway.app](expensetracker1-production.up.railway.app) 
                         or-> [https://your-expense-tracker.onrender.com](https://your-expense-tracker.onrender.com)

## How to Run Locally

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/expense_tracker.git
   cd expense_tracker

2. **Install Dependency**

    ```bash
    npm install

3. **Configure .env**

    ```bash
    SESSION_SECRET=your_secret_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key

4. **Run the Application**

    ```bash
    npm start

