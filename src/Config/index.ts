import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.join(process.cwd(),'.env')
})

const confiq={
    port: process.env.PORT
}

export default confiq;