import fs from 'node:fs/promises'
import express from 'express'
import pg from "pg"
import bcrypt from "bcrypt"
import { Strategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import { validateAuthInputs } from './helperfunctions.js';
import morgan from "morgan"
import jwt from "jsonwebtoken";
import { sendEmail, asyncSendEmail } from './mailer.js';
import 'dotenv/config'


// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'
// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined
  
let vite

startServer()

async function startServer(){
  const app = express();

  passport.use(
    "local",
    new Strategy({
      usernameField: 'email',
      passwordField: 'password'
    }, 
    async function verify(email, password, cb) {
      //console.log(`Email: ${email}, Password: ${password}`)
      try {
        const {rows} = await db.query("SELECT user_id, username, password, email, level, to_char(date_joined, 'DD-MM-YYYY') AS date_joined, verified FROM users WHERE email = $1 ", [
          email,
        ]);
        console.log(rows);
        if (rows.length > 0) {
          // If the user is not verified, send an error saying account is not activated
          if(!rows[0].verified){
            return cb("Account not activated");
          }
          const user = {
            user_id: rows[0].user_id,
            username: rows[0].username,
            level: rows[0].level,
            date_joined: rows[0].date_joined
          };
          const storedHashedPassword = rows[0].password;
          //console.log(`Password: ${password}, Stored password: ${storedHashedPassword}`)
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                return cb(null, user);
              } else {
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  
  
  passport.serializeUser((user, cb) => {
    cb(null, user.user_id);
  });
  
  passport.deserializeUser(async(id, cb) => {
    try {
      const result = await db.query("SELECT user_id, username, level, to_char(date_joined, 'DD-MM-YYYY') AS date_joined FROM users WHERE user_id = $1", [id]);
      const user = result.rows[0];
      cb(null, user); // Deserialize the user from the ID stored in the session
    } catch (err) {
      cb(err);
    }
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie:{
        // secure: isProduction, // Secure in production (HTTPS)
        maxAge: 30 * 24 * 60 * 60 * 1000 //30 days (1month)
      }
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(morgan("dev"));
  app.use(trimReqBody)
  const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  })
  db.connect();

  const saltRounds = parseInt(process.env.SALT_ROUNDS);

  // Register API: Registering the user during the sign up process. If any error occurs and is catched by the catch statements, there will be a status 500 error. Otherwise, status is 200 for any of the returns. 
  app.post("/_auth/register", async(req, res) => {
    console.log(req.body);
    let authStatus = {
      error: false,
      passwordError: "",
      emailError: "",
      levelError: "",
      usernameError:""
    }
    // TODO: Server-side input validation here
    const {email, password, confirmPassword, username, level, levelRange} = req.body;
    authStatus = validateAuthInputs("register", authStatus, email, password, confirmPassword, username, level);
    if(authStatus.error){
      console.log(authStatus);
      return res.status(400).json(authStatus);
    }

    try{
      const checkResult = await db.query("SELECT * from users WHERE email = $1", [email]);
      if(checkResult.rows.length > 0){
        // user exists, send over an error
        console.log("Existing user found...")
        authStatus = {
          ...authStatus,
          error: true,
          emailError: "Email already in use."
        }
        // console.log(authStatus);
        return res.status(400).json(authStatus);
      } else{
        // hash the password
        const hash = await bcrypt.hash(password, saltRounds);
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        const levelInt = parseInt(level);
        const {rows:[user]} = await db.query(
          "INSERT INTO users (username, password, email, level, date_joined, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, level, to_char(date_joined, 'DD-MM-YYYY') AS date_joined",
          [username, hash, email, levelInt, formattedDate, false]
        );
        console.log("User added to database...");
        // jwt sign token
        const token = jwt.sign({email:email}, process.env.EMAIL_SECRET, {expiresIn: "30m"});
        const verificationEmailContent = `Please kindly click on the following link to verify your email account and activate your account to finish the registration process. This link is valid for 30 minutes. Your support is greatly appreciated!:\nhttp://localhost:${port}/verify?token=${token}.`;
        const verificationEmailTitle = "Email verification for account activation"
        sendEmail(email, verificationEmailContent, verificationEmailTitle);

        /** Instead of letting them into the site, we redirect them to the await confirmation site added with the email query parameter */
        return res.status(200).json({email: email});
      }

    } catch(err){
      console.error("Error selecting user...", err);
      return res.sendStatus(500)
    }
  });


  //  Login API: 
  app.post("/_auth/login", (req, res, next) =>{
    const {email, password, checkRemember} = req.body
    //qs.stringify turns the boolean checkRemember on the client-side to a string, e.g. "true" OR "false"
    //console.log(req.body)
    let authStatus = {
      error: false,
      emailError:"", 
      loginError:""
    }
    authStatus = validateAuthInputs("login", authStatus, email);
    //console.log(authStatus)
    if(authStatus.error){
      console.log(authStatus)
      return res.status(400).json(authStatus)
    }
    passport.authenticate("local", function(err, user, info, status){
      if(err){
        console.error(err);
      }
      if(!user){
        // If account has not been verified
        if(err === "Account not activated"){
          authStatus = {
            ...authStatus,
            error: true,
            loginError: "Account has not been activated"
          }
        }
        else{
          authStatus = {
            ...authStatus,
            error: true,
            loginError: "Email or password is incorrect"
          }
        }
        console.log(authStatus)
        return res.status(401).json(authStatus);
      } else{
        //console.log(user)
        console.log("Login successful")
        
        // User can choose if they want a session through the "Remember me" option
        if(checkRemember === "true"){
          req.login(user, (err) => {
            if(err){
              console.error(err);
              return res.sendStatus(500);
            }
            
            req.session.save(() => {
              console.log("Session started successfully");
              const successResponse = {
                isAuthenticated : true,
                ...req.user
              }
              return res.status(200).json(successResponse);
            })
          });
        }else{
          console.log("Logging in without starting session");
          const successResponse = {
            isAuthenticated : true,
            ...req.user
          }
          return res.status(200).json(successResponse);
        }
      }
    })(req, res, next);
  })

  // API for checking authentication of the user
  // req.user should contain user_id, username, level, date_joined
  app.get("/_auth/check", (req, res) => {
    if(req.isAuthenticated()){
      const user_info = {
        isAuthenticated : true,
        ...req.user
      }
      // console.log("user_info:", user_info)
      return res.status(200).json(user_info)
    } else{
      return res.status(200).json({
        isAuthenticated : false,
        user_id:"",
        username:"",
        level:"",
        date_joined:""
      });
    }
  })


  // API for the "verify" route to verify the user in the database
  app.get("/verify_token/:token", async(req, res) => {
    const {token} = req.params;
    try{
      const decodedUser = jwt.verify(token, process.env.EMAIL_SECRET);
      const {email} = decodedUser;
      try {
        const {rows:[{user_id}]} = await db.query("UPDATE users SET verified=$1 WHERE email=$2 RETURNING user_id", [true, email]);
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        // Adding a user log for successful account activated
        const successRegisterLog = "Joined PaperDB! Successfully registered and activated account.";
        await db.query("INSERT INTO user_logs(user_id, log_entry, log_date) VALUES($1, $2, $3)", [user_id, successRegisterLog, formattedDate])
        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }catch(err){
      //if there is a problem with decoding
      console.error(err);
      if(err.name === "JsonWebTokenError"){
        return res.status(400).send(`Invalid token: ${err.message}`)
      }else if(err.name === "TokenExpiredError"){
        return res.status(401).send("Token has expired, invalid token");
      }else{
        return res.status(500).send(err.message);
      }
    }
  })

  app.post("/resend", async(req, res) => {
    const {email} = req.body;
    try{
      const token = jwt.sign({email:email}, process.env.EMAIL_SECRET, {expiresIn: "30m"});
      const verificationEmailContent = `Please kindly click on the following link to verify your email account and activate your account to finish the registration process. This link is valid for 30 minutes. Your support is greatly appreciated!:\nhttp://localhost:${port}/verify?token=${token}.`;
      const verificationEmailTitle = "Email verification for account activation"
      await asyncSendEmail(email, verificationEmailContent, verificationEmailTitle);
      return res.status(200).send("Verification email resend initated successfully")
    }catch(err){
      return res.status(500).send(`Error: ${err.name + " " + err.message}`);
    }
  })

  app.post("/forgot-password", async (req, res) => {
    const {email} = req.body;
    // 1. Validate the inputs
    const emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    let valStatus = {
      error:false,
      emailError:""
    }
    if(!emailRegex.test(email) || email.length > 320){ 
        //if email does not follow the regex pattern, or longer than 320 characters (maximum length of an email)
        valStatus = {
            error: true,
            emailError: "Email entered is not valid."
        }
        return res.status(400).json(valStatus);
    }
    // 2. Check if the email account exists
    try{
      const {rows} = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if(rows.length > 0){
        // if the email exists
        // 3. Send email with route to reset-password, along with a token (encoded with email and jwt)
        const token = jwt.sign({email}, process.env.EMAIL_SECRET, {expiresIn: "30m"});
        const forgotPasswordContent = `Please click on the link to reset your password. This link is valid for 30 minutes. Your support is greatly appreciated!:\nhttp://localhost:${port}/reset-password?token=${token}.`;
        const forgotPasswordTitle = "Link for password reset";
        sendEmail(email, forgotPasswordContent, forgotPasswordTitle);
        // 4. respond with the appropriate status and message
        return res.status(200).send("Email sending initiated successfully");
      }else{
        // if the email does not exists
        valStatus = {
          error: true,
          emailError: "Email entered is not linked to an account."
        }
        return res.status(400).json(valStatus);
      }
    }catch(err){
      console.error(err);
      console.log("Error selecting users...");
      return res.status(500).send(`${err.name}: ${err.message}`)
    }
  })


  app.get("/reset-password", (req, res) => {

  })


  //  Initialise vite middleware depending on dev or production mode
  await initialBootAndMiddleware(app)
  //  Sending over the HTML
  await ServeHTML(app)

  // Start http server
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
}


async function initialBootAndMiddleware(app){
  // Add Vite or respective production middlewares
  if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }
}

async function ServeHTML(app){
  // Serve HTML
  app.use('*', async (req, res) => {
    try {
      console.log("Original URL: ", req.originalUrl)
      // console.log("URL: ", req.url)
      const url = req.originalUrl.replace(base, '')

      let template
      let render
      if (!isProduction) {
        // Always read fresh template in development
        template = await fs.readFile('./index.html', 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      } else {
        template = templateHtml
        render = (await import('./dist/server/entry-server.js')).render
      }

      const rendered = await render("/"+url, ssrManifest)

      const html = template
        .replace(`<!--app-head-->`, rendered.head ?? '')
        .replace(`<!--app-html-->`, rendered.html ?? '')
      //console.log(html);
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })
}


function trimReqBody(req, res, next){
  if (req.body && typeof req.body === 'object') {
    // Iterate over each key in req.body
    Object.keys(req.body).forEach(key => {
      // Check if the value associated with the key is a string
      if (typeof req.body[key] === 'string') {
        // Trim whitespace from the string value
        req.body[key] = req.body[key].trim();
      }
    });
  }
  // Call the next middleware in the chain
  next();
}