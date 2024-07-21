# Azure Template

```shell

az appservice plan create \
  --resource-group rg-pro-pretorian \
  --location westeurope \
  --name sp-pro-pretorian-system \
  --is-linux \
  --sku F1

az webapp create \
  --resource-group rg-pro-pretorian \
  --plan sp-pro-pretorian-system \
  --name pro-pretorian-system \
  --runtime "NODE:20-lts" \
  --startup-file "node server.js"


az webapp deployment list-publishing-profiles \
  --resource-group rg-pro-pretorian \
  --name pro-pretorian-system \
  --xml > publishProfile.xml

```
