const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const lodash = require('lodash')
const app = express();
const dbPath = require('./config/database.js');
const dummyData= require('./public/database/mongodata/data')
require('dotenv').config()

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true,useUnifiedTopology: true});

const userSchema = {
    username:String,
    password:String
};

const ImageSchema = {
    url:String,
    camera:String,
    iso:Number,
    resolution:Number,
    exposure:String,
    version:String,
    flash:String,
    gps:String

}


const ImageCollection = new mongoose.model("Images",ImageSchema);
const User = new mongoose.model("Users",userSchema);






// This part of the code add dummy data  present in  public/database/mongodata/data.js to the mongodb when a user login for the first time

ImageCollection.find({},function(err,foundImage){

        if(err){
            console.log(err);
        }
        else{
            if(foundImage.length==0){
                console.log("dummy data")
                // console.log(dummyData);


                dummyData.map(function (image){
                    const newImage = new ImageCollection(image);
                    newImage.save(function (err) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("saved dummy data in database");
                        }
                    })
                })
                

   
            }
            else{
                console.log("database contains images ... so not adding any dummy data");
            }

        }


});
////////////////////////// end of dummy data saving ///////////////////////////////

///////////////////////////////////////////////////////////
app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.get("/logout", function(req, res){
    res.redirect("/");
  });

///////////////////////////////////////////////////////////

app.post("/register",function(req,res){
    const newUser = new User({
        username:req.body.username,
        password:req.body.password
    })

    newUser.save(function (err) {
        if(err){
            console.log(err);
        }
        else{
            res.render("searchpage")
        }
    })
})

app.post("/login",function(req,res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username:username},function (err,foundUser) {
        if(err){
            console.log(err);
        }
        else{
            
            if(foundUser){
                if(foundUser.password === password){
                    res.render("searchpage");
                }
                else{
                    console.log("wrong password");
                }
                
            }
            else{
                console.log("user not found");
            }
            
        }
    }) 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   

});

app.post("/imagedata",function(req,res){

    // const camera = req.body.searchval;

    const searchdata = lodash.pickBy(req.body);



    console.log("request body contains")
    console.log(searchdata);

    ImageCollection.find(searchdata,function(err,foundImage) {

        // console.log(imagedata)
        if(err){
            console.log(err);
        }
        else{
            if(foundImage.length!=0){
                console.log(foundImage);
                // console.log(foundImage.url);

                // const urls = foundImage.map(image => {
                //     return image.url;
                // })
                
                // console.log(urls)4
                // foundImage.push({url:"database/scenery1.jpg"})
                // foundImage.push({url:"database/scenery1.jpg"})
                // foundImage.push({url:"database/scenery1.jpg"})               
            

                res.render("showpics", {
                    images:foundImage
                });
   
            }
            else{
                res.send("no image found");
            }

        }
       


    });

});


////////////////////////////////////////////////////////////



app.listen(80, function() {
    console.log("Server started on port 80.");
  });

