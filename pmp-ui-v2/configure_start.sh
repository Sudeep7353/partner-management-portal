#!/bin/bash

#installs the pre-requisites.
set -e

# echo "Downloading pre-requisites started."

# i18n bundle
# echo "Downloading i18n bundle files"
# wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/i18n/pmp-uiv2-i18n-bundle.zip -O $i18n_path/pmp-uiv2-i18n-bundle.zip

# echo "unzip i18n bundle files.."
# chmod 775 $i18n_path/*

# cd $i18n_path
# unzip -o pmp-uiv2-i18n-bundle.zip
# rm pmp-uiv2-i18n-bundle.zip

# echo "Pre-requisites download completed."

echo "Replacing public url placeholder with public url"

workingDir=$nginx_dir/html
rpCmd="s/_PUBLIC_URL_//g"
grep -rl '_PUBLIC_URL_' $workingDir | xargs sed -i $rpCmd

echo "Replacing completed."

echo "generating env-config file"

echo "window._env_ = {" > ${workingDir}/env-config.js
awk -F '=' '{ print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' ${workingDir}/env.env >> ${workingDir}/env-config.js
echo "}" >> ${workingDir}/env-config.js

echo "generation of env-config file completed!"

exec "$@"
