/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Madhukar Moogala
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

"use strict";
const config = require('./server/config')
    , express = require('express')
    , multer = require('multer')
    , multerS3 = require('multer-s3')
    , bodyParser = require('body-parser')
    , favicon = require('serve-favicon') //is this req?
    , aws = require('aws-sdk')
    , forgeSdk = require('forge-apis');



/**
 * Update AWS credentials
 */
aws.config.update({
    region: config.credentials.aws_defaultregion,
    credentials: {
        accessKeyId: config.credentials.aws_accesskey,
        secretAccessKey: config.credentials.aws_secretkey
    }
});
/**
 * init S3
 */
var s3 = new aws.S3();

/**
 * Init Forge client
 * 
 */
var autoRefresh = true; // or false
var oAuth2TwoLegged = new forgeSdk.AuthClientTwoLegged(config.credentials.client_id, config.credentials.client_secret, config.scopeInternal, autoRefresh);
var workItemsApi = new forgeSdk.WorkItemsApi;
var activitiesApi = new forgeSdk.ActivitiesApi;

//global store to hold AWS dwg url
const dwgFiles = {
    dwg1: "",
    dwg2: ""
}
 global.objectKeys = [];

/**
 * Init Express Middleware
 */
const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

/**
 * Routing server pages
 */
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/www', { 'cacheControl': true }));
app.use(favicon(__dirname + '/www/images/favicon.ico'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/www/index.html');
});

/**
 * Upload user files to S3 Bucket
 */
const uploadToAws = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: config.credentials.aws_bucketname,
        key: function (req, file, cb) {
            console.log(file);
            //replace any special character with empty char
            var validObjKey = file.originalname.replace(/[^0-9a-zA-Z.]+/g, "");
            global.objectKeys.push(validObjKey);
            cb(null, validObjKey); //use Date.now() for unique file keys
        }

    })
});

/**
 * Start
 */
//Heroku process bind to $PORT
var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Forge Drawing App listening on port 3000!');
});


/**
 * Process Form Upload request
 */
app.post('/upload', uploadToAws.array('upl1', 2), (req, res, next) => {
    res.on('finish', () => {
        console.log('response sent');
    })
    if (typeof req.files !== 'undefined' && req.files.length > 0) {
        dwgFiles.dwg1 = req.files[0].location;
        dwgFiles.dwg2 = req.files[1].location;
        res.render('index', dwgFiles);
    }
    next();
});

/**
 * Process Forge Design Automation
 */
app.post('/creatWorkItem', function (req, res) {
    oAuth2TwoLegged.authenticate()
        .then(function (credentials) {
            submitWorkItem(dwgFiles, oAuth2TwoLegged, credentials)
                .then(function (workItemResp) {
                    console.log("*** workitem post response:", workItemResp.body);
                    var workItemId = workItemResp.body.Id;
                    res.json({ success: true, message: 'Submitted WorkItem Successfully!', workItemId: workItemId });
                })
                .catch(function (error) {
                    console.error(error);
                    res.json({ success: false, message: 'Submitted WorkItem Failed!' });
                    res.status(500).end();
                });
        })
        .catch(function (error) {
            console.error(error);
            res.status(500).end();
        });
});


