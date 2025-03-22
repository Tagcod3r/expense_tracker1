import express from 'express';
import { dirname } from 'path';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { supabase } from './config/db.js';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3002;  // Use dynamic port

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'Guessyouwillneverknow',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
}));

app.use(flash());
app.use(cookieParser());

// ... rest of your routes and middleware ...

app.listen(port, '0.0.0.0', () => {
  console.log("Server running on port " + port);
});

// Middleware to pass flash messages to views
app.use((req, res, next) => {
  res.locals.loginError = req.flash("loginError")[0] || null;
  res.locals.registerError = req.flash("registerError")[0] || null;
  res.locals.activeForm = req.flash("activeForm")[0] || "register";
  res.locals.message = req.flash("message")[0] || null;
  next();
});

// Remove await connectDB(); because Supabase client doesn't require it

// GET "/" route: Render the HomeBefore page with login/register forms.
app.get("/", (req, res) => {
  const message = req.cookies.message || null;
  res.render("HomeBefore", { 
    activePage: "home",
    loginError: res.locals.loginError,
    registerError: res.locals.registerError,
    activeForm: res.locals.activeForm,
    message: message
  });
});

// POST "/register" route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if the email is already registered using Supabase
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
      
    if (selectError) {
      console.error("Select error:", selectError);
      throw selectError;
    }
      
    if (existingUsers && existingUsers.length > 0) {
      req.flash("registerError", "Email already exists, try a different one");
      req.flash("activeForm", "register");
      return res.redirect("/");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with the hashed password (store under "password")
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select(); // Returns the inserted row(s)
      
    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("Registration Successful:", insertedUser);
    res.cookie("message", "Registration successful. Please log in.", { maxAge: 5000 });
    req.flash("activeForm", "login");
    return res.redirect("/");
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).send("Something went wrong");
  }
});

// POST "/login" route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Query for user by email using Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
      
    if (error) {
      throw error;
    }
      
    if (!users || users.length === 0) {
      req.flash("loginError", "Please register, no account found!");
      req.flash("activeForm", "register");
      return res.redirect("/");
    }
    
    const user = users[0];
    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log("Login successful");
      req.session.user = {
        id: user.user_id, // adjust if your primary key is named differently
        username: user.username,
        email: user.email
      };
      req.session.successMessage = "Thank you! You have logged in successfully. ✅";
      req.session.showGuidelines = true; // New flag for guidelines
      return res.redirect("/home");
    } else {
      req.flash("loginError", "Incorrect password!");
      req.flash("activeForm", "login");
      return res.redirect("/");
    }
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).send("Something went wrong");
  }
});

app.get("/home", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  // Retrieve the success message from session (if exists)
  const successMessage = req.session.successMessage;
  const showGuidelines = req.session.showGuidelines;
  // Clear the success message so it doesn't persist on refresh
  req.session.successMessage = null;
  req.session.showGuidelines = false;
  res.render("home", { 
    activePage: "home", 
    username: req.session.user.username, 
    loginError: successMessage,  // Show message only once
    message: null,  // Keep this for other messages if needed
    showGuidelines: showGuidelines  // Guidelines flag
  });
});

// DELETE (Profile Deletion) Route - Protected
app.post('/delete', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    res.cookie("message", "You must be logged in to delete your profile.", { maxAge: 5000 });
    return res.redirect("/");
  }
  try {
    // Check if the user exists in the database
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.session.user.id)
      .single();

    if (checkError || !userExists) {
      console.error("User not found or error checking existence:", checkError);
      res.cookie("message", "User not found. Cannot delete.", { maxAge: 5000 });
      return res.redirect("/");
    }

    // If user exists, delete the user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', req.session.user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      res.cookie("message", "Error deleting your profile.", { maxAge: 5000 });
      return res.redirect("/");
    }

    // Destroy session after successful deletion
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Error while logging out");
      } else {
        console.log("Profile deleted");
        res.cookie("message", "Your account has been deleted.", { maxAge: 5000 });
        res.redirect("/");
      }
    });
  } catch (err) {
    console.error("Catch block error deleting profile:", err);
    res.status(500).send("Something went wrong");
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.redirect("/");
    }
    console.log("Logout successful");
    res.cookie("message", "You have been logged out successfully.", { maxAge: 5000 });
    res.redirect("/");
  });
});

