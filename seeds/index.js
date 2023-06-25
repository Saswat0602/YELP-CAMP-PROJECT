// RETRIVE THE CITIES FROM CITIES JS AND STORE IT IN MONGO AS WELL AS SHOW IT IN CAMP GROUND PAGES



const mongoose = require("mongoose");
const cities = require('./cities')
const { places, descriptors } = require("./seedHelper");
const Campground = require("../models/campground");
const campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection Error"));
db.once("open", () => {
  console.log("database connecteed");
});

const sample = array =>array[Math.floor(Math.random()*array.length)];


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "649274a19e39edff1c174e92",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(()=>{
  mongoose.connection.close()
})