app.get('/getWorkItemStatus', function (req, res, next) {
    if (!req.query.workItemId) {
        res.json({ success: false, message: 'Could not find workItemId' });
        res.status(500).end();
    }
    else {
        let workItemId = req.query.workItemId;
        getWorkItemStatus(workItemId, oAuth2TwoLegged.getCredentials(), function (status, workitemResult) {
            var report = "";
            if (status) {
                // Process the output from the workitem on success
                var output = workitemResult.Arguments.OutputArguments[0].Resource;
                console.log("Process the output from the workitem on success\n");
                console.log(output + "\n");
                console.log("Display the workitem repory \n");
                report = workitemResult.StatusDetails.Report;
                console.log(report);
            } else {
                console.log(" On error, display the workitem report if available");
                report = workitemResult.StatusDetails.Report;
                if (workitemResult && report) {
                    console.log("Error processing the workitem");
                    console.log(report);
                }
                console.log(report);
            }
            console.log(report);
            //We need to flush the S3 input drawings.
            var params = {
                Bucket: config.credentials.aws_bucketname,
                Delete: {
                    Objects: [
                        {
                            Key: global.objectKeys[0]
                        },
                        {
                            Key: global.objectKeys[1]
                        }
                    ],
                    Quiet: false
                }
            };
            s3.deleteObjects(params, function (err, data) {
                if (err) console.log(err, err.stack);
                else console.log(data);
            })
            res.json({ success: true, report: output });
        });
    }
});
// The function polls the workitem status, in a while loop, 
// the loop breaks on success or error. 
//
var asyncLoop = function (o) {
    var loop = function () {
        o.functionToInvoke(loop);
    }
    loop();
}
function getWorkItemStatus(workitemId, credentials, callback) {
    var request = require("request");
    var workitemstatusurl = "https://developer.api.autodesk.com//autocad.io/us-east/v2/WorkItems";
    var _url = workitemstatusurl + "(%27" + workitemId + "%27)";//make private
    let bearerAccessToken = credentials;
    bearerAccessToken = bearerAccessToken.token_type + " " + bearerAccessToken.access_token;
    var options = {
        method: 'GET',
        url: _url,
        headers:
        {
        'content-type': 'application/json',
         authorization: bearerAccessToken
        }
    };
    asyncLoop({
        functionToInvoke: function (loop) {
            setTimeout(function () {
                request(options, function (error, response, body) {
                    var result = JSON.parse(body);
                    if (response && response.statusCode) {
                        if (result && (result.Status === "Pending" || result.Status === "InProgress")) {
                            // continue if the status is Pending or InProgress
                            loop();
                        } else if (result && result.Status === "Succeeded") {
                            callback(true, result);
                        }
                        else {
                            console.log("It is not pending\\inprogres\\succeeded\n");
                            console.log(result.Status + "\n" + result);
                            callback(false, result);
                        }
                    } else {
                        callback(false, result);
                    }
                });
            }, 2000);
        }
    });
}

/**
 * creates the Activity
 */
function createOrUpdateActivity(oauthClient, credentials) {
    console.log("*****Creating Activity***")
    let bearerAccessToken = credentials;
    bearerAccessToken = bearerAccessToken.token_type + " " + bearerAccessToken.access_token;
    var createActivityJson = {
        "HostApplication": "",
        "RequiredEngineVersion": "23.0",
        "Parameters": {
            "InputParameters": [
                {
                    "Name": "HostDwg",
                    "LocalFileName": "$(HostDwg)"
                },
                {
                    "Name": "ToCompareWith",
                    "LocalFileName": "ToCompareWith.dwg"
                }
            ],
            "OutputParameters": [
                {
                    "Name": "Result",
                    "LocalFileName": "output.dwg"
                }
            ]
        },
        "Instruction": {
            "CommandLineParameters": null,
            "Script": "COMPAREINPLACE\nON\n-COMPARE\n\nToCompareWith.dwg\n_SAVEAS\n\noutput.dwg\n"
        },
        "Id": "FPDCompare"
    }
    return activitiesApi.createActivity(createActivityJson, oauthClient, credentials);
}

/**
 * creates  the workItem from download url supplied by OSS.
 * Uses the oAuth2ThreeLegged object that you retrieved previously.
 * @param ossUrl
 * @param oauthClient
 * @param credentials
 * @returns {}
 */
function submitWorkItem(awsUrls, oauthClient, credentials) {

    console.log("*****Posting Workitem\n*********");
    let bearerAccessToken = credentials;
    bearerAccessToken = bearerAccessToken.token_type + " " + bearerAccessToken.access_token;
    var workItemJson = {
        "Arguments": {
            "InputArguments": [
                {
                    "Resource": awsUrls.dwg1,
                    "Name": "HostDwg"
                },
                {
                    "Resource": awsUrls.dwg2,
                    "Name": "ToCompareWith"
                }
            ],
            "OutputArguments": [
                {
                    "Name": "Result",
                    "HttpVerb": "POST"
                }
            ]
        },
        "ActivityId": "FPDCompare"
    };

    return workItemsApi.createWorkItem(workItemJson, oauthClient, credentials);
}