//---------------------------------------------------------------------------------------------------------



// Middleware to require login for protected routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
    return;
  }
  next();
}

// POST: Select an account and update session with its current values
app.post("/select-account", requireLogin, async (req, res) => {
  const { selectedAccount } = req.body;

  if (!selectedAccount) {
    res.cookie("message", "No account selected!", { maxAge: 5000 });
  }

  req.session.selectedAccount = selectedAccount;
  console.log("Selected Account:", selectedAccount);

  try {
    // Fetch initial balance
    const { data: initialBalanceData, error: initialBalanceError } = await supabase
      .from("account")
      .select("initial_bal")
      .eq("account_id", selectedAccount)
      .single(); // Ensures only one result is fetched

    if (initialBalanceError) {
      console.error("Error fetching initial balance:", initialBalanceError);
      throw initialBalanceError;
    }

    const initialBalance = parseFloat(initialBalanceData?.initial_bal || 0);

    // Fetch total expenses using COALESCE to handle null values
    const { data: totalExpensesData, error: totalExpensesError } = await supabase
      .from("expense")
      .select("expense_amount")
      .eq("account_id", selectedAccount);

    if (totalExpensesError) {
      console.error("Error fetching total expenses:", totalExpensesError);
      throw totalExpensesError;
    }

    // Calculate total expenses (manually sum up, since Supabase doesn't handle aggregation like SQL directly)
    const totalExpenses = totalExpensesData.reduce(
      (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
      0
    );

    // Calculate remaining balance
    const balanceRemaining = initialBalance - totalExpenses;

    // Update session with account data
    req.session.initialBalance = initialBalance;
    req.session.totalExpenses = totalExpenses;
    req.session.balanceRemaining = balanceRemaining;

    console.log("Updated Values:", {
      initialBalance,
      totalExpenses,
      balanceRemaining,
    });

    // Respond with updated data
    return res.json({
      success: true,
      message: "Account selected successfully!",
      data: {
        initialBalance,
        totalExpenses,
        balanceRemaining,
      },
    });
  } catch (err) {
    console.error("Error updating account data:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating account data.",
    });
  }
});


// GET: Endpoint to fetch current dashboard data via AJAX
// GET: Endpoint to fetch current dashboard data via AJAX
app.get("/dashboard-data", requireLogin, async (req, res) => {
  try {
    const selectedAccount = req.session.selectedAccount;
    if (!selectedAccount) {
      return res.status(400).json({ success: false, message: "No account selected" });
    }

    // Fetch initial balance from the "account" table
    const { data: accountData, error: accError } = await supabase
      .from('account')
      .select('initial_bal')
      .eq('account_id', selectedAccount)
      .single();
    if (accError) throw accError;
    const initialBalance = parseFloat(accountData.initial_bal || 0);

    // Fetch expenses for the selected account
    const { data: expensesData, error: expError } = await supabase
      .from('expense')
      .select('expense_amount')
      .eq('account_id', selectedAccount);
    if (expError) throw expError;
    
    // Calculate total expenses manually
    const totalExpenses = expensesData.reduce((sum, exp) => sum + parseFloat(exp.expense_amount || 0), 0);
    const balanceRemaining = initialBalance - totalExpenses;

    return res.json({
      success: true,
      data: { initialBalance, totalExpenses, balanceRemaining }
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
});


// GET: Render the dashboard (full page load)
app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    console.log("Session Data:", req.session);
    const userId = req.session.user.id;

    // Fetch all accounts for the user
    const { data: accounts, error: accountsError } = await supabase
      .from('account')
      .select('account_id, account_name, initial_bal')
      .eq('user_id', userId)
      .order('account_id', { ascending: true });
    if (accountsError) throw accountsError;

    // Retrieve and clear any session messages
    const accountMessage = req.session.accountMessage;
    delete req.session.accountMessage;
    const expenseMessage = req.session.expenseMessage;
    delete req.session.expenseMessage;

    // Use session values for balance info if they exist, else default to 0
    const balanceRemaining = parseFloat(req.session.balanceRemaining) || 0.00;
    delete req.session.balanceRemaining;
    const initialBalance = parseFloat(req.session.initialBalance) || 0.00;
    delete req.session.initialBalance;
    const totalExpenses = parseFloat(req.session.totalExpenses) || 0.00;
    delete req.session.totalExpenses;

    // Get the array of account IDs for this user
    const accountIds = accounts.map(a => a.account_id);

    // Fetch recent expenses (limit 4) for these accounts
    const { data: recentExpenses, error: recentError } = await supabase
      .from('expense')
      .select('expense_id, expense_date, expense_amount, expense_title, description')
      .in('account_id', accountIds)
      .order('expense_date', { ascending: false })
      .limit(4);
    if (recentError) throw recentError;

    // Fetch all expenses (for view-all) for these accounts
    const { data: allExpenses, error: allExpError } = await supabase
      .from('expense')
      .select('expense_id, expense_date, expense_amount, expense_title, description')
      .in('account_id', accountIds)
      .order('expense_date', { ascending: false });
    if (allExpError) throw allExpError;

    res.render("dashboard", {
      activePage: "dashboard",
      username: req.session.user.username,
      accountMessage: accountMessage || null,
      accounts: accounts,
      selectedAccount: req.session.selectedAccount || null,
      expenseMessage: expenseMessage || null,
      balanceRemaining: balanceRemaining.toFixed(2) || "0.00",
      totalExpenses: totalExpenses.toFixed(2) || "0.00",
      initialBalance: initialBalance.toFixed(2) || "0.00",
      recentExpenses: recentExpenses,
      allExpenses: allExpenses
    });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).send("Error fetching dashboard");
  }
});


