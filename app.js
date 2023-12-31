if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const helmet = require("helmet");


const mongoSanitize = require("express-mongo-sanitize");

const MongoStore = require("connect-mongo");


//make connection with mongo
// process.env.DB_URL;
const dbUrl = "mongodb://localhost:27017/yelp-camp" || process.env.DB

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection Error"));
db.once("open", () => {
  console.log("database connecteed");
});

const app = express();

// connect with ejs files

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// set path as ejs so we dont hav to write again and again which came from views directory
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

//sanitizing and protect from mongo  injection 
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error",function(e){
  console.log("session store error");
})

const sessionConfig = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};



app.use(session(sessionConfig));
app.use(flash());


// app.use(helmet())

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );







app.use(passport.initialize());
app.use(passport.session());
//authenticate from user from model/user
passport.use(new LocalStrategy(User.authenticate()));

//store on  session
passport.serializeUser(User.serializeUser());
//remove from session
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});



app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

//ERROR HANDELING BASIC

app.all("*", (req, res, next) => {
  res.send(new ExpressError("page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { stausCode = 500, message = "something went wrong" } = err;
  res.status(stausCode);
  res.render("error", { err });
});

app.listen(5000, () => {
  console.log("listining on port 5000");
});
