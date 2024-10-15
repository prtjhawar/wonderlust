const express = require("express");
const app = express();
const mongoose = require("mongoose");
const router = require("./router/test")
const listing = require("./models/listing.js");
const path = require("path");
const { render } = require('ejs');
const bodyParser = require('body-parser');
const e = require("express");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate =require("ejs-mate");
const wrapasyn = require("./utilts/wrapasync.js");
const ExpressError = require("./utilts/ExpressError.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")


// const listings = require("./routes/listing.js");
// const reviews = require("./routes/review.js");

const {listingSchema , reviewSchema} = require('./schema.js')
const Review = require("./models/reviews.js");
const { log } = require("console");
const { register } = require("module");




app.use(bodyParser.json());
// const index = require("./views/listing")

// app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 *24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,

    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")

    next();
})

app.get("/demouser",async(req,res)=>{
    let fakeuser = new User({
        email : "student@gmail.com",
        username:"delta-student"
    });
    let newregister = await User.register(fakeuser,"helloword");
    res.send(newregister);


})

// app.use("/listing",listings);
// app.use("/listing/:id/reviews",reviews)





const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("data base is connected")
})
.catch((err)=>{
    console.log(err);

})

app.get("/image",(req,res)=>{

})




async function main(){
    await mongoose.connect(MONGO_URL)

}


// validation for serverside
const validationlisting = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg)
    }else
    {
        next();
    }
};

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg)
    }else
    {
        next();
    }
}


//index route
app.get("/listing",async(req,res)=>{
    const allListing = await listing.find({})
    res.render("index.ejs",{allListing})
})
//New Route
app.get("/listings/new",(req,res)=>{
    res.render("new.ejs")
    
})
//Show route
app.get("/listing/:id",async(req,res)=>{
    let {id }= req.params;
    const Listing = await listing.findById(id).populate("reviews");
    // res.status(200).json(listing)
    if(!Listing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listing");
    }
    res.render("show.ejs",{Listing})
})

//create route


app.post("/listings",async(req,res)=>{
//    if(!req.body.listing){
//     throw new ExpressError(400,"something wrong")
//    }
        let listing = req.body.listing;
        const newListing = new Listing(listing);
        await newListing.save();
        req.flash("success","New Listing Created!")
        res.redirect("/listing")
    
})

//edit route
app.get("/listing/:id/edit",async(req,res)=>{
    let {id }= req.params;
    const Listing = await listing.findById(id);
    if(!Listing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listing");
    }
    res.render("edit.ejs",{Listing})
})

//update route

app.put("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndUpdate(id,{...req.body.listing})
    req.flash("success","Listing Updated!")

    res.redirect("/listing")
    

})

//delete route

app.delete("/listing/:id",async(req,res)=>{
     let{id}=req.params;
     let deletelisting = await Listing.findByIdAndDelete(id)
     
     req.flash("success","Listing Deleted!")
     res.redirect("/listing")

})

//Revies
//post route
app.post("/listing/:id/reviews",async(req,res)=>{
    let Listing = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    Listing.reviews.push(newReview);
    await newReview.save();
    await Listing.save();
    req.flash("success","Review Created!")

    // console.log("new reviwe saved");
    // res.send("new reviwe saved");
    res.redirect(`/listing/${Listing._id}`)
    


})

//delete post route

app.delete("/listing/:id/reviews/:reviewId",async(req,res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {review: reviewId}})

     await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted!")

     res.redirect(`/listing/${id}`);
}) 




//ERROE HANDLE


// app.all("*",(req,res,next) =>{
//     next(new ExpressError(404,"Page is not found!"))
// }) 


app.use((err,req,res,next)=>{
    
   let {statusCode = 500 , message= "Something went wrong!" } = err;
   res.status(statusCode).render("error.ejs" , {message} )
   
   res.status(statusCode).send(message)
})









const PORT = 8080

app.listen(PORT,()=>{
    console.log(`server is started at port ${PORT}`)

})