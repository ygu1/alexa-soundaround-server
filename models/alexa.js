import _ from 'underscore';
import settings from '../settings';
import awsModel from './aws';

const soundList = settings.soundList;

module.exports = (alexaApp) => {
  alexaApp.launch(async (req, res) => {
    res.say('welcome to the sound around.');
    res.say('I have the following sound effects');
    _.each(Object.keys(soundList), (sound, idx) => {
      res.say(`${idx + 1}, ${sound}. `);
    });
    res.say('which one you want to play?').shouldEndSession(false);
    return res.send();
  });

  alexaApp.dictionary = { sound: ['rain', 'wind', 'fire'] };

  alexaApp.intent('playIntent', {
    slots: { SOUND : 'LITERAL' },
    utterances: [
      '{sound|SOUND}',
      'play the {sound|SOUND} sound'
    ]
  }, async (req, res) => {
    const sound = req.slot('SOUND');
    const userId = req.getSession().details.userId;
    if (_.isEmpty(soundList[sound])) {
      res.say(`Sorry, I can not find ${sound} sound, please try others.`).shouldEndSession(false);
      return res.send();
    }
    const url = soundList[sound][0];
    const token = `${sound}-01`;
    res.say(`Ok, play the ${sound} sound.`);
    const streamData = {
      url,
      token,
      offsetInMilliseconds: '0'
    };
    try {
      await awsModel.updateItem({ userId, streamData });
    } catch (e) {
      console.log(e);
    }
    res.audioPlayerPlayStream('REPLACE_ALL', streamData);
    return res.send();
  });

  alexaApp.intent('listIntent', {
    utterances: [
      'list all sound effects',
      'show me the list'
    ]
  }, (req, res) => {
    res.say('I have the following sound effects');
    _.each(Object.keys(soundList), (sound, idx) => {
      res.say(`${idx + 1}, ${sound}. `);
    });
    res.say('which one you want to play?').shouldEndSession(false);
    return res.send();
  });

  alexaApp.audioPlayer('PlaybackNearlyFinished', (req, res) => {
    if (!_.isEmpty(req.context.AudioPlayer)) {
      const token = req.context.AudioPlayer.token;
      const sound = token.split('-')[0];
      const index = parseInt(token.split('-')[1], 10) - 1;
      const url = soundList[sound][index];
      const streamData = {
        url,
        token,
        expectedPreviousToken: token,
        offsetInMilliseconds: 0
      };
      res.audioPlayerPlayStream('ENQUEUE', streamData);
    }
    return res.send();
  });

  alexaApp.intent('AMAZON.ResumeIntent', async (req, res) => {
    const userId = req.getSession().details.userId;
    let streamData = {};
    try {
      streamData = await awsModel.getItemByUserId(userId);
    } catch (e) {
      console.log(e);
    }
    if (_.isEmpty(streamData)) {
      res.say('You don\'t have any paused sound.').shouldEndSession(true);
    } else {
      const stream = {
        url: streamData.Item.streamData.M.url.S,
        token: streamData.Item.streamData.M.token.S,
        offsetInMilliseconds: streamData.Item.streamData.M.offsetInMilliseconds.N
      };
      res.audioPlayerPlayStream('REPLACE_ALL', stream);
    }
    return res.send();
  });

  alexaApp.intent('AMAZON.PauseIntent', async (req, res) => {
    const userId = req.getSession().details.userId;
    if (!_.isEmpty(req.context) && !_.isEmpty(req.context.AudioPlayer)) {
      const token = req.context.AudioPlayer.token;
      const sound = token.split('-')[0];
      const index = parseInt(token.split('-')[1], 10) - 1;
      const url = soundList[sound][index];
      const offsetInMilliseconds = req.context.AudioPlayer.offsetInMilliseconds.toString();
      const streamData = {
        url,
        token,
        offsetInMilliseconds
      };
      try {
        await awsModel.updateItem({ userId, streamData });
      } catch (e) {
        console.log(e);
      }
    }
    res.audioPlayerStop().shouldEndSession(true);
    // res.audioPlayerClearQueue('CLEAR_ALL').shouldEndSession(true);
    return res.send();
  });

  alexaApp.intent('AMAZON.StopIntent', (req, res) => {
    res.audioPlayerClearQueue('CLEAR_ALL');
    res.say('The sound around has been ended, thanks for using it.').shouldEndSession(true);
    return res.send();
  });

  alexaApp.intent('AMAZON.CancelIntent', (req, res) => {
    res.audioPlayerClearQueue('CLEAR_ALL');
    res.say('The sound around has been ended, thanks for using it.').shouldEndSession(true);
    return res.send();
  });

  alexaApp.intent('AMAZON.HelpIntent', (req, res) => {
    res.say('Here are the tips how to use sound around.');
    res.say('if you want to play any sound effect, for example, you can say: play the rain sound.');
    res.say('if you want to know the sound effect list I have, for example, you can say: list all sound effects.');
    res.say('if you want to stop the sound effect, for example, you can say: cancel.');
    res.say('what can I do for you now?');
    return res.shouldEndSession(false).send();
  });
};
