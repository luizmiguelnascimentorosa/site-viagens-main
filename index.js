const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('./travelgo.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS destinos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    pais TEXT NOT NULL,
    preco INTEGER NOT NULL,
    imagem TEXT
  )
`);

const total = db.prepare('SELECT COUNT(*) AS total FROM destinos').get();

if (total.total === 0) {
  const inserirDestino = db.prepare(`
    INSERT INTO destinos (nome, pais, preco)
    VALUES (?, ?, ?)
  `);

  inserirDestino.run('Rio de Janeiro', 'Brasil', 899);
  inserirDestino.run('Paris', 'França', 3499);
}

const express = require('express')
const app = express()
const port = 8000

app.get('/' ,  (req, res) =>{
  res.send('...')
})


  app.get('/api/destinos', (req, res) => {
    const destinos = db.prepare(`
    SELECT id, nome, pais, preco, imagem
    FROM destinos
    `).all();
    
    res.json(destinos);
  });
  app.listen(port, ()=>{
      console.log('Servidor Iniciado com Sucesso')
  } )