// Get all expenses for view-all
// GET: Render "view-all" page with all expenses for the logged-in user
app.get('/view-all', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  try {
    // First, fetch all accounts for this user to get the account IDs
    const { data: accounts, error: accError } = await supabase
      .from('account')
      .select('account_id')
      .eq('user_id', userId);
    if (accError) throw accError;
    
    const accountIds = accounts.map(a => a.account_id);

    // Fetch all expenses for these account IDs
    const { data: allExpenses, error: expError } = await supabase
      .from('expense')
      .select('expense_id, expense_date, expense_amount, expense_title, description')
      .in('account_id', accountIds)
      .order('expense_date', { ascending: false });
    if (expError) throw expError;

    res.render("view-all", { allExpenses });
  } catch (err) {
    console.error("Error fetching expenses for view-all:", err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST: Delete expense (protected)
app.post('/delete-expense', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { expense_id } = req.body;

  if (!expense_id) {
    return res.status(400).json({ error: 'Expense ID is required' });
  }

  try {
    // First, fetch the expense to get its account ID
    const { data: expenseData, error: fetchError } = await supabase
      .from('expense')
      .select('account_id')
      .eq('expense_id', expense_id)
      .single();
    if (fetchError || !expenseData) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify that the account for this expense belongs to the logged-in user
    const { data: accountData, error: accountError } = await supabase
      .from('account')
      .select('user_id')
      .eq('account_id', expenseData.account_id)
      .single();
    if (accountError || !accountData || accountData.user_id !== userId) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    // Delete the expense
    const { data, error: deleteError } = await supabase
      .from('expense')
      .delete()
      .eq('expense_id', expense_id);
    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// POST: Add a new account (protected)
app.post("/add-account", requireLogin, async (req, res) => {
  const { account_name, initial_balance } = req.body;
  try {
    const userId = req.session.user.id;
    const { data: newAccount, error } = await supabase
      .from('account')
      .insert([{ account_name, initial_bal: initial_balance, user_id: userId }])
      .select();
    if (error) throw error;
    
    console.log("Account added successfully:", newAccount[0]);
    req.session.accountMessage = "Account added successfully!";
    res.redirect('/dashboard');
  } catch (err) {
    console.error("Error adding account:", err);
    res.status(500).json({ success: false, message: "Error adding account" });
  }
});


//expense table---------------------------------------------------------------------------
// Protected Expenses Route
app.get("/expense", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    // Determine the date range for the current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed
    const startDate = new Date(currentYear, currentMonth, 1).toISOString();
    const endDate = new Date(currentYear, currentMonth + 1, 1).toISOString();

    const selectedAccount = req.session.selectedAccount;
    if (!req.session.selectedAccount) {
      req.session.expenseMessage = "Please select an account first!";
      return res.redirect("/dashboard"); // Redirect to dashboard or account selection page
    }

    // Fetch expenses for the selected account within the current month
    const { data: expenses, error } = await supabase
      .from('expense')
      .select('expense_date, expense_amount')
      .eq('account_id', selectedAccount)
      .gte('expense_date', startDate)
      .lt('expense_date', endDate)
      .order('expense_date', { ascending: false });
      
    if (error) throw error;

    // Sum up the expense amounts
    const totalForMonth = expenses.reduce((sum, exp) => {
      return sum + parseFloat(exp.expense_amount || 0);
    }, 0);

    // Retrieve any flash message from session and then clear it
    const expenseMessage = req.session.expenseMessage;
    delete req.session.expenseMessage;

    res.render("expense", {
      activePage: "expense",
      expenses: expenses,
      total: totalForMonth.toFixed(2), // Format to two decimals
      selectedAccount: selectedAccount,
      expenseMessage: expenseMessage || null,
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).send("Something went wrong");
  }
});
app.post("/add-expense", requireLogin, async (req, res) => {
  const { amount, category, selectedAccount, expense_title, description } = req.body;
  console.log("Received Expense Data:", req.body);

  if (!amount || !category || !selectedAccount || !expense_title || !description) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // First, check if the category exists; if not, insert it.
    let { data: categoryData, error: catError } = await supabase
      .from('category')
      .select('category_id')
      .eq('category_name', category)
      .single();
      
    // If the category is not found, insert it.
    if (catError || !categoryData) {
      const { data: newCategory, error: insertCatError } = await supabase
        .from('category')
        .insert([{ category_name: category }])
        .select();
      if (insertCatError) {
        console.error("Error inserting new category:", insertCatError);
        throw insertCatError;
      }
      categoryData = newCategory[0];
    }
    
    const categoryId = categoryData.category_id;
    
    // Insert the new expense record
    const { data: expenseInsert, error: expenseInsertError } = await supabase
      .from('expense')
      .insert([{
        expense_title,
        description,
        expense_amount: amount,
        expense_date: new Date().toISOString(),
        account_id: selectedAccount,
        category_id: categoryId,
      }]);
    if (expenseInsertError) {
      console.error("Error inserting expense:", expenseInsertError);
      throw expenseInsertError;
    }

    req.session.expenseMessage = "Expense added successfully!";
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ success: false, message: "Error adding expense." });
  }
});



//reportgeneration------------------------------------------------------------------
app.get("/generate-report", requireLogin, (req, res) => {
  res.render("generate-report", { activePage: "reports" });
});

app.get("/api/report", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Fetch all accounts for the user
    const { data: accounts, error: accError } = await supabase
      .from('account')
      .select('account_id')
      .eq('user_id', userId);
    if (accError) throw accError;
    
    const accountIds = accounts.map(a => a.account_id);
    
    // Fetch expenses with related category info for these accounts
    // Note: We assume that the "expense" table has a foreign key "category_id"
    // and we can use a foreign table alias to get category_name.
    const { data: expenses, error: expError } = await supabase
      .from('expense')
      .select('expense_amount, category:category_id(category_name)')
      .in('account_id', accountIds);
    if (expError) throw expError;
    
    // Group expenses by category
    const reportData = {};
    expenses.forEach(exp => {
      const catName = exp.category?.category_name || "Uncategorized";
      reportData[catName] = (reportData[catName] || 0) + parseFloat(exp.expense_amount || 0);
    });
    
    // Convert the grouped data into an array of objects
    const reportArray = Object.keys(reportData).map(cat => ({
      category_name: cat,
      total: reportData[cat]
    }));
    
    res.json(reportArray);
  } catch (err) {
    console.error("Error fetching report data:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/save-report", requireLogin, async (req, res) => {
  try {
    const { type, reportDesc } = req.body;
    const userId = req.session.user.id;

    // Insert new report into the "report" table.
    const { data: newReport, error } = await supabase
      .from('report')
      .insert([{ 
        date_generated: new Date().toISOString(), 
        type, 
        report_desc: reportDesc, 
        user_id: userId 
      }])
      .select();
    if (error) throw error;

    res.json({ success: true, report_id: newReport[0].report_id });
  } catch (err) {
    console.error("Error inserting report:", err);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

app.get("/settings", requireLogin, (req, res) => {
  res.render("settings", { activePage: "settings" });
});

app.listen(port, '0.0.0.0', () => {
  console.log("Server running on port " + port);
});
