/**
  SERVER
*/

Meteor.startup(function() 
              {

                // code to run on server at startup
                console.log('* * * * * * * * * * * * * * * *');
                console.log('*   Server is Up & Running    *');
                console.log('* * * * * * * * * * * * * * * *');
                
                Meteor.publish('documents', 
                                function()
                                {
                                  return Resolutions.find({
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
