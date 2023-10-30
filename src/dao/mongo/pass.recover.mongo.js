import env from '../../config/config.js'
import { default as token } from 'jsonwebtoken';
import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport(env.mailing);

export class pass_recover_mongo{
    async sendEmail(email){
        const jwt = this.createJwt(email)
        try {
            transport.sendMail({
                from: `Coder test <${env.mailing.auth.user}>`,
                to: email,
                subject: 'Reestablecer Contraseña',
                html: ` <h1>Para reestablecer tu contraseña haz click en "Reestablecer Contraseña"</h1>
                        <hr>
                        <button><a href="http://${env.baseUrl}:${env.PORT}/password_recover/${jwt}">Reestablecer Contraseña</button>`,
            });
        } catch (error) {
            res.json({error: error})
        }
    }

    createJwt(email){
        return token.sign({ email }, env.PRIVATE_KEY, { expiresIn: '1h' })
    }
}