import Replicate from 'replicate'
import express, { json } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

const app = express()

dotenv.config()

app.use(cors())
app.use(json())

app.post('/api/apply-filter', async (req, res) => {
  try {
    if (!req.body.imageURL) {
      return res.status(500).send({
        code: 500,
        message: 'Imagem não encontrada',
        data: null
      })
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })

    const output = await replicate.run('fofr/face-to-many:35cea9c3164d9fb7fbd48b51503eabdb39c9d04fdaef9a68f368bed8087ec5f9', {
      input: {
        image: req.body.imageURL,
        style: 'Video game',
        prompt: 'pixelated glitchart of close-up of (subject), ps1 playstation ps gamecube game radioctive dreams screencapture, bryce 3d',
        prompt_strength: 4.5,
        denoising_strength: 0.65,
        instant_id_strength: 0.8
      }
    })

    if (!output) {
      return res.status(500).send({
        code: 500,
        message: 'Erro ao gerar imagem',
        data: null
      })
    }

    res.send({
      code: 200,
      message: 'Filtro aplicado com sucesso!',
      data: {
        outputImage: output[0]
      }
    })
  } catch (err) {
    console.log(err)

    res.status(500).send({
      code: 500,
      message: 'Erro interno de servidor',
      data: null
    })
  }
})

app.listen(3000)