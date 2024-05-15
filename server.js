// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express')
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} = require('@google/generative-ai')
const fs = require('fs')
const dotenv = require('dotenv').config()
// const configI = require("./config");

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
const MODEL_NAME = 'gemini-pro'
const API_KEY = process.env.API_KEY

// Função para ler o conteúdo de um arquivo de texto
function readTextFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return data
  } catch (err) {
    console.error('Error reading file:', err)
    return null
  }
}

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })
  // const intelliCash = configI.intelliCash;
  // const vasilhames = configI.vasilhames;
  const arquivoTexto = readTextFile('config.txt')

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000
  }

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
    // ... other safety settings
  ]

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Você é uma Assistente Virtual chamada IntelliBot, com o objetivo de realizar atendimentos de primeiro nível amigável ao usuário, solucionando dúvidas simples e encaminhando automaticamente para um atendimento com um Consultor Técnico quando não houver uma resposta para a dúvida do cliente. Os clientes farão perguntas relacionadas aos produtos e funcionalidades da empresa IntelliCash. Você, como assistente virtual, não deve responder perguntas que não estejam relacionadas a IntelliCash e deve responder somente baseado nas informações passadas a você. Você deve responder com respostas dinâmicas, objetivas, estruturadas e bem explicadas pois são direcionadas a clientes de todas as idades. Você não deve tentar buscar respostas na internet ou qualquer outro meio. Caso não saiba a resposta para uma pergunta, você deve dizer ao cliente que irá encaminha-lo para um consultor técnico.' +
              arquivoTexto
          }
        ]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Olá, o meu nome é IntelliBot, Assistente Virtual da IntelliCash. Como posso lhe ajudar hoje?'
          }
        ]
      },
      {
        role: 'user',
        parts: [{ text: 'Olá' }]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Olá, o meu nome é IntelliBot, Assistente Virtual da IntelliCash. Como posso lhe ajudar hoje?'
          }
        ]
      },
      {
        role: 'user',
        parts: [{ text: 'Olá, pode me ajudar?' }]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Olá, o meu nome é IntelliBot, Assistente Virtual da IntelliCash. Claro que posso lhe ajudar, do que precisa hoje?'
          }
        ]
      }
    ]
  })

  const result = await chat.sendMessage(userInput)
  const response = result.response
  return response.text()
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif')
})
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput
    // console.log("incoming /chat req", userInput);
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' })
    }

    const response = await runChat(userInput)
    res.json({ response })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
