# PortfolioCMS
PortfolioCMS is a content management system that allows users to dynamically create and edit pages to display their work.  
Portfolio CMS is mainly designed for those showing off graphical work.

# Screen Shots

# Installation
***Notice: PortfolioCMS is currently not ready for production use. Please do not install this yet.***  
This installation proccess assumes that you have a server with node and npm pre-installed.  
This is a quick quide, for a more detailed installation guide please see [this page]().

### 1) Download the source code.
The source code can be obtained in two ways, via git or through the release tab.  

#### Git
To install PortfolioCMS using git all you need to do is run the following command on your server:
```
git clone https://github.com/ryandw11/PortfolioCMS.git
```
#### Release
To install PortfolioCMS using releases you must go [here]() and download the latest verion from the sources section. (Will be a .zip file).  
Then unzip the file and upload it to your server.  

### 2) Downloading dependencies
Open up the PortfolioCMS folder you just uploaded to your server in the terminal.  
Then run the following command:
```
npm install
```
That will download all of the dependencies that PortfolioCMS requires.  

### 3) Configure the envrionments.json file.
This step takes place inside the PortfolioCMS folder.
Inside will be a file named `environments.json.default`. Duplicate the file and rename the duplicate to `environments.json`.  
Then configure the file to fit your needs. (It is recommended to enable https).  
Be certain to change the default username and password to something secure.  
  
[For a complete guide on configuring the environments.json file please click here]()

### 4) Customize the theme.
This step is only if you don't want to keep the default theme.
[Please see this page for information on editing the theme]()

### 5) Starting the PortfolioCMS
Now that PortfolioCMS is configured, start the server from the terminal by using the following command:
```
node index.js
```
Your server is now running on the port you specified in the `environments.json` file.

# Licenses
This project uses many libraries to accomplish its goals. The following libraries are included in the source code for easier installation and development:
- [Bootstrap is licensed under MIT](https://github.com/twbs/bootstrap/blob/main/LICENSE)
- [Feather is licensed under MIT](https://github.com/feathericons/feather/blob/master/LICENSE)
- [The Monaco Editor is licensed under MIT](https://github.com/microsoft/monaco-editor/blob/master/LICENSE.md)
  
Please see the package.json file for more libaries that are used (but not included in the source code).  
