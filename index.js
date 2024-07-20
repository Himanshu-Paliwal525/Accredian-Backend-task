const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("This is backend for accredian-backend-task!!");
});

app.post("/referrals", async (req, res) => {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const referral = await prisma.referral.create({
            data: { referrerName, referrerEmail, refereeName, refereeEmail },
        });

        // Send referral email
        await sendReferralEmail(
            referrerName,
            referrerEmail,
            refereeName,
            refereeEmail
        );

        res.status(201).json(referral);
    } catch (error) {
        res.status(500).json({ error: "Error creating referral" });
    }
});

const sendReferralEmail = async (
    referrerName,
    referrerEmail,
    refereeName,
    refereeEmail
) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "your-email@gmail.com",
            pass: "your-password",
        },
    });

    const mailOptions = {
        from: "your-email@gmail.com",
        to: refereeEmail,
        subject: "You have been referred!",
        text: `${referrerName} has referred you to our course. Contact them at ${referrerEmail} for more details.`,
    };
    console.log(mailOptions);
    await transporter.sendMail(mailOptions);
};

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
