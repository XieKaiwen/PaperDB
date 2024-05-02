import fs from 'node:fs/promises'
import express from 'express'
import pg from "pg"
import bcrypt from "bcrypt"
import { Strategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import { validateInputs } from './helperfunctions.js';
import morgan from "morgan"
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
        const result = await db.query("SELECT user_id, username, password, email, level, to_char(date_joined, 'DD-MM-YYYY') AS date_joined FROM users WHERE email = $1 ", [
          email,
        ]);
        //console.log(result.rows);
        if (result.rows.length > 0) {
          const user = {
            user_id: result.rows[0].user_id,
            username: result.rows[0].username,
            level: result.rows[0].level,
            date_joined: result.rows[0].date_joined
          };
          const storedHashedPassword = result.rows[0].password;
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
    authStatus = validateInputs("register", authStatus, email, password, confirmPassword, username, level);
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

        const response = await db.query(
          "INSERT INTO users (username, password, email, level, date_joined) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, level, to_char(date_joined, 'DD-MM-YYYY') AS date_joined",
          [username, hash, email, level, formattedDate]
        );
        const user = response.rows[0];
        console.log("User added to database...");
        req.login(user, (err) => {
          if(err){
            console.error(err);
            return res.sendStatus(500);
          }
          req.session.save(() => {
            console.log("Successfully started session");
            //  console.log("req.user:", req.user);
            const successResponse = {
              isAuthenticated : true,
              ...req.user
            }
            return res.status(200).json(successResponse);
          })
        });
      }

    } catch(err){
      console.error("Error selecting user...", err);
      return res.sendStatus(500)
    }
  });


  //  Login API: 
  app.post("/_auth/login", (req, res, next) =>{
    const {email, password} = req.body
    //console.log(req.body)
    let authStatus = {
      error: false,
      emailError:"", 
      loginError:""
    }
    authStatus = validateInputs("login", authStatus, email);
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
        authStatus = {
          ...authStatus,
          error: true,
          loginError: "Username or password is incorrect"
        }
        console.log(authStatus)
        return res.status(401).json(authStatus);
      } else{
        //console.log(user)
        console.log("Login successful")
        req.login(user, (err) => {
          if(err){
            console.error(err);
            return res.sendStatus(500);
          }
          
          req.session.save(() => {
            console.log("Successfully started session");
            const successResponse = {
              isAuthenticated : true,
              ...req.user
            }
            return res.status(200).json(successResponse);
          })
        });
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


  //  initialise vite middleware depending on dev or production mode
  await initialBootAndMiddleware(app)
  //Sending over the HTML
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