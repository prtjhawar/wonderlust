const express = require('express');
const routre =  express.Router();



//index route
routre.get("/listing",async(req,res)=>{
    const allListing = await listing.find({})
    res.render("index.ejs",{allListing})
})
//New Route
routre.get("/listings/new",(req,res)=>{
    res.render("new.ejs")
    
})
//Show route
routre.get("/listing/:id",async(req,res)=>{
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


routre.post("/listings",async(req,res)=>{
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
routre.get("/listing/:id/edit",async(req,res)=>{
    let {id }= req.params;
    const Listing = await listing.findById(id);
    if(!Listing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listing");
    }
    res.render("edit.ejs",{Listing})
})

//update route

routre.put("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndUpdate(id,{...req.body.listing})
    req.flash("success","Listing Updated!")

    res.redirect("/listing")
    

})

//delete route

routre.delete("/listing/:id",async(req,res)=>{
     let{id}=req.params;
     let deletelisting = await Listing.findByIdAndDelete(id)
     
     req.flash("success","Listing Deleted!")
     res.redirect("/listing")

})

//Revies
//post route
routre.post("/listing/:id/reviews",async(req,res)=>{
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

routre.delete("/listing/:id/reviews/:reviewId",async(req,res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {review: reviewId}})

     await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted!")

     res.redirect(`/listing/${id}`);
})




























module.exports = routre;