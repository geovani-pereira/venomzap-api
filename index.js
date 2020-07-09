// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path')
const crypto = require('crypto');
const axios = require('axios');
const urlWebHook = "https://f2949f48480fdecfa6c57304bf42c1ac.m.pipedream.net";
const hash = "9B_=#@PJ7G&8pCYuDVmCymvgnh-7d7qhLSxz-f%nBqDcR3qA=YDKnJ2@C-vfLH^psBk@S3kE";

const multerConfig ={
    dest: path.resolve(__dirname,'uploads'),
    storage: multer.diskStorage({
        destination: (req,res,cb) =>{
            cb(null,path.resolve(__dirname,'uploads'))
        },
        filename: (req,file,cb)=> {
            crypto.randomBytes(16, (err,hash)=> {
                if(err) cb(err);
                const fileName = `${hash.toString('hex')}-${file.originalname}`;
                cb(null,fileName);
            });
        },
    }),
    limits: {
        fileSize: 4 *1024 * 1024,
    },
    fileFilter: (req,file,cb) =>{
        const allowedMimes =[
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/gif'
    ];
    if(allowedMimes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error('Invalid file type.'));
    }
    },
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));



venom.create('orelhao').then((client) => start(client)); 



async function start(client) {
    client.onAck(async ack => {
        console.log(ack.id.id)
        await axios.post(urlWebHook,ack);
        // console.debug(ack);
        //return res.send(ack);
         //ack 1 enviado
         //ack 2 entregue
         //ack 3 lido
        
       });
 
    client.onStateChange((state) => {
    console.log(state);
        const conflits = [
            venom.state.CONFLICT,
            venom.state.UNPAIRED,
         venom.state.UNLAUNCHED,
         ];
        if (conflits.includes(state)) {
      client.useHere();
    }
    });


    app.post('/mensagem',multer(multerConfig).single('file'),async function (req,res){
        let nameFile;
        const arquivo = req.file;
        const message = req.body.message;
        const number = req.body.number;
        const filename = req.body.filename;
        const token = req.body.token;

        if(token != hash){
            return res.send({error: "Token Invalido"});
        }

        const telefone = `55${number}@c.us`;
        //console.log(telefone);
        //client.sendText(telefone, teste);
        // Send image
       
        if(arquivo){
           nameFile  = arquivo.filename;
             await client.sendImage(
                  telefone,
                  arquivo.path,
                  arquivo.originalname,
                  message
            );
            var retorno = await client.sendText(
                telefone,' ‎‎'
            );
        
            return res.json(retorno)
        }

        if(filename){
          await client.sendImage(
                  telefone,
                  `uploads/${filename}`,
                  filename
                );

            var retorno = await client.sendText(
                    telefone," ‎‎"
              );
            return res.json(retorno)
        }

       
 
      

    
    })


    app.get('/qrcode', function (req,res){
        // Second create() parameter is the QR callback
        venom.create('sessionMarketing', (base64Qr, asciiQR) => {
        // To log the QR in the terminal
        console.log(asciiQR);
  
        // To write it somewhere else in a file
        exportQR(base64Qr, 'marketing-qr.png');

        return res.json(base64Qr);
  });
  
  
  
    })
    app.listen('3000', console.log("Servidor rodando"));
  }



    









// Writes QR in specified path
function exportQR(qrCode, path) {
    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');
  
    // Creates 'marketing-qr.png' file
    fs.writeFileSync(path, imageBuffer);
  }
