/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, btoa, alert */
/*mendix */
/*
    Hello World
    ========================

    @file      : Hello World.js
    @version   : 1.0.0
    @author    : Denis Vuyka
    @date      : Fri, 17 Apr 2015 05:58:15 GMT
    @copyright : Denis Vuyka
    @license   : MIT

    Documentation
    ========================
    Demonstrates basic integration with Alfresco server via CMIS.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
    packages: [{ name: 'jquery', location: '../../widgets/Hello World/lib', main: 'jquery-1.11.2.min' }]
}, [
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text',
    'jquery', 'dojo/text!Hello World/widget/template/Hello World.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, $, widgetTemplate) {
    'use strict';
  
    // Declare widget's prototype.
    return declare('Hello World.widget.Hello World', [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        cmisServerUrl: "",
        cmisServerLogin: "",
        cmisServerPassword: "",
        cmisRootFolder: "",
        mfLoadData: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handle: null,
        _contextObj: null,
        _objProperty: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._objProperty = {};
            this.btnLoadData = null;
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + '.postCreate');
            this.btnLoadData = $('.cmis-btn-load');
            this.cmisContent = $('.cmis-content');
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + '.update');

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();
            this._listFolder();
          
            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {

        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {

        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {

        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },
              
        _setupEvents: function () {          
          
        },
      
      _listFolder: function () {
        var cmisServerUrl = this._contextObj ? this._contextObj.get(this.cmisServerUrl) : "",
            cmisServerLogin = this._contextObj ? this._contextObj.get(this.cmisServerLogin) : "",
            cmisServerPassword = this._contextObj ? this._contextObj.get(this.cmisServerPassword) : "",
            cmisRootFolder = this._contextObj ? this._contextObj.get(this.cmisRootFolder) : "",
            headers = {"Authorization": "Basic " + btoa(cmisServerLogin + ":" + cmisServerPassword)};
        
        function handleError (jqXHR, textStatus, errorThrown) {
          alert('error getting cmis content');
        }
        
        function renderFolderEntries(data) {
          var ul = $('<ul class="cmis-entry-list">'),
              output = $('.cmis-content');
          output.empty();
          
          data.forEach(function (entry) {
            var li = $('<li>'),
                props = entry.object.properties,
                objType = props['cmis:objectTypeId'].value,
                name = props['cmis:name'].value,
                icon = null;
            
            if (objType === 'cmis:folder') {
              icon = $('<i class="fa fa-folder-o">');
            } else if (objType === 'cmis:document') {
              icon = $('<i class="fa fa-file-text-o">');
            } else {
              icon = $('<i class="fa fa-file-o">');
            }
            
            li.append(icon);
            li.append(' ' + name);
            ul.append(li);
          });
          
          output.append(ul);
        }
        
        $.ajax({
            url: cmisServerUrl + '/alfresco/cmisbrowser',
            type: 'GET',
            headers: headers,
            success: function (data, textStatus, jqXHR) {
              var keys = Object.keys(data),
                  repoId = null;
              if (keys.length > 0) {
                repoId = data[keys[0]].repositoryId;
              }

              if (repoId) {
                $.ajax({
                  url: cmisServerUrl + '/alfresco/cmisbrowser/' + repoId + cmisRootFolder,
                  type: 'GET',
                  headers: headers,
                  success: function (data) {
                    renderFolderEntries(data.objects || []);
                  },
                  error: handleError
                });
              }

            },
            error: handleError
          });
        },

        _updateRendering: function () {},
        _resetSubscriptions: function () {
            // Release handle on previous object, if any.
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObj) {
                this._handle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: this._updateRendering
                });
            }
        }
    });
});
