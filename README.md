# tssg-mongoTest

### The tssg htmlImport project (see below) is being used as a base web site to study Node and MongoDB implementations.  We are looking into adding node based javascript to add the following features:
            - automated scheduling
            - user testimonials
            - TSSG member database
            - Authentication / administration capabilites

### <span style="color:yellow">Additional documentation will follow as development progresses.</span>

# tssg-htmlImport

## &nbsp;&nbsp;&nbsp;&nbsp;Home page is accessed via index.html

## &nbsp;&nbsp;&nbsp;&nbsp;Specific pages may be directly called by adding a hash value to the URL :
### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\#name where page name is one of the following :
            - web-group
            - mobile-group
            - quality-group
            - data-group
            - devops-group
            - calendar-page
            - home-page (home page is the defaul for no href parameter)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;example: domaine name/index.html#web-group

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The URL is updated automatically as pages are selected by icon or menu selection.  The link may be copied and saved off for direct access at a later time.

### There are two debugging aids built into the code. By default, they are commented out. They can be enabled by removing the block comment tokens > > surrounding the two anchor declarations.  Both commands can be enabled together or separately.  The Toggle-Phone command toggles the isPhone variable and calls debug-page to display the isPhone state along with other information.  Setting the isPhone variable to true forces the application to run as it would on a small screen device.  The Debug command displays a page with various debugging information.  The comments and code appear in the current version in lines 42 through 58.  When enabled, two menu items (Toggle-phone and Debug) appear at the extreme right end of the nav bar.
