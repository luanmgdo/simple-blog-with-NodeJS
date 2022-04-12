if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://luanoliveira:<passwordluanç>@blogapp.8fj1u.mongodb.net/blogapp?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}
