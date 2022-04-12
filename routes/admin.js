const express   = require("express")
const router    = express.Router()
const mongoose  = require('mongoose')
const bcrypt = require("bcryptjs")
const passport = require("passport")

//models
require("../models/Categoria")
const Categoria = mongoose.model("categorias")

require("../models/Postagem")
const Postagem = mongoose.model("postagens")

require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

router.get('/', (req, res) => {
    res.render("admin/index")
})

//categorias

/**
 * @swagger
 * /categorias:
 *   get:
 *     description: Renderiza tela de todas as categorias
 *     responses:
 *       200:
 *         description: Recupera e renderiza em tela todas as categorias cadastradas
 */
router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias.map(categoria => categoria.toJSON())})
    }).catch((err) => {
        req.flash('error_msg', "houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

/**
 * @swagger
 * /categorias/add:
 *   get:
 *     description: Renderiza tela de nova categoria
 *     responses:
 *       200:
 *         description: Renderiza a tela de cadastro de uma nova categoria
 */
router.get('/categorias/add', (req, res) => {
    res.render("admin/addCategorias")
})

/**
 * @swagger
 * /categorias/nova:
 *   post:
 *     description: Cria nova categoria
 *     responses:
 *       200:
 *         description: Recebe e cria uma nova categoria
 */
router.post('/categorias/nova', (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }
})

/**
 * @swagger
 * /categorias/edit/:id:
 *   get:
 *     description: Renderiza edição de categoria
 *     responses:
 *       200:
 *         description: Renderiza a página de edição de uma categoria específica com base em seu id
 */
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Categoria inexistente!")
        res.redirect("/admin/categorias")
    })
})

/**
 * @swagger
 * /categorias/edit:
 *   post:
 *     description: Edita categoria
 *     responses:
 *       200:
 *         description: Edita os dados de uma categoria existente
 */
router.post("/categorias/edit", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido"})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }
    if(erros.length > 0){
        res.render("admin/categorias", {erros: erros})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar a categoria!")
                res.redirect("/admin/categorias")
            })

        }).catch((err) => {
            req.flash("error_msg", 'Houve um erro ao editar a categoria')
            res.redirect("/admin/categorias")
        })
    }
})

/**
 * @swagger
 * /categorias/deletar:
 *   post:
 *     description: Deleta categoria
 *     responses:
 *       200:
 *         description: Deleta uma categoria a partir de seu id
 */
router.post("/categorias/deletar", (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a categoria, tente novamente!")
        res.redirect("/admin/categorias")
    })
})

//postagens

/**
 * @swagger
 * /postagens:
 *   get:
 *     description: Renderiza tela de postagens
 *     responses:
 *       200:
 *         description: Recupera e renderiza todas as postagens
 */
router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao carregar as postagens")
        res.redirect("/admin")
    })

})

/**
 * @swagger
 * /postagens/add:
 *   get:
 *     description: Renderiza tela de criação de nova postagem
 *     responses:
 *       200:
 *         description: Renderiza tela para cadastro de uma nova postagem
 */
router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

/**
 * @swagger
 * /postagens/nova:
 *   post:
 *     description: Cadastra nova postagem
 *     responses:
 *       200:
 *         description: Recebe e cadastra uma nova postagem no banco
 */
router.post('/postagens/nova', (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }
    if(!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null || req.body.categoria == "0"){
        erros.push({texto: "Categoria inválido"})
    }
    if(req.body.titulo.length < 2){
        erros.push({texto: "Titulo da postagem muito pequeno"})
    }
    if(erros.length > 0){
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/addpostagem", {erros:erros, categorias:categorias})
        })
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem, tente novamente!")
            res.redirect("/admin")
        })
    }
})

/**
 * @swagger
 * /postagens/edit/:id:
 *   get:
 *     description: Renderiza edição de postagens
 *     responses:
 *       200:
 *         description: Recupera e renderiza a tela de edição de uma dada postagem com base em seu id
 */
router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar as categorias!")
            res.redirect("/admin/postagens")    
        })
    }).catch((err) => {
        req.flash("error_msg", "Postagem inexistente!")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }
    if(!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null || req.body.categoria == "0"){
        erros.push({texto: "Categoria inválido"})
    }
    if(req.body.titulo.length < 2){
        erros.push({texto: "Titulo da postagem muito pequeno"})
    }
    if(erros.length > 0){
        res.render("admin/postagens", {erros: erros})
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            postagem.titulo    = req.body.titulo
            postagem.slug      = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo  = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "erro interno")
                res.redirect("/admin/postagens")
            })

        }).catch((err) => {
            req.flash("error_msg", 'Houve um erro ao salvar a edição')
            res.redirect("/admin/postagens")
        })
    }
})

/**
 * @swagger
 * /postagens/deletar:
 *   post:
 *     description: Apaga uma postagem
 *     responses:
 *       200:
 *         description: Apaga uma postagem a partir de seu id
 */
router.post("/postagens/deletar", (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a postagem, tente novamente!")
        res.redirect("/admin/postagens")
    })
})

/**
 * @swagger
 * /registro:
 *   get:
 *     description: Renderiza tela de cadastro
 *     responses:
 *       200:
 *         description: Renderiza tela de cadastro de usuários
 */
router.get("/registro", (req, res) => {
    res.render("admin/registro")
})

/**
 * @swagger
 * /registro:
 *   post:
 *     description: Registra novo usuário
 *     responses:
 *       200:
 *         description: Recebe e registra um novo usuário
 */
router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha inválida"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas não combinam, tente novamente!"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito pequena"})
    }
    if(erros.length > 0){
        res.render("admin/registro", {erros: erros})
    }else{

        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Email ja registrado!")
                res.redirect("/admin/registro")
            }else{
                const novoUsuario = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                }

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("erro_msg", "houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        new Usuario(novoUsuario).save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao salvar seu usuário")
                            res.redirect("/admin/registro")
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }
})

/**
 * @swagger
 * /login:
 *   get:
 *     description: Renderiza tela de login
 *     responses:
 *       200:
 *         description: Renderiza a tela de login
 */
router.get("/login", (req, res) => {
    res.render("admin/login")
})

/**
 * @swagger
 * /login:
 *   post:
 *     description: Realiza redirecionamento pós auth
 *     responses:
 *       200:
 *         description: Redireciona o usuário após a autenticação com base no sucesso ou falha desse processo
 */
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/admin/login",
        failureFlash: true
    })(req, res, next)
})

/**
 * @swagger
 * /login:
 *   get:
 *     description: Realiza logout
 *     responses:
 *       200:
 *         description: Desloga o usuário do sistema
 */
router.get("/logout", (req, res) => {
    req.logOut()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})

module.exports = router;
