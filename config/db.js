if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://luanoliveira:5RNS0C0M1TfyyJx7@bloggap-database.7dpdk.mongodb.net/bloggap-database?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}
