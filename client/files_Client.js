/**
  CLIENT
*/
var shorten, truncateId;

Meteor.startup(function() 
              {
                myData.resumable
                  .on('fileAdded', 
                      function(file) 
                      {
                        Session.set(file.uniqueIdentifier, 0);
                        return myData.insert({
                                              _id: file.uniqueIdentifier,
                                              filename: file.fileName,
                                              contentType: file.file.type
                                            }, 
                                            function(err, _id) 
                                            {
                                              if (err) 
                                              {
                                                console.warn("File creation failed!", err);
                                                return;
                                              }
                                              return myData.resumable.upload();
                                            });
                      });
                myData.resumable
                  .on('fileProgress', 
                      function(file) 
                      {
                        return Session.set(file.uniqueIdentifier, Math.floor(100 * file.progress()));
                      });
                myData.resumable
                  .on('fileSuccess', 
                      function(file) 
                      {
                        return Session.set(file.uniqueIdentifier, void 0);
                      });
                return myData.resumable
                        .on('fileError', 
                            function(file) 
                            {
                              console.warn("Error uploading", file.uniqueIdentifier);
                              return Session.set(file.uniqueIdentifier, void 0);
                            });
              });

Tracker.autorun(function() 
                {
                  var userId;
                  userId = Meteor.userId();
                  Meteor.subscribe('allData', userId);
                  return $.cookie('X-Auth-Token', 
                                  Accounts._storedLoginToken(), 
                                  {
                                    path: '/'
                                  });
                });

shorten = function(name, w) 
          {
            if (w == null) 
            {
              w = 16;
            }
            w += w % 4;
            w = (w - 4) / 2;
            if (name.length > 2 * w) 
            {
              return name.slice(0, +w + 1 || 9e9) + '…' + name.slice(-w - 1);
            } else {
              return name;
            }
          };

truncateId = function(id, length) 
            {
              if (length == null) 
              {
                length = 6;
              }

              if (id) 
              {
                if (typeof id === 'object') 
                {
                  id = "" + (id.valueOf());
                }
                return (id.substr(0, 6)) + "…";
              } else {
                return "";
              }
            };

Template.registerHelper("truncateId", truncateId);



/* * * * * * * * * * * * * * * * * * * *
          TEMPLATE - filesList
 * * * * * * * * * * * * * * * * * * * */
Template.filesList
  .onRendered(function() 
              {
                myData.resumable.assignDrop($('.fileDrop'));
              });

Template.filesList
  .events({
            'click .del-file': function(e, t) 
            {
              if (Session.get("" + this._id)) 
              {
                console.warn("Cancelling active upload to remove file! " + this._id);
                myData.resumable.removeFile(myData.resumable.getFromUniqueIdentifier("" + this._id));
              }
              return myData.remove({
                                    _id: this._id
                                  });
            }
          });

Template.filesList
  .helpers({
              dataEntries: function() 
                          {
                            return myData.find({});
                          },

              shortFilename: function(w) 
                            {
                              var ref;
                              if (w == null) 
                              {
                                w = 16;
                              }

                              if ((ref = this.filename) != null ? ref.length : void 0) 
                              {
                                return shorten(this.filename, w);
                              } else {
                                return "(no filename)";
                              }
                            },

              owner: function() 
                    {
                      var ref, ref1;
                      console.log("owner: ", this);
                      return (ref = this.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0;                      
                    },

              ownerName: function()
                        {
                          console.log("ownerName - Meteor.user(): ", Meteor.user());
                          console.log("ownerName - Meteor.user().username: ", Meteor.user().username);
                            
                          if (Meteor.user())
                            return Meteor.user().username;
                          return false;                          
                        },

              id: function() 
                  {
                    return "" + this._id;
                  },

              link: function() 
                    {
                      return myData.baseURL + "/md5/" + this.md5;
                    },

              uploadStatus: function() 
                            {
                              var percent;
                              percent = Session.get("" + this._id);
                              if (percent == null) 
                              {
                                return "Processing...";
                              } else {
                                return "Uploading...";
                              }
                            },

              formattedLength: function() 
                              {
                                return numeral(this.length).format('0.0b');
                              },

              uploadProgress: function() 
                              {
                                var percent;
                                return percent = Session.get("" + this._id);
                              },

              isImage: function() 
                      {
                        var types;
                        types = {
                                  'image/jpeg': true,
                                  'image/png': true,
                                  'image/gif': true,
                                  'image/tiff': true
                                };
                        return (types[this.contentType] != null) && this.md5 !== 'd41d8cd98f00b204e9800998ecf8427e';
                      },

              csvFile: function()
                      {
                        var FileExtension, csv;

                        csv = { 'csv': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (csv[fileExtension])
                          return true;
                      },

              excelFile: function()
                      {
                        var fileExtension, excel;

                        
                        excel = { 'xlsx': true, 'xsl': true};
                        
                        fileExtension = (this.filename).split('.').pop();
                        
                        if (excel[fileExtension])
                          return true;
                      },

              jsonFile: function()
                      {
                        var FileExtension, json;

                        json = { 'json': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (json[fileExtension])
                          return true;
                      },

              pdfFile: function()
                      {
                        var fileExtension, pdf;

                        pdf = { 'pdf': true };

                        fileExtension = (this.filename).split('.').pop();

                        if (pdf[fileExtension])
                          return true;
                      },

              ppointFile: function()
                      {
                        var fileExtension, ppoint;

                        ppoint = { 'pptx': true, 'ppt': true};
                        
                        fileExtension = (this.filename).split('.').pop();

                        if (ppoint[fileExtension])
                          return true;
                      },

              txtFile: function()
                      {
                        var FileExtension, txt;

                        txt = { 'txt': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (txt[fileExtension])
                          return true;
                      },

              wordFile: function()
                      {
                        var fileExtension, word;
                        
                        word = { 'doc': true, 'docx': true};

                        fileExtension = (this.filename).split('.').pop();

                        if (word[fileExtension])
                          return true;
                      },

              noneFile: function()
                      {
                        var fileExtension, types;

                        fileExtension = (this.filename).split('.').pop();

                        types = {
                                  'jpg': true,
                                  'jpeg': true,
                                  'png': true,
                                  'gif': true,
                                  'tiff': true,
                                  'xlsx': true,
                                  'xsl': true,
                                  'pdf': true,
                                  'pptx': true,
                                  'ppt': true,
                                  'doc':true
                                };

                        if (!types[fileExtension])
                          return true;
                        return false;
                      },

              loginToken: function() 
                          {
                            Meteor.userId();
                            return Accounts._storedLoginToken();
                          },

              userId: function() 
                      {
                        return Meteor.userId();
                      }
            });



/* * * * * * * * * * * * * * * * * * * *
          Accounts Config
 * * * * * * * * * * * * * * * * * * * */

Accounts.ui.config({
                        passwordSignupFields: "USERNAME_AND_EMAIL"
                    });
