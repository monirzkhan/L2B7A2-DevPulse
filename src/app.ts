import express, { type Application, type Request, type Response } from 'express'
import cors from 'cors'
import { userRoute } from './modules/user/user.route';
import { authRoute } from './modules/auth/auth.route';
import { issueRoute } from './modules/issue/issue.route';


const app: Application = express();

app.use(express.json())
app.use(cors())

app.use('/api/auth/signup',userRoute)
app.use('/api/auth/login',authRoute)
app.use('/api/issues', issueRoute)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        name: "Welcome to DevPulse v-2",
        email: "devpulse@gmail.com",
        author: "Md Moniruzzaman"
    })

})

export default app;