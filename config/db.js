if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://luanoliveira:<passwordluanç>@cluster0.drdub.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}