//carregando módulos
const express    = require('express')
const handlebars = require('express-handlebars')
const mongoose   = require('mongoose')
const app        = express()
const admin      = require('./routes/admin')
const usuarios   = require("./routes/usuario")
const path       = require('path')
const session    = require('express-session')
const flash      = require('connect-flash')

//models
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

//autenticação
const passport = require("passport")
require("./config/auth")(passport)

//mongo MLAB
const db = require("./config/db")

//configurações
    //sessão
    app.use(session({
        secret: "cursodenodeluan",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })

    //parser
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    //handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

    //mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(() => {
        console.log('Conectado ao mongo')
    }).catch((err) => {
        console.log("erro ao se conectar: " + err)
    })

    // Public
    app.use(express.static(path.join(__dirname, 'public')))

//rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: 'desc'}).lean().then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar as postagens")
            res.redirect("/404")
        })
    })
    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).populate("categoria").lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Postagem não encontrada!")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})

        }).catch((err) => {
            req.flash("error_msg", "houve um erro ao carregar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar a pagina interna da categoria")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })
    app.use('/admin', admin)

    app.use("/usuarios", usuarios)

// outros
    const PORT = process.env.PORT || 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })