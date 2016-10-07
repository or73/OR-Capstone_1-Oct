/**
  SERVER
*/

Meteor.startup(function() 
              {

                // code to run on server at startup
                console.log('* * * * * * * * * * * * * * * *');
                console.log('*   Server is Up & Running    *');
                console.log('* * * * * * * * * * * * * * * *');
                
                return myData.allow({
                                      insert: function(userId, file) 
                                              {
                                                var ref;
                                                file.metadata = (ref = file.metadata) != null ? ref : {};
                                                file.metadata._auth = {
                                                                        owner: userId
                                                                      };
                                                return true;
                                              },
                                      remove: function(userId, file) 
                                              {
                                                var ref, ref1;
                                                if (((ref = file.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0) && userId !== file.metadata._auth.owner) 
                                                {
                                                  return false;
                                                }
                                                return true;
                                              },
                                      read: function(userId, file) 
                                            {
                                              var ref, ref1;
                                              if (((ref = file.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0) && userId !== file.metadata._auth.owner) 
                                              {
                                                return false;
                                              }
                                              return true;
                                            },
                                      write: function(userId, file, fields) 
                                              {
                                                var ref, ref1;
                                                if (((ref = file.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0) && userId !== file.metadata._auth.owner) 
                                                {
                                                  return false;
                                                }
                                                return true;
                                              }
                                    });
              });

Meteor.publish('documents', 
                function()
                {
                  return Documents.find({
                                            $or: [
                                                    { private: { $ne: true } },
                                                    { owner: this.userId }
                                                  ]
                                          });
                });

Meteor.publish('allData', 
                function(clientUserId) 
                {
                  if (this.userId === clientUserId) 
                  {
                    return myData.find({
                                          'metadata._Resumable': {
                                                                    $exists: false
                                                                  },
                                          'metadata._auth.owner': this.userId
                                        });
                  } else 
                  {
                    return [];
                  }
                });

Meteor.users.deny({
                    update: function() 
                            {
                              return true;
                            }
                  });

Meteor.methods ({
          addDoc: function(fileName, fileId)
              {
                console.log("addDoc (methods.js) - fileName: ", fileName);
                console.log("addDoc (methods.js): - fileId: ", fileId);
                console.log("addDoc (methods.js): - this: ", this);
                var userId = this.userId;

                Documents.insert({
                            title: fileName,
                            fileId: fileId,
                            createdAt: new Date(),
                            owner: userId
                          });
                
                var document = Documents.find({'owner': userId});
                console.log("addDoc (methods.js): - userId: ", userId);
                console.log("addDoc (methods.js) - Document Inserted: ", document);
              },

          deleteDoc: function(id)
                {
                  var res = Documents.findOne(id);

                  if (res.owner !== Meteor.userId())
                  {
                    throw new Meteor.Error('not-authorized to perform this action (delete)')
                  }

                  Documents.remove(id);
                },

          updateDoc: function(id, checked)
                  {
                    var res = Documents.findOne(id);

                    if (res.owner !== Meteor.userId())
                    {
                      throw new Meteor.Error('not-authorized to perform this action (update)')
                    }
                    Documents.update(id,
                                    {
                                        $set: {
                                                checked: checked
                                            }
                                    });
                  },

          setPrivate: function(id)
                {
                  console.log("setPrivate (methods.js) - id: ", id);
                  
                  var doc = Documents.findOne(id);
                  console.log("setPrivate (methods.js) - doc: ", doc);
                  var privateVar = true;// !doc.private;

                  //console.log("setPrivate (methods.js) - private: ", privateVar);

                  if (doc.owner != Meteor.userId())
                  {
                    throw new Meteror.error('You are not authorized to perform this action (setPrivate)');
                  }
                  Documents.update(id, {$set: {private: privateVar}});
                }
        });
