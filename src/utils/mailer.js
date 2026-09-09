const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure:
        process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

const sendPasswordResetEmail = async ({
    to,
    name,
    resetUrl,
}) => {
    await transporter.sendMail({
        from: `"SIMRS" <${process.env.MAIL_USER}>`,
        to,
        subject: "Reset Password SIMRS",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reset Password SIMRS</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f7fb;
                font-family: Arial, sans-serif;
            ">

                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                ">

                    <div style="
                        background: #1976d2;
                        padding: 30px;
                        text-align: center;
                        color: white;
                    ">
                        <h1 style="
                            margin: 0;
                            font-size: 28px;
                        ">
                            SIMRS
                        </h1>

                        <p style="
                            margin: 8px 0 0;
                            font-size: 14px;
                        ">
                            Sistem Informasi Manajemen Rumah Sakit
                        </p>
                    </div>

                    <div style="
                        padding: 35px;
                        color: #333333;
                    ">

                        <h2>
                            Reset Password
                        </h2>

                        <p>
                            Halo ${name || "User"},
                        </p>

                        <p>
                            Kami menerima permintaan untuk
                            mereset password akun SIMRS kamu.
                        </p>

                        <p>
                            Klik tombol di bawah ini untuk
                            membuat password baru:
                        </p>

                        <div style="
                            text-align: center;
                            margin: 30px 0;
                        ">

                            <a
                                href="${resetUrl}"
                                style="
                                    display: inline-block;
                                    padding: 14px 28px;
                                    background-color: #1976d2;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                "
                            >
                                Reset Password
                            </a>

                        </div>

                        <p style="
                            font-size: 14px;
                            color: #666666;
                        ">
                            Link reset password ini hanya berlaku
                            selama <strong>15 menit</strong>.
                        </p>

                        <p style="
                            font-size: 14px;
                            color: #666666;
                        ">
                            Jika kamu tidak meminta reset password,
                            abaikan email ini.
                        </p>

                        <hr style="
                            border: 0;
                            border-top: 1px solid #eeeeee;
                            margin: 30px 0;
                        ">

                        <p style="
                            font-size: 12px;
                            color: #999999;
                        ">
                            Jika tombol tidak dapat digunakan, silakan klik
                            <a
                                href="${resetUrl}"
                                style="
                                    color: #1976d2;
                                    font-weight: bold;
                                    text-decoration: none;
                                "
                            >
                                Reset Password
                            </a>.
                        </p>

                    </div>

                    <div style="
                        padding: 20px;
                        background: #f8f9fa;
                        text-align: center;
                        font-size: 12px;
                        color: #999999;
                    ">
                        © SIMRS
                    </div>

                </div>

            </body>
            </html>
        `,
    });
};

module.exports = {
    sendPasswordResetEmail,
};