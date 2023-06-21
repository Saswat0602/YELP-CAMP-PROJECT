const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require('passport')
const LocalStrategy = require("passport-local");
const User = require("./models/user");




// const Campground = require("./models/campground");
// const { campgroundSchema, reviewSchema } = require("./schema.js");
// const catchAsync = require("./utils/catchAsync");
// const Review = require("./models/review");

const userRoutes = require('./routes/users')
const campgroundRoutes= require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

//make connection with mongo
mongoose.connect("mongodb://localhost:27017/yelp-camp");
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
app.use(express.static (path.join(__dirname,'public')))




const sessionConfig = {
  secret: "this  is top secret",
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


app.use(passport.initialize());
app.use(passport.session());
//authenticate from user from model/user
passport.use(new LocalStrategy(User.authenticate()));



//store on  session
passport.deserializeUser(User.deserializeUser());//remove from session
passport.serializeUser(User.serializeUser());



app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.use('/',userRoutes)
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.get("/", (req, res) => {
  res.render("home");
});



app.get ('/fakeUser',async(req,res)=>{
  const user = new User ({email:'sas12@gmail.com',username:'sam'})
  const newUser = await User.register(user, 'sam')
  res.send(newUser)
})






app.all("*", (req, res, next) => {
  res.send(new ExpressError("page Not Found", 404));
});


app.use((err, req, res, next) => {
  const { stausCode = 500, message = "something went wrong" } = err;
  res.status(stausCode);
  res.render("error", { err });
});



app.listen(3000, () => {
  console.log("listining on port 3000");
});