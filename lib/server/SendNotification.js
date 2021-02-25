const fetch = require('isomorphic-fetch');

module.exports = function send(to, content) {
  const {
    title, body, image, url,
  } = content;

  fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: 'key=AAAAJv0rZbw:APA91bGnaLO5-hPfN45LNH1xhvwUbjHHinhk-N4nA4jf1ylEyBNmvEiv2m9XAfok52CFTeKgQ7B5yC30MT8IjHtsbhfKDqZ7fcbj7MlVKZfJkafvh2pa3vuHaCHLWhaf62NW3dTfQ-R6',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notification: {
        title,
        body,
        icon: image,
        click_action: url,
      },
      to,
    }),
  })
    .then((req) => req.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
};
