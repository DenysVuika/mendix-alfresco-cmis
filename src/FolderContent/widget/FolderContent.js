/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, btoa, alert */
/*mendix */

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
    packages: [{ name: 'jquery', location: '../../widgets/FolderContent/lib', main: 'jquery-1.11.2.min' }]
}, [
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text',
    'jquery', 'dojo/text!FolderContent/widget/template/FolderContent.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, $, widgetTemplate) {
    'use strict';
  
    var _serverUrl = null;
    var _currentFolder = null;
    var _auth = null;
  
    function handleError (jqXHR, textStatus, errorThrown) {
      alert('error getting cmis content');
    }
  
    // Declare widget's prototype.
    return declare('FolderContent.widget.FolderContent', [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        cmisServerUrl: "",
        cmisServerLogin: "",
        cmisServerPassword: "",
        cmisRootFolder: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handle: null,
        _contextObj: null,
        _objProperty: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._objProperty = {};
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + '.postCreate');
            this.cmisContent = $('.cmis-folder-content');
            this._setupEvents();
            this._setupUpload();
        },
      
        _setupUpload: function () {
          var form = $('.cmis-upload-form', this.domNode);
          var formFile = $('.cmis-upload-file', form);
          form.on('submit', function (e) {
            e.preventDefault();
            if (formFile.length > 0 && formFile[0].files.length > 0) {
              var file = formFile[0].files[0];
              var data = new FormData();
              data.append('cmisaction', 'createDocument');
              data.append('propertyId[0]', 'cmis:name');
              data.append('propertyValue[0]', file.name);
              data.append('propertyId[1]', 'cmis:objectTypeId');
              data.append('propertyValue[1]', 'cmis:document');
              data.append('file', file);
              
              $.ajax({
                url: _serverUrl + '/alfresco/api/-default-/public/cmis/versions/1.1/browser' + _currentFolder,
                method: 'POST',
                headers: _auth,
                data: data,
                processData: false,
                contentType: false,
                enctype: 'multipart/form-data',
                success: function (res) {
                  formFile.val('');
                  this._listFolder();
                }.bind(this),
                error: function (xhr, status, ex) {
                  alert(xhr.responseJSON.message || 'Error uploading document.');
                }
              });
            }
          }.bind(this));
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + '.update');

            this._contextObj = obj;
            _serverUrl = this._contextObj ? this._contextObj.get(this.cmisServerUrl) : "";
            var login = this._contextObj ? this._contextObj.get(this.cmisServerLogin) : "";
            var password = this._contextObj ? this._contextObj.get(this.cmisServerPassword) : "";
            _currentFolder = this._contextObj ? this._contextObj.get(this.cmisRootFolder) : "";
            // using basic auth for testing purposes only
            _auth = {"Authorization": "Basic " + btoa(login + ":" + password)};
          
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
          var emitter = document;
          emitter.addEventListener('cmisMessage', this._onCmisMessageReceived.bind(this));
        },
      
      _onCmisMessageReceived: function (e) {
        var msg = e.detail;
        if (msg && msg.action) {
          if (msg.action === 'setFolder') {
            _currentFolder = msg.value;
            this._listFolder();
          }
        }
      },
      
      _listFolder: function () {        
        
        /*function handleError (jqXHR, textStatus, errorThrown) {
          alert('error getting cmis content');
        }*/
        
        function renderFolderEntries(folderUrl, data) {
          var output = $('.cmis-folder-content'),
              ul = $('<ul class="list-group">');
          output.empty();
          
          if (data.length === 0) {
            output.append($('<h3><i class="fa fa-folder-open-o"><i> The folder is empty</h3>'));
            return;
          }
          
          data.forEach(function (entry) {
            var li = $('<li class="list-group-item">'),
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
            
            if (objType === 'cmis:document') {
              var downloadLink = folderUrl + '/' + name;
              var download = $('<a class="pull-right" target="_self" href="' + downloadLink + '" download="' + name +'"><i class="fa fa-download"></i></a>');
              li.append(download);
            }
            
            ul.append(li);
          });
          
          output.append(ul);
        }
        
        $.ajax({
            url: _serverUrl + '/alfresco/cmisbrowser',
            type: 'GET',
            headers: _auth,
            success: function (data, textStatus, jqXHR) {
              var keys = Object.keys(data),
                  repoId = null;
              if (keys.length > 0) {
                repoId = data[keys[0]].repositoryId;
              }

              if (repoId) {
                var folderUrl = _serverUrl + '/alfresco/cmisbrowser/' + repoId + _currentFolder;
                $.ajax({
                  url: folderUrl,
                  type: 'GET',
                  headers: _auth,
                  success: function (data) {
                    renderFolderEntries(folderUrl, data.objects || []);
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
        
        var emitter = document;
        emitter.removeEventListener('cmisMessage', this._onCmisMessageReceived);
      }
    });
});
