const express = require("express");
const app = express();
const mongoose = require("mongoose");
const router = require("./router/test")
const listing = require("./models/listing.js")
const path = require("path")
const { render } = require('ejs')
const bodyParser = require('body-parser');
const e = require("express");
const Listing = require("./models/listing.js")
const methodOverride = require("method-override")
const ejsMate =require("ejs-mate")
const wrapasyn = require("./utilts/wrapasync.js")
const ExpressError = require("./utilts/ExpressError.js")




app.use(bodyParser.json());
// const index = require("./views/listing")

// app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))



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
    const Listing = await listing.findById(id);
    // res.status(200).json(listing)
    res.render("show.ejs",{Listing})
})

//create route
app.post("/listings",async(req,res)=>{
    try{
        let listing = req.body.listing;
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listing")

    }catch(err){
        next(err)
    }
   
    
})

//edit route
app.get("/listing/:id/edit",async(req,res)=>{
    let {id }= req.params;
    const Listing = await listing.findById(id);
    res.render("edit.ejs",{Listing})
})

//update route

app.put("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect("/listing")
    

})

//delete route

app.delete("/listing/:id",async(req,res)=>{
     let{id}=req.params;
     let deletelisting = await Listing.findByIdAndDelete(id)
     console.log(deletelisting)
     res.redirect("/listing")

})








// app.get('/testlisting',async(req,res)=>{
//     let sample = new listing ({
//         title: "my new vila",
//         description: "by the beach",
//         price:1200,
//         location: " calengate",
//         country:"india"

//     });

//     await sample.save();
//     console.log("sample is save");
//     res.send("sussfuly save")
    



// })

//ERROE HANDLE
app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"Page is not found!"))
})
app.use((err,req,res,next)=>{
   let {statusCode,message} = err;
   res.status(statusCode).send(message)
})

app.use(router)

const PORT = 8080

app.listen(PORT,()=>{
    console.log(`server is started at port ${PORT}`)

})