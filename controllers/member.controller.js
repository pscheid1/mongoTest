const Member = require('../models/member.model');

var parseQueryString = function (queryString) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};

exports.index = function(req, res) {
    res.send('Error: We should never get to this function. - "member.controller.index"')
    return;
}

//Simple version, without validation or sanitation
exports.test = function (req, res) {

    // res.send('Greetings from the member controller!');
    // res.sendFile(__dirname + '/index.html');
    res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
};

exports.update = function (req, res) {

    var index = req.url.indexOf('?');
    if (index < 0) {
        res.send("Error: No query string found.");
    }

    var params = parseQueryString(req.url.substr(index + 1));


    Member.findOne({ 'userId': params.id}, function (err, doc) {
        if (doc === null) // userId does not exist
        {
            res.send("Error: UserId: " + params.id + " does not exist.");
        }
        else 
        {
            if (params.fname) {doc.firstName = params.fname;}
            // because middleName is optional we need to add a way to delete it.
            if (params.mname) {doc.middleName = params.mname;}
            if (params.lname) {doc.lastName = params.lname;}
            if (params.email) {doc.eMail = params.email;}            
            doc.save(function (err) {
                if (err) {
                    var indx = err.toString().indexOf('.');
                    res.send(err.toString().substring(0, indx + 1));
                }
                else {
                    res.send(doc + ": updated.");
                }
            });
        }
    });
};

exports.create = function (req, res, next) {

    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }

    var params = parseQueryString(req.url.substr(index + 1));

    let member = new Member(
        {
            "userId": params.id,
            "firstName": params.fname,
            "middleName": params.mname,
            "lastName": params.lname,
            "eMail": params.email
        }
    );

    Member.findOne({ 'userId': member.userId }, function (err, doc) {
        if (doc === null) // userId does not exist
        {
            member.save(function (err) {
                if (err) {
                    var indx = err.toString().indexOf('.');
                    res.send(err.toString().substring(0, indx + 1));
                }
                else {
                    res.send(member + ": created.");
                }
            });
        }
        else // userId already exists
        {
            res.send("Error: " + member + ": userId must be unique and already exists.");
        }
    });

};


exports.find = function (req, res, next) {
    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }
    var params = parseQueryString(req.url.substr(index + 1));

    Member.findOne({ 'userId': params.id }, function (err, doc) {
        if (doc !== null) {
            res.send(doc);
        }
        else // userId does not exists
        {
            res.send("Error: UserId: " + params.id + " does not exist.");
        }
    });
};

exports.list = function (req, res, next) {
    Member.find({}, 'userId firstName middleName lastName eMail', function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(docs);
        }
    });
};

exports.delete = function (req, res, next) {
    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }
    var params = parseQueryString(req.url.substr(index + 1));

    Member.findOne({ 'userId': params.id }, function (err, doc) {
        if (doc !== null) {
            doc.remove();
            res.send(doc + ": removed.");
        }
        else // userId does not exists
        {
            res.send("Error: UserId: " + params.id + " does not exist.");
        }
    });
};
