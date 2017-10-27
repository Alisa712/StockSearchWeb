#!/bin/bash
sudo yum update | y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 5.0
nvm use 5.0
node -e "console.log('Running Node.js ' + process.version)"
sudo yum install git | y
sudo iptables -A INPUT -p tcp -m tcp --sport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo python -m SimpleHTTPServer 80
# TO DEbug port: https://stackoverflow.com/questions/36732875/cant-connect-to-public-ip-for-ec2-instance