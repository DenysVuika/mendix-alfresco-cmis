# mendix-alfresco-cmis
Simple Alfresco CMIS integration for Mendix widgets

## Overview
This is just a POC demonstrating the ease of Alfresco CMIS integration (via Browser binding and pure JavaScript) into Mendex widgets. Implementation is based on a standard ['Hello World'](https://world.mendix.com/display/howto50/Creating+a+Basic+Hello+World+Custom+Widget) widget. 

![widget1](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/widget_01.png)

![widget2](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/widget_02.png)

![widget3](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/widget_03.png)

## Prerequisites
Target Alfresco server must have CORS filters enabled and configured for **Access-Control-Allow-Origin** header. This can be done by uncommenting corresponding sections within '_{install-path}/tomcat/webapps/alfresco/WEB-INF/web.xml_'. For development purposes you can allow calls from all origins:

```xml
<init-param>
  <param-name>cors.allowOrigin</param-name>
  <param-value>*</param-value>
</init-param>
```

By default Alfresco web server runs on port 8080. You may want tuning project settings in Mendix Business Modeler to use other port:

![server-settings](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/server_settings.png)

## Mendix Business Modeler
Default domain model introduces only 4 attributes user can use with the widget: server url address, credentials (username/password) and folder path to display contents for.

![domain-model](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/domain_model.png)

For debugging purposes those fields are displayed on the widget, but can be easily removed later on:

![modeler1](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/modeler_01.png)

Modeler users can change corresponding attributes from within Properties pane, there should be a separate 'CMIS Settings' category:

![modeler2](https://github.com/DenisVuyka/mendix-alfresco-cmis/blob/master/images/modeler_02.png)
