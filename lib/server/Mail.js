const mailjet = require('node-mailjet');

class Mail {
  constructor(db) {
    const { MAILJET_API_KEY, MAILJET_SECRET_KEY } = process.env;

    this.db = db;
    this.sender = mailjet.connect(MAILJET_API_KEY, MAILJET_SECRET_KEY);
  }
  /**
   * Send Email
   *
   * @param {Object} data
   * @param {Array} contacts
   * @param {Number} TemplateID
   *
   */
  async sendEmail(data, contacts, templateID) {
    try {
      const template = await this.getTemplate(templateID);

      return new Promise((resolve, reject) => {
        const req = this.sender.post('send', {
          version: '3.1',
        }).request({
          Messages: contacts.map((e) => {
            const mailData = {
              From: {
                Email: 'djgm1206@gmail.com',
                Name: 'David',
              },
              To: [
                {
                  Email: e.email,
                  Name: e.name,
                },
              ],
              Subject: 'Greetings from Mailjet.',
              HTMLPart: template.html.replace(/%NAME%/g, e.name)
                .replace(/%LASTNAME%/g, e.lastname)
                .replace(/%EMAIL%/g, e.email)
                .replace(/%VERIFY_URL%/g, `https://davidsdevel-blog-test.herokuapp.com/v/${Buffer.from(e.email).toString('hex')}/?key=${bcrypt.hashSync(e.email, 10)}`),
            };
          }),
        });

        req.then((e) => {
          console.log(e)
          resolve(e)
        });

        req.catch((err) => reject(err));
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getTemplate(ID) {
    try {
      const template = this.db.getTemplate(ID);

      return Promise.resolve(template);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Mail;
