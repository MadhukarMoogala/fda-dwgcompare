'use strict'; // http://www.w3schools.com/js/js_strict.asp

module.exports = {
    callbackURL : process.env.FORGE_CALLBACK_URL || 'http://localhost:3000/api/forge/callback/oauth',
    credentials : {
        client_id: process.env.FORGE_CLIENT_ID || '',
        client_secret: process.env.FORGE_CLIENT_SECRET || '',
        aws_bucketname: 'fpd-uploads',
        aws_accesskey: process.env.AWS_ACCESS_KEY_ID || '',
        aws_secretkey: process.env.AWS_SECRET_ACCESS_KEY || '',
        aws_defaultregion: process.env.AWS_DEFAULT_REGION || '',
        aws_profile: process.env.AWS_PROFILE || ''
    },
    scopeInternal :['data:create', 'data:write', 'data:read', 'bucket:read', 'bucket:update', 'bucket:create', 'code:all'],
    scopePublic : ['viewables:read']
};

