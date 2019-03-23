# tssg-mongoTest

    The tssg htmlImport project (see below) is being used as a base web site to study Node and MongoDB implementations.  We are looking into adding node based javascript to add the following features:

            - automated scheduling
            - user testimonials
            - TSSG member database
            - Authentication / administration capabilites

    Testing is going to requre some setup.  Currently I'm not including the node_modules folder in the remote repository.  That might me a dumb idea and I may change that at a later date.  Currently there are 3 or 4 thousand files in that folder and that is why I have the folder in the .gitignore file.  

    Currently I'm using an Apache server to serve up the front end stuff. I have it configured as a proxy server for a node server.  Currently the Apache server will proxy anything formatted as <domain>/schedule/ or <domain>/member to the node server.  Anything else will be served by the Apache server.  Currently the node server is configured to default to port 7010.  The default port is created in the app.js file and can be modified if desired.  The default port can be overridden at execution by including a -p <port #> --port <port #> on the app.js execution command line. If you use a different port, make sure it agrees with your settings in the Apache httpd.conf file or the configuration file for whatever server you are using.

### Apache httpd.conf file:

    ProxyRequests on
    ProxyPass "/xxx" "http://localhost:7010/xxx/"
    ProxyPassReverse "/xxx" "http://localhost:7010/xxx/"

    #ProxyPass "/schedules" "http://localhost:7010/schedules/"
    #ProxyPassReverse "schedules" "http://localhost:7010/schedules/"
    #ProxyPass "/members" "http://localhost:7010/members/"

    # The node server will force the following to d://tssg/mongoTest/public
    # We'll let the node server do this for it's own port.  ProxyPass action occurs
    # regardlass of input port.

    #ProxyPass "/" "http://localhost:7010/"
    #ProxyPassReverse "/" "http://localhost:7010/"

    #<VirtualHost *:7010>
    #	DocumentRoot "d:/tssg/mongoTest/"
    #	<Directory "d:/tssg/mongoTest/">
    #		AllowOverride None
    #		AllowOverrideList None
    #	</Directory>
    #</VirtualHost>

    Notice that everything is commented out except for the three Proxy... statements.

### app.js declarations:

    app.use('/members', member);
    app.use('/schedules', schedule);

## Node requirements:

    Install npm and node
    Install express
    Install mongoDB
    Install mongoose

    It's not a requirement but you probably want to install the above packages globally.
    Also not a requirement but you probably want to install the following packages locally.

    Install optimist I may replace this with minimist but not necessary at this point.
    I'm sure there are other packages.  I add them as I remember them.  (Good luck with that).
    If you stumble over any I have missed, install them and add them to the above list.

### <span style="color:yellow">Additional documentation will follow as development progresses.</span>

# tssg-htmlImport
(You don't need to pull this in from the tssg-htmlImport project.  It is already emSbedded in this project.)
## &nbsp;&nbsp;&nbsp;&nbsp;Home page is accessed via index.html

        Specific pages may be directly called by adding a hash value to the URL :
            <url>/#name where page name is one of the following :

              - web-group
              - mobile-group
              - quality-group
              - data-group
              - devops-group
              - calendar-page
              - home-page (home page is the default for no href parameter)

            example: domain name/index.html#web-group or domain name/index.html or just domain name

        The URL is updated automatically as pages are selected by icon or menu selection.  The link may be copied and saved off for direct access at a later time.

        There are two debugging aids built into the code. By default, they are commented out. They can be enabled by removing the block comment tokens /* and */ surrounding the two anchor declarations.  Both commands can be enabled together or separately.  The Toggle-Phone command toggles the isPhone variable and calls debug-page to display the isPhone state along with other information.  Setting the isPhone variable to true forces the application to run as it would on a small screen device.  The Debug command displays a page with various debugging information.  The comments and code appear in the current version in lines 42 through 58.  When enabled, two menu items (Toggle-phone and Debug) appear at the extreme right end of the nav bar.
