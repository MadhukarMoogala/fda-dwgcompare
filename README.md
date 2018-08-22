# Workflow Sample for Comparing AutoCAD Drawing with Forge Design Automation

[![Node.js](https://img.shields.io/badge/Node.js-8.9-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-5.5.1-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)
[![OAuth2](https://img.shields.io/badge/OAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Design-Automation](https://img.shields.io/badge/DesignAutomation-v2-brightgreen.svg)](https://developer.autodesk.com/en/docs/design-automation/v2/overview/)

# Description
This sample use AWS S3 to store uploaded client AutoCAD drawing files from local file disk, and initiates Forge Design Automation process `Compare` function, results out the AutoCAD drawing with visual differences back to client.

## Working GIF
![](https://images2.imgbox.com/92/0a/aQLJ38WL_o.gif)
## Live 
see it live [Forge DWG Compare](https://fdadwgcompare.herokuapp.com/)
## Setup
In order to use this sample you need Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). Finally take note of the `Client ID` and `Client Secret`.
## Run Locally

Install [NodeJS](https://nodejs.org/).

Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

```
git clone https://github.com/MadhukarMoogala/fda-dwgcompare.git
```

To run it, install the required packages, set the environment variables with your `Client ID`and `Client Secret`, you need AWS `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, please refer [Getting Started AWS](https://aws.amazon.com/getting-started/?nc2=h_ql_gs&awsm=ql-4) and [Configuring AWS](https://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:


Mac OSX/Linux (Terminal)

```bash
npm install
export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM FORGE DEVELOPER PORTAL>>
export FORGE_CLIENT_SECRET=<<YOUR FORGE CLIENT SECRET>>
export AWS_ACCESS_KEY_ID=<<YOUR AWS ACCESS KEY>>
export AWS_SECRET_ACCESS_KEY=<<YOUR AWS ACCESS SECRET>>
export AWS_DEFAULT_REGION=<<YOUR AWS REGION>>
export AWS_PROFILE=<<YOU AWS PROFILE>>
nodemon app
```

Windows (use `Node.js command line` from Start menu)
```bash
npm install
set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM FORGE DEVELOPER PORTAL>>
set FORGE_CLIENT_SECRET=<<YOUR FORGE CLIENT SECRET>>
set AWS_ACCESS_KEY_ID=<<YOUR AWS ACCESS KEY>>
set AWS_SECRET_ACCESS_KEY=<<YOUR AWS ACCESS SECRET>>
set AWS_DEFAULT_REGION=<<YOUR AWS REGION>>
set AWS_PROFILE=<<YOU AWS PROFILE>>
nodemon app
```

Open the browser: [http://localhost:3000](http://localhost:3000).

## Debuging
**Create Launch.json**
```
{   
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "envFile": "${workspaceFolder}/server/SET.env",            
            "program": "${workspaceFolder}/app.js"
        }
    ]
}
```
**Create a .env file**
```
 #FORGE
 FORGE_CLIENT_ID=putyourclientid
 FORGE_CLIENT_SECRET=putyoursecret
 #AWS
 AWS_ACCESS_KEY_ID=putyourawskeyid
 AWS_SECRET_ACCESS_KEY=putyourawsaccesskey
 AWS_DEFAULT_REGION=us-west-2
 AWS_PROFILE=madhukar
```
Deploy on Heroku
To deploy this application to Heroku, After clicking on the button below, at the Heroku Create New App page, set your 
			   `FORGE_CLIENT_ID`,
			   `FORGE_CLIENT_SECRET`,
			   `AWS_ACCESS_KEY_ID`,
			   `AWS_DEFAULT_REGION`,
			   `AWS_PROFILE`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/MadhukarMoogala/fda-dwgcompare.git)

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.

## Written by

Madhukar Moogala (Forge Partner Development)
http://forge.autodesk.com












