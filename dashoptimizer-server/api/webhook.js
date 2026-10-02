const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ⚠️ EDITE ESSAS LINHAS
const KIWIFY_WEBHOOK_TOKEN = '9he9cwlhw5v';
const HMAC_SECRET = 'Cyclon4d0FPS_DashOptimizer_MasterKey_2025_x9KpL2mN7qR4vB8wE6zY1uI5tG0cF3hD';
const EMAIL_USER = 'cyclonadofps@gmail.com';
const EMAIL_PASS = 'gdpzpmsdtwnaoram';
const EMAIL_FROM = 'DashOptimizer <cyclonadofps@gmail.com>';
const DOWNLOAD_URL = 'https://drive.usercontent.google.com/download?id=1sYIeokrHiAQu6lpV-cbzR8wupOqLxN8z&export=download&authuser=0';

function gerarKey() {
    const parteAleatoria = crypto.randomBytes(4).toString('hex').toUpperCase();
    const assinatura = crypto.createHmac('sha256', HMAC_SECRET)
        .update(parteAleatoria)
        .digest('hex')
        .substring(0, 8)
        .toUpperCase();
    return `DASH-${parteAleatoria.substring(0,4)}-${parteAleatoria.substring(4,8)}-${assinatura.substring(0,4)}-${assinatura.substring(4,8)}`;
}

async function enviarEmail(destinatario, nome, key) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: destinatario,
        subject: '🎉 Sua chave de ativação do DashOptimizer',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111;">Olá, ${nome}!</h2>
                <p>Obrigado por comprar o <b>DashOptimizer</b>.</p>
                <p>Sua chave de ativação é:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <code style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #111;">${key}</code>
                </div>
                <p><b>Como ativar:</b></p>
                <ol>
                    <li>Baixe o DashOptimizer no link abaixo</li>
                    <li>Abra o app</li>
                    <li>Cole a chave quando for solicitado</li>
                </ol>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${DOWNLOAD_URL}" style="background: #111; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Baixar DashOptimizer</a>
                </p>
                <p style="font-size: 12px; color: #888;">Se você formatar o PC, entre em contato para receber uma nova chave.</p>
            </div>
        `
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const body = req.body;
        const token = req.headers['x-kiwify-token'] || req.query.token;
        if (token !== KIWIFY_WEBHOOK_TOKEN) return res.status(401).json({ error: 'Invalid token' });

        const email = body?.Customer?.email;
        const nome = body?.Customer?.full_name || 'Cliente';
        const status = body?.order_status || body?.status;

        if (status !== 'paid' && status !== 'approved') return res.status(200).json({ ignored: true, status });
        if (!email) return res.status(400).json({ error: 'Email não encontrado' });

        const key = gerarKey();
        await enviarEmail(email, nome, key);

        console.log(`[OK] Chave gerada para ${email}: ${key}`);
        return res.status(200).json({ success: true, email });
    } catch (e) {
        console.error('[ERRO]', e);
        return res.status(500).json({ error: e.message });
    }
};
