#!/bin/bash
# Installs all PMS UI charts
## Usage: ./install.sh [kubeconfig]

if [ $# -ge 1 ] ; then
  export KUBECONFIG=$1
fi

NS=pms
CHART_VERSION=0.0.1-develop
COPY_UTIL=../copy_cm_func.sh

echo Create $NS namespace
kubectl create ns $NS

function installing_pmp_ui() {
  echo Istio label
  kubectl label ns $NS istio-injection=enabled --overwrite
  helm repo update

  echo Copy configmaps
  $COPY_UTIL configmap global default $NS
  $COPY_UTIL configmap config-server-share config-server $NS

  INTERNAL_API_HOST=$(kubectl get cm global -o jsonpath={.data.mosip-api-internal-host})
  PMP_UI_HOST=$(kubectl get cm global -o jsonpath={.data.mosip-pmp-host})

  PARTNER_MANAGER_SERVICE_NAME="pms-partner"
  POLICY_MANAGER_SERVICE_NAME="pms-policy"

  echo Installing pmp-ui-v2
  helm -n $NS install pmp-ui-v2 mosip/pmp-ui-v2 \
  --set pmp_uiv2.react_app_partner_manager_api_base_url="https://$INTERNAL_API_HOST/v1/partnermanager" \
  --set pmp_uiv2.react_app_policy_manager_api_base_url="https://$INTERNAL_API_HOST/v1/policymanager" \
  --set pmp_uiv2.pms_partner_manager_internal_service_url="http://$PARTNER_MANAGER_SERVICE_NAME.$NS/v1/partnermanager" \
  --set pmp_uiv2.pms_policy_manager_internal_service_url="http://$POLICY_MANAGER_SERVICE_NAME.$NS/v1/policymanager" \
  --set istio.hosts=["$PMP_UI_HOST"] --version $CHART_VERSION

  kubectl -n $NS  get deploy -o name |  xargs -n1 -t  kubectl -n $NS rollout status

  echo Installed pmp-ui-v2 services

  return 0
}

# set commands for error handling.
set -e
set -o errexit   ## set -e : exit the script if any statement returns a non-true return value
set -o nounset   ## set -u : exit the script if you try to use an uninitialised variable
set -o errtrace  # trace ERR through 'time command' and other functions
set -o pipefail  # trace ERR through pipes
installing_pmp_ui   # calling function
