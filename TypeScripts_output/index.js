import express from "express";
import path from "path";
import SendGridMail from "@sendgrid/mail";
import fs from "fs";
import cors from "cors";
const __dirname = path.resolve(path.dirname(""));
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("folder"));
app.use(express.json());
const port = 8080;
const SGK = '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';
SendGridMail.setApiKey(SGK);
SendGridMail.setSubstitutionWrappers("{", "}");
app.get("/", (req, res, next) => {
    res.send(SGK);
});
const Result = {
    status: 200,
    message: "Done,there is list of all emails sent and rejected",
    data: {
        success: [],
        failure: [],
    },
};
const data_passing = (body) => {
    let Emails = [];
    let text = body.emailMessage;
    let attachments = body.attachments.map((value) => {
        const fileBuffer = fs.readFileSync(__dirname + value.path.replace(/__dirname|'|"|\+/g, ""), "base64");
        return { content: fileBuffer, filename: value.filename };
    });
    let personalizations = [];
    body.userData.map((userInstances) => {
        if (userInstances.email in Emails) {
        }
        else {
            Emails.push(userInstances.email);
        }
        let tmp = {
            to: "nikhilmaurya5618056@gmail.com",
            [userInstances.type]: { email: userInstances.email },
            substitutions: {},
        };
        for (let i in userInstances) {
            if (i !== "email" && i !== "type") {
                tmp.substitutions[i] = userInstances[i];
            }
        }
        personalizations.push(tmp);
    });
    let msg = {
        to: "nikhilmaurya5618056@gmail.com",
        from: "nikhilmaurya5618056@gmail.com",
        subject: "GlobalShala Backend Task",
        html: text,
        personalizations: personalizations,
        attachments: attachments,
    };
    SendGridMail.sendMultiple(msg);
    return Emails;
};

app.post("/", (req, res, next) => {
    let Emails = data_passing(req.body);
    res.message.data.success=Emails;
    res.send(Result)
});
app.listen(process.env.PORT || port, () => {
    console.log(`SendGrid app running at this surver>> http://localhost:${port}`);
});
