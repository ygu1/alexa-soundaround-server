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
        stream: {
          M: {
            url: {
              S: item.stream.url
            },
            token: {
              S: item.stream.token
            },
            offsetInMilliseconds: {
              N: item.stream.offsetInMilliseconds
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
      Key: {
        userId: {
          S: item.userId
        }
      },
      AttributeUpdates: {
        stream: {
          Action: 'PUT',
          Value: {
            M: {
              url: {
                S: item.stream.url
              },
              token: {
                S: item.stream.token
              },
              offsetInMilliseconds: {
                N: item.stream.offsetInMilliseconds
              }
            }
          }
        }
      },
      TableName: tableName,
      ReturnValues: 'ALL_NEW'
    };
    dynamodb.updateItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
