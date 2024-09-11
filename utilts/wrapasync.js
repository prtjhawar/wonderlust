module.exports = function wrapasyn(fn){
    return function(res,req,next) {
        fn(req,res,next).catch(next)
    }
}

