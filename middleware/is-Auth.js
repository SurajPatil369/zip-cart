module.exports=(req,res,next)=>{
    if (!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    console.log('is auth succefull',req.session.isLoggedIn);
    next()
}