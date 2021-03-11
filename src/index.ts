// 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
import express from "express";
import path from "path";
import SgMail, { setSubstitutionWrappers } from "@sendgrid/mail";
import SgClient from "@sendgrid/client";
import fs from "fs";
import cors from "cors";
const __dirname = path.resolve(path.dirname(""));
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("folder"));
app.use(express.json());
const port = 3007;
const sendGridKey = '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';
SgMail.setApiKey(sendGridKey);
SgClient.setApiKey(sendGridKey);
SgMail.setSubstitutionWrappers("{", "}");



app.get("/", (req, res, next) => {
  res.send(sendGridKey);
});

const ResponseMessage: any = {
  status: 200,
  message: "WARNING: Since SendGrid's API is Asynchronus in nature, so list of \
  success and failure emails may not be accurate",
  data: {
    success: [],
    failure: [],
  },
};
const parseRawData = (body: any) => {
  let Emails:any = []
  let htmlContent = body.emailMessage;
  let attachments = body.attachments.map((value: any) => {
    const fileBuffer = fs.readFileSync(__dirname+value.path.replace(/__dirname|'|"|\+/g,""), "base64");
    return { content: fileBuffer, filename: value.filename };
  });
  let personalizations: any = [];
  body.userData.map((userInstances: any) => {
    if (userInstances.email in Emails){
      
    }
    else{
      Emails.push(userInstances.email);
    }
    let tmp: any = {
      to: "default@default.com",
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
  let msg: any = {
    to: "nikhilmaurya5618056@gmail.com",
    from: "nikhilmaurya5618056@gmail.com",
    subject: "GlobalShala Backend Task",
    html: htmlContent,
    personalizations: personalizations,
    attachments: attachments,
  };
  SendMessages(msg);
  return Emails
};
const SendMessages = (msg: any) => {
  SgMail.sendMultiple(msg)
    .then(([res, body]) => {
      console.log(res);
    })
    .catch((err: any) => {
      console.log(err.message);
    });
};

const RetriveInvalidEmails = (res: any,Emails:any) => {
  const queryParams = {
    start_time: 1,
  };
  const request: any = {};
  request.qs = queryParams;
  request.method = "GET";
  request.url = "/v3/suppression/bounces";
  const reqDelete: any = {
    body: { delete_all: true },
    method: "DELETE",
    url: request.url,
  };
  SgClient.request(request)
    .then(([req, body]) => {
      console.log(body);
      body.map((element:any) => {
        console.log(element.email,Emails)
        const x =Emails.findIndex((y:any)=>{return y==element.email});
        console.log(x)
        Emails.splice(x,1);
        
      });
      ResponseMessage.data.success = Emails;
      ResponseMessage.data.failure =body
      res.send(ResponseMessage);
      SgClient.request(reqDelete);
    })
    .catch((err) => {
      console.log(err.message);
    });
};
app.post("/", (req, res, next) => {
  let Emails = parseRawData(req.body);
  RetriveInvalidEmails(res,Emails);
});

app.listen(process.env.PORT || port, () => {
  console.log(`SendGrid app listening at http://localhost:${port}`);
});

