$.getJSON("http://wiki.techatnyu.org/api.php?action=query&meta=userinfo&format=json")
    .done(function(userStatus) {
        if (!userStatus.error) return;
        $.getJSON("https://api.tnyu.org/v2/people/me")
            .done(function(user) {
                if (user.data.roles.length != 0) {
                    var userName = user.data.name.replace(/\s/g, '');
                    var userPass = sha1(sha1(sha1(user.data.id), sha1(user.data.facebookId)), sha1(user.data.created));
                    wiki_auth(userName, userPass, "/");
                }
            });
    });