# PortfolioCMS
PortfolioCMS is a content management system that allows users to dynamically create and edit pages to display their work.  
Portfolio CMS is mainly designed for those showing off graphical work.

# Screen Shots
![An example page.](https://i.imgur.com/cHXq1yP.png)
![Main admin page](https://i.imgur.com/TUMwJkT.png)
![Admin page for editing pages.](https://i.imgur.com/xCJ9bir.png)

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

### 2) Setting up PortfolioCMS
As of PortfolioCMS 1.0.0-BETA-RC1, a setup.js script is included to make this process easier and the source code smaller.  
To begin the setup run the following command: *(This proccess will take several minutes when ran for the first time)*
```
node setup.js
```
PortfolioCMS will automaticaly install all required dependencies and move them into the public folder for use.  
*There is no need to run `npm install` at all; however, npm must still be installed.*

### 3) Configure the envrionments.json file.
This step takes place inside the PortfolioCMS folder.  
The setup script automatically created an `environments.json` file. (Please ignore the `environments.json.default` file).  
Please configure the file to fit your needs before starting PortfolioCMS. (It is recommended to enable https).  
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
Your server is now running on the port you specified in the `environments.json` file. *(Currently only runs on port 8080)*

# Licenses
This project uses many libraries to accomplish its goals. **These libraries are no longer included in the source as of 1.0.0-BETA-RC1**
- [Bootstrap is licensed under MIT](https://github.com/twbs/bootstrap/blob/main/LICENSE)
- [Feather is licensed under MIT](https://github.com/feathericons/feather/blob/master/LICENSE)
- [The Monaco Editor is licensed under MIT](https://github.com/microsoft/monaco-editor/blob/master/LICENSE.md)
  
Please see the package.json file for more libaries that are used (but not included in the source code).  
