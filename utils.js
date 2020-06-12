function validatePostForm(title, content){
    if(title == "" || content == ""){
        return {message:{title: "Oups",content:"Contenu ou titre vide",color:"red"}, failed:true};
    }
    if(content.length > 2000 || title.length >= 100){
        return {message:{title: "Oups",content:"Contenu ou titre trop long.",color:"red"}, failed:true};
    }
    
    return {message: {title: "OK", content:"", color:"green"}, failed:false}
}

function escapeHtmlTag(string){
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = {
    validatePostForm
}