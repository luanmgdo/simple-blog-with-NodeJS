if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://luanoliveira:<password>@blogapp.8fj1u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}
