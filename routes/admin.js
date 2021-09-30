const express   = require("express")
const router    = express.Router()
const mongoose  = require('mongoose')
const {isAdmin} = require("../helpers/isAdmin")

//models
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get('/', isAdmin, (req, res) => {
    res.render("admin/index")
})

//categorias
router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias.map(categoria => categoria.toJSON())})
    }).catch((err) => {
        req.flash('error_msg', "houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', isAdmin, (req, res) => {
    res.render("admin/addCategorias")
})

router.post('/categorias/nova', isAdmin, (req, res) => {

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

router.get('/categorias/edit/:id', isAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Categoria inexistente!")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", isAdmin, (req, res) => {
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

router.post("/categorias/deletar", isAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a categoria, tente novamente!")
        res.redirect("/admin/categorias")
    })
})

//postagens
router.get("/postagens", isAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao carregar as postagens")
        res.redirect("/admin")
    })

})

router.get("/postagens/add", isAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

router.post('/postagens/nova', isAdmin, (req, res) => {
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

router.get('/postagens/edit/:id', isAdmin, (req, res) => {
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

router.post("/postagens/edit", isAdmin, (req, res) => {
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

router.post("/postagens/deletar", isAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a postagem, tente novamente!")
        res.redirect("/admin/postagens")
    })
})




module.exports = router;