const { RTMClient } = require('@slack/client');
const { WebClient } = require('@slack/client');

//token giusto: xoxb-335051726561-pYT5uDDbYd5mheKzLOYAcWt8
const token = "xoxb-335051726561-pYT5uDDbYd5mheKzLOYAcWt8";

// il group id corretto è D9U11D601
const conversationId = 'D9WJH398X';

//array con url di immagini in cui abbondano disagio e memes 
const deletThisArray = ["https://img.4plebs.org/boards/pol/image/1484/03/1484039650581.gif","http://i0.kym-cdn.com/photos/images/newsfeed/001/100/078/7c3.jpg","https://vignette.wikia.nocookie.net/battlefordreamisland/images/f/fb/Delet-this-30039818.png/revision/latest?cb=20180307211749","https://vignette.wikia.nocookie.net/epicrapbattlesofhistory/images/b/b1/Delet_This_Joseph_Stalin.png/revision/latest?cb=20161211045207","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-Ly04Y-JXq5qQ1y2Hc6EqcXcgEe9UjlTsVq2cw_SlDWypW99w"];

//start bot	
const rtm = new RTMClient(token);
const web = new WebClient(token);
rtm.start();

//creo file in cui salvare link
var fs = require('fs')
var logger = fs.createWriteStream('link.txt', {
  	flags: 'a' // 'a' means appending (mantiene i dati precedentemente salvati)
})

//funzione randomize (per array di immagini)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//controllo link
var checklink = function(link){
    //creazione link pulito, senza caratteri brutti in mezzo
	var linkpulito = "";
	if(link.indexOf("|") == -1){	    
	    linkpulito = link;	    
	}else{
	    linkpulito = link.slice(0, link.indexOf("|"))
	}
    //ritorna la stringa col link completo che verrà salvato
	console.log("---> LINK : ", linkpulito)
	fs.readFile('link.txt', (err, dati) => {
	  	if (err) throw err;
        //scrivo i dati nel file dei link
	  	if (dati.indexOf(linkpulito) === -1){
	  		logger.write(linkpulito + "\n");  		
	  	}else{
            //rispondo con disagio e male parole se il link è già stato postato
	  	web.apiCall("chat.postMessage", {
                text: "Ancora sto link? (" + linkpulito+ ")",
                channel: conversationId,
                attachments: [{
                    title: "",
                    image_url: deletThisArray[getRandomInt(0, deletThisArray.length - 1)],
                }]
            }).then(() => console.log(" user delete dis ")).catch(console.error());
		}
	})
}

//prendo i link che si "nascondono" tra i testi 
var elaborateLinks = function(dataStr) {
    var endSearch = false;
    var index = 0;
    while(!endSearch){
        if (dataStr.indexOf("<", index) !== -1){
            var begin = dataStr.indexOf("<",index) + 1
            var end = dataStr.indexOf(">", index)
            checklink(dataStr.slice(begin, end))
            index = end + 1
        }else{
            endSearch = true
        }
    }
}

//se il messaggio è roba strana non faccio nulla, se lo ricevo correttamente il messaggio può avere un link
var recvFunc = function(mexrecived){
    if(mexrecived.subtype !== undefined){
        //console.log("/!\\ ATTENZIONE: il messaggio è stato modificato:")
    } else{
    	console.log("Messaggio ricevuto: ", mexrecived.text)
    	if(mexrecived.text !== undefined){
    		if((mexrecived.text.indexOf("<") !== -1) && (mexrecived.text.indexOf(">") !== -1)){
                console.log("il messaggio può contenere un link!")
   					//richiamo funzione controllo link
                	elaborateLinks(mexrecived.text);
			}
		}
	}
}	
rtm.on("message", recvFunc);