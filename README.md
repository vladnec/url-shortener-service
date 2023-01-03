# Serverless URL shortener
URL shortener utility service built with AWS Serverless Technologies.</br>
## Prerequisites
<ul>
    <li><a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">npm</a></li>
    <li><a href="https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html">Pre configured AWS credentials</a></li>
    <li><a href="https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html">cdk</a></li>
    <li><a href="https://docs.docker.com/get-docker/">Docker</a></li>
    <li><a href="https://jwt.io/">Generate JWT token.</a></li>
    <li><a href="https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html">Store JWT Token secret key in AWS Secrets Manager. </a></li>
    <li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-configuring.html">A Route 53 Public Hosted Zone configured to a DNS</a></li>
    Note: Application can be deployed without a Public Hosted Zone and Custom Domain name as well.
</ul>

## Local development
To install the application: </br>
`npm install`

To generate Cloudformation Template: </br>
`cdk synth`

### Test
For running the test suite, use the following command. </br>
`npm run test`
</br>

You can request a coverage report by running the following command: </br>
`npm run test:coverage`

### Code linting
To check the code and styles quality, use the following command: </br>
``npm run lint``
</br>

To fix the linting errors, use the following command: </br>
`npm run lint:fix`

## Configure Environment Variables
Copy `.env.example` file to `.env` using command: </br>
`cp .env.example .env`
</br>
Now, make sure to set the following env variable in the `.env`.

| Key             |                    Value                    |                                                                                                                                                       Description |
|-----------------|:-------------------------------------------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| JWT_SECRET_NAME |            TOKEN_PARAMETER_NAME             |                                                            The AWS Secrets Manager's secret name to securely retrieve your JWT Secret for JWT token verification. |
| CDK_ACCOUNT     |                112870189231                 |                                                                                                                                                   AWS Account ID. |
| CDK_REGION      |                eu-central-1                 |                                                                                                                        AWS Region where stack should be deployed. |
| ALLOWED_ORIGINS | 'http://localhost:8080, https://google.com' |                                                                                             String of all URL allowed to access the application, delimited by `,` |
| DOMAIN_NAME     |                'example.com'                | Custom Domain Name used by API Gateway. If not filled in, the resources necessary for custom domain won't be created and AWS APIGateway default URL will be used. |


## Deployment
The application is automatically deployed to AWS using Github Actions.</br>
The configuration for the deployment pipeline can be found in `.github/workflows/deploy.yml`.

## Project description

The project consists of 2 public and 1 internal Lambda function. </br>

First Lambda, `registerShortLink` is exposed to POST endpoint `/short-link` and is responsible for generating short URLs and storing a short url/long url pair in DynamoDB Table. </br>
The Lambda is protected by a custom Lambda Authorizer which checks if the caller is authorized to invoke the `registerShortLink` Lambda based on the passed Authentification Header (JWT Token).
</br>
</br>
Second Lambda, `resolveShortLink` is exposed to GET endpoint `/{id}` and is responsible to redirect the caller to the long-url based on the short ID passed in the path.

## Live Example
### Register Short URL
First, use the terminal to run the following command to invoke the API without any JWT Token: </br>


``` 
curl -X POST https://<API-ID>.execute-api.eu-central-1.amazonaws.com/short-link -H "Content-Type: application/json" -d '{"url": "https://github.com/vladnec/" }'
```

You should get the following error message: </br>
`{"message":"Unauthorized"}` </br>

Let's try once again, this time including the Authorization header in our request together with the JWT token.
``` 
curl --location --request POST 'https://<API-ID>.execute-api.eu-central-1.amazonaws.com/short-link' \
--header 'Authorization: Bearer <YOUR.ACCESS>TOKEN>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "url": "https://github.com/vladnec/"
}'
``` 
You should get the following message: </br>
`{"short-url":"O4fSppvu"}`

### Resolve Short URL

Use the terminal to run the following comamnd to invoke the GET API: </br>
`curl https://<API-ID>.execute-api.eu-central-1.amazonaws.com/O4fSppvu`
</br>
You should get the following message: </br>
`Redirect successfully`







