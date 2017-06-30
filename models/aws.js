import AWS from 'aws-sdk';
import settings from '../settings';

AWS.config.update({ region: settings.dynamodb.region });
const dynamodb = new AWS.DynamoDB();
const tableName = settings.dynamodb.tableName;

module.exports.getItemByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        userId: {
          S: userId
        }
      },
      TableName: tableName
    };
    dynamodb.getItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports.putItem = (item) => {
  return new Promise((resolve, reject) => {
    const params = {
      Item: {
        userId: {
          S: item.userId
        },
        streamData: {
          M: {
            url: {
              S: item.streamData.url
            },
            token: {
              S: item.streamData.token
            },
            offsetInMilliseconds: {
              N: item.streamData.offsetInMilliseconds
            }
          }
        }
      },
      TableName: tableName,
      ReturnConsumedCapacity: 'INDEXES'
    };
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports.deleteItem = (userId) => {
  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        userId: {
          S: userId
        }
      },
      TableName: tableName,
      ReturnValues: 'ALL_OLD'
    };
    dynamodb.deleteItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports.updateItem = (item) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        userId: {
          S: item.userId
        }
      },
      ExpressionAttributeValues: {
        ':val': {
          M: {
            url: {
              S: item.streamData.url
            },
            token: {
              S: item.streamData.token
            },
            offsetInMilliseconds: {
              N: item.streamData.offsetInMilliseconds
            }
          }
        }
      },
      UpdateExpression: 'set streamData = :val',
      ReturnValues: 'ALL_NEW'
      // AttributeUpdates: {
      //   streamData: {
      //     Action: 'PUT',
      //     Value: {
      //       M: {
      //         url: {
      //           S: item.streamData.url
      //         },
      //         token: {
      //           S: item.streamData.token
      //         },
      //         offsetInMilliseconds: {
      //           N: item.streamData.offsetInMilliseconds
      //         }
      //       }
      //     }
      //   }
      // },
    };
    dynamodb.updateItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
