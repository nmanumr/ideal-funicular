class Logger{
    constructor(el){
        if(typeof el == 'string')
            this.el = document.getElementById(el);
        else
            this.el = el;
    }

    log(text, endChar="\n"){
        this.el.innerHTML += text + endChar;
    }

    clear(){
        this.el.innerHTML = '';
    }